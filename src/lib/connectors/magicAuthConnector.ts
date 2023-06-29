import { OAuthExtension, OAuthProvider } from '@magic-ext/oauth'
import type {
  InstanceWithExtensions,
  MagicSDKAdditionalConfiguration,
  MagicSDKExtensionsOption,
  SDKBase,
} from '@magic-sdk/provider'
import type { Chain } from '@wagmi/core'
import { Magic } from 'magic-sdk'
import { createModal } from '../modal/view'
import { MagicConnector, MagicOptions } from './magicConnector'
import { UserRejectedRequestError } from 'viem'

interface UserDetails {
  email: string
  phoneNumber: string
  oauthProvider: OAuthProvider
}

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

/**
 * Magic Auth Connector class used to connect to wallet using Magic Auth.
 * It uses modal UI defined in our package which also takes in various styling options
 * for custom experience.
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

export class MagicAuthConnector extends MagicConnector {
  magicSDK?: InstanceWithExtensions<SDKBase, OAuthExtension[]>
  magicSdkConfiguration?: MagicSDKAdditionalConfiguration<
    string,
    MagicSDKExtensionsOption<OAuthExtension['name']>
  >
  enableSMSLogin: boolean
  enableEmailLogin: boolean
  oauthProviders: OAuthProvider[]
  oauthCallbackUrl?: string
  magicOptions: MagicOptions

  constructor(config: { chains?: Chain[]; options: MagicAuthOptions }) {
    super(config)
    this.magicSdkConfiguration = config.options.magicSdkConfiguration
    this.oauthProviders = config.options.oauthOptions?.providers || []
    this.oauthCallbackUrl = config.options.oauthOptions?.callbackUrl
    this.enableSMSLogin = config.options.enableSMSLogin || false
    this.enableEmailLogin = config.options.enableEmailLogin || true
    this.magicOptions = config.options
  }

  /**
   * Get the Magic Instance
   * @throws {Error} if Magic API Key is not provided
   */
  getMagicSDK(): InstanceWithExtensions<SDKBase, OAuthExtension[]> {
    if (!this.magicSDK) {
      this.magicSDK = new Magic(this.magicOptions.apiKey, {
        ...this.magicSdkConfiguration,
        extensions: [new OAuthExtension()],
      })
    }
    return this.magicSDK
  }

  /**
   * Connect method attempts to connects to wallet using Magic Connect modal
   * this will open a modal for the user to select their wallet
   */
  async connect() {
    if (!this.magicOptions.apiKey)
      throw new Error('Magic API Key is not provided.')

    const provider = await this.getProvider()

    if (provider?.on) {
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
    throw new UserRejectedRequestError(Error('User Rejected Request'))
  }

  /**
   * checks if user is authorized with Magic.
   * It also checks for oauth redirect result incase user
   * comes from OAuth flow redirect.
   *  (without this check, user will not be logged in after oauth redirect)
   */
  async isAuthorized() {
    try {
      const magic = this.getMagicSDK()

      const isLoggedIn = await magic.user.isLoggedIn()
      if (isLoggedIn) return true

      const result = await magic.oauth.getRedirectResult()
      return result !== null
    } catch {}
    return false
  }

  /**
   * This method is used to get user details from the modal UI
   * It first creates the modal UI and then waits for the user to
   * fill in the details and submit the form.
   */
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
}
