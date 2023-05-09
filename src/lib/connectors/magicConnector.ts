import { OAuthExtension, OAuthProvider } from '@magic-ext/oauth'
import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider'
import { Chain, Connector } from '@wagmi/core'

import { createWalletClient, custom, getAddress } from 'viem'
import { createModal } from '../modal/view'
import { normalizeChainId } from '../utils'

const IS_SERVER = typeof window === 'undefined'

export interface MagicOptions {
  apiKey: string
  accentColor?: string
  isDarkMode?: boolean
  customLogo?: string
  customHeaderText?: string
}

interface UserDetails {
  email: string
  phoneNumber: string
  oauthProvider: OAuthProvider
}

export abstract class MagicConnector extends Connector {
  ready = !IS_SERVER
  readonly id = 'magic'
  readonly name = 'Magic'
  isModalOpen = false
  magicOptions: MagicOptions

  protected constructor(config: { chains?: Chain[]; options: MagicOptions }) {
    super(config)
    this.magicOptions = config.options
  }

  async getAccount() {
    const provider = await this.getProvider()
    const accounts = await provider.request({
      method: 'eth_accounts',
    })
    const account = getAddress(accounts[0] as string)
    return account
  }

  async getUserDetailsByForm(
    enableSMSLogin: boolean,
    enableEmailLogin: boolean,
    oauthProviders: OAuthProvider[],
  ): Promise<UserDetails> {
    const output: UserDetails = (await createModal({
      accentColor: this.magicOptions.accentColor,
      isDarkMode: this.magicOptions.isDarkMode,
      customLogo: this.magicOptions.customLogo,
      customHeaderText: this.magicOptions.customHeaderText,
      enableSMSLogin: enableSMSLogin,
      enableEmailLogin: enableEmailLogin || true,
      oauthProviders,
    })) as UserDetails

    this.isModalOpen = false
    return output
  }

  async getWalletClient({ chainId }: { chainId?: number } = {}) {
    const provider = await this.getProvider()
    const account = await this.getAccount()
    const chain = this.chains.find((x) => x.id === chainId) || this.chains[0]
    if (!provider) throw new Error('provider is required.')
    return createWalletClient({
      account,
      chain,
      transport: custom(provider),
    })
  }

  async getProvider() {
    const magic = this.getMagicSDK()
    return magic.rpcProvider
  }

  async isAuthorized() {
    try {
      const magic = this.getMagicSDK()

      const isLoggedIn = await magic.user.isLoggedIn()
      if (isLoggedIn) return true

      const result = await magic.oauth.getRedirectResult()
      return result !== null
    } catch {
      return false
    }
  }

  protected onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0 || !accounts[0]) this.emit('disconnect')
    else this.emit('change', { account: getAddress(accounts[0]) })
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId)
    const unsupported = this.isChainUnsupported(id)
    this.emit('change', { chain: { id, unsupported } })
  }

  protected onDisconnect(): void {
    this.emit('disconnect')
  }

  async disconnect(): Promise<void> {
    const magic = this.getMagicSDK()
    await magic.user.logout()
  }

  abstract getMagicSDK(): InstanceWithExtensions<SDKBase, OAuthExtension[]>
}
