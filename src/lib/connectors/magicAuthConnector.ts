import { OAuthExtension, OAuthProvider } from '@magic-ext/oauth'
import {
  InstanceWithExtensions,
  MagicSDKAdditionalConfiguration,
  MagicSDKExtensionsOption,
  SDKBase,
} from '@magic-sdk/provider'
import { Chain, UserRejectedRequestError, normalizeChainId } from '@wagmi/core'
import { Magic } from 'magic-sdk'

import { MagicConnector, MagicOptions } from './magicConnector'

interface MagicAuthOptions extends MagicOptions {
  enableEmailLogin?: boolean
  enableSMSLogin?: boolean
  oauthOptions?: {
    providers: OAuthProvider[]
    callbackUrl?: string
  }
  magicSdkConfiguration?: MagicSDKAdditionalConfiguration<
    string,
    OAuthExtension[]
  >
}

export class MagicAuthConnector extends MagicConnector {
  magicSDK?: InstanceWithExtensions<SDKBase, OAuthExtension[]>
  magicSdkConfiguration: MagicSDKAdditionalConfiguration<
    string,
    MagicSDKExtensionsOption<OAuthExtension['name']>
  >
  enableSMSLogin: boolean
  enableEmailLogin: boolean
  oauthProviders: OAuthProvider[]
  oauthCallbackUrl?: string

  constructor(config: { chains?: Chain[]; options: MagicAuthOptions }) {
    super(config)
    this.magicSdkConfiguration = config.options.magicSdkConfiguration
    this.oauthProviders = config.options.oauthOptions?.providers || []
    this.oauthCallbackUrl = config.options.oauthOptions?.callbackUrl
    this.enableSMSLogin = config.options.enableSMSLogin
    this.enableEmailLogin = config.options.enableEmailLogin
  }

  async connect() {
    console.log(`
    ------------------------------  
      🌊 Connecting to Magic...
    ------------------------------
    `)
    if (!this.magicOptions.apiKey)
      throw new Error('Magic API Key is not provided.')
    const provider = await this.getProvider()

    if (provider.on) {
      provider.on('accountsChanged', this.onAccountsChanged)
      provider.on('chainChanged', this.onChainChanged)
      provider.on('disconnect', this.onDisconnect)
    }

    // Check if we have a chainId, in case of error just assign 0 for legacy
    let chainId: number
    try {
      chainId = await this.getChainId()
    } catch {
      chainId = 0
    }

    // if there is a user logged in, return the user
    if (await this.isAuthorized()) {
      return {
        provider,
        chain: {
          id: chainId,
          unsupported: false,
        },
        account: await this.getAccount(),
      }
    }

    // open the modal and process the magic login steps
    if (!this.isModalOpen) {
      const modalOutput = await this.getUserDetailsByForm(
        this.enableSMSLogin,
        this.enableEmailLogin,
        this.oauthProviders,
      )

      const magic = this.getMagicSDK()

      // LOGIN WITH MAGIC LINK WITH OAUTH PROVIDER
      if (modalOutput.oauthProvider)
        await magic.oauth.loginWithRedirect({
          provider: modalOutput.oauthProvider,
          redirectURI: this.oauthCallbackUrl || window.location.href,
        })

      // LOGIN WITH MAGIC LINK WITH EMAIL
      if (modalOutput.email)
        await magic.auth.loginWithMagicLink({
          email: modalOutput.email,
        })

      // LOGIN WITH MAGIC LINK WITH PHONE NUMBER
      if (modalOutput.phoneNumber)
        await magic.auth.loginWithSMS({
          phoneNumber: modalOutput.phoneNumber,
        })

      if (await magic.user.isLoggedIn())
        return {
          account: await this.getAccount(),
          chain: {
            id: chainId,
            unsupported: false,
          },
          provider,
        }
    }
    throw new UserRejectedRequestError('User rejected request')
  }

  async getChainId(): Promise<number> {
    const networkOptions = this.magicSdkConfiguration?.network
    if (typeof networkOptions === 'object') {
      const chainID = networkOptions.chainId
      if (chainID) {
        return normalizeChainId(chainID)
      }
    }
    throw new Error('Chain ID is not defined')
  }

  getMagicSDK(): InstanceWithExtensions<SDKBase, OAuthExtension[]> {
    if (!this.magicSDK) {
      this.magicSDK = new Magic(this.magicOptions.apiKey, {
        ...this.magicSdkConfiguration,
        extensions: [new OAuthExtension()],
      })
    }
    return this.magicSDK
  }
}
