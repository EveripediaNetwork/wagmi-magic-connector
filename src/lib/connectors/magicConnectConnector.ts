import type {
  InstanceWithExtensions,
  MagicSDKAdditionalConfiguration,
  MagicSDKExtensionsOption,
  SDKBase,
} from '@magic-sdk/provider'
import type { RPCProviderModule } from '@magic-sdk/provider/dist/types/modules/rpc-provider'
import type { EthNetworkConfiguration } from '@magic-sdk/types'
import type { Chain } from '@wagmi/core'
import { Magic } from 'magic-sdk'
import { normalizeChainId } from '../utils'
import { MagicConnector } from './magicConnector'

export interface MagicConnectorOptions {
  apiKey: string
  magicSdkConfiguration?: MagicSDKAdditionalConfiguration
  networks?: EthNetworkConfiguration[]
}

/**
 * Magic Connect Connector class used to connect to wallet using Magic Connect modal
 * This uses the modal UI from Magic itself and styles for it can be configured using
 * magic dashboard.
 *
 * @example
 * ```typescript
 * import { MagicConnectConnector } from '@magiclabs/wagmi-connector';
 * const connector = new MagicConnectConnector({
 *  options: {
 *     apiKey: YOUR_MAGIC_LINK_API_KEY, //required
 *    //...Other options
 *  },
 * });
 * ```
 * @see https://github.com/magiclabs/wagmi-magic-connector#-usage
 * @see https://magic.link/docs/connect/overview
 */

export class MagicConnectConnector extends MagicConnector {
  magic: InstanceWithExtensions<
    SDKBase,
    MagicSDKExtensionsOption<string>
  > | null

  constructor(config: { chains?: Chain[]; options: MagicConnectorOptions }) {
    super(config)
    this.magic = this.getMagicSDK()
  }

  /**
   * Get the Magic Instance
   * @throws {Error} if Magic API Key is not provided
   */
  getMagicSDK() {
    const { apiKey, magicSdkConfiguration, networks } = this.options
    if (typeof window === 'undefined') {
      return null
    }
    if (this.magic) return this.magic
    this.magic = new Magic(apiKey, {
      ...magicSdkConfiguration,
      network: magicSdkConfiguration?.network || networks?.[0],
    })
    return this.magic
  }

  /**
   * Connect method attempts to connects to wallet using Magic Connect modal
   * this will open a modal for the user to select their wallet
   */
  async connect() {
    await this.magic?.wallet.connectWithUI()
    const provider = await this.getProvider()
    const chainId = await this.getChainId()

    provider && this.registerProviderEventListeners(provider)

    const account = await this.getAccount()

    return {
      account,
      chain: {
        id: chainId,
        unsupported: false,
      },
      provider,
    }
  }

  /**
   * Provider events to run methods on various events
   * on user session
   */
  private registerProviderEventListeners(provider: RPCProviderModule) {
    if (provider.on) {
      provider.on('accountsChanged', this.onAccountsChanged)
      provider.on('chainChanged', this.onChainChanged)
      provider.on('disconnect', this.onDisconnect)
    }
  }

  /**
   * checks if user is authorized with Magic Connect
   */
  async isAuthorized() {
    try {
      const walletInfo = await this.magic?.wallet.getInfo()
      return !!walletInfo
    } catch {
      return false
    }
  }

  /**
   * method that switches chains given a chainId.
   * This only works when user provides multiple networks in options
   * @param chainId
   * @throws {Error} if chainId is not supported
   */
  async switchChain(chainId: number): Promise<Chain> {
    if (!this.options.networks) {
      throw new Error(
        'switch chain not supported: please provide networks in options',
      )
    }

    const normalizedChainId = normalizeChainId(chainId)
    const chain = this.chains.find((x) => x.id === normalizedChainId)
    if (!chain) throw new Error(`Unsupported chainId: ${chainId}`)

    const network = this.options.networks.find(
      (x: string | { chainId: string }) =>
        typeof x === 'object' && x.chainId
          ? normalizeChainId(x.chainId) === normalizedChainId
          : normalizeChainId(x as string) === normalizedChainId,
    )

    if (!network) throw new Error(`Unsupported chainId: ${chainId}`)

    const account = await this.getAccount()
    const provider = await this.getProvider()

    if (provider?.off) {
      provider.off('accountsChanged', this.onAccountsChanged)
      provider.off('chainChanged', this.onChainChanged)
      provider.off('disconnect', this.onDisconnect)
    }

    this.magic = new Magic(this.options.apiKey, {
      ...this.options.magicSdkConfiguration,
      network: network,
    })

    this.registerProviderEventListeners(this.magic.rpcProvider)
    this.onChainChanged(chain.id)
    this.onAccountsChanged([account])

    return chain
  }
}
