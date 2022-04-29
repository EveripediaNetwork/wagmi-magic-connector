import { OAuthExtension } from '@magic-ext/oauth';
import { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider';
import { ethers, Signer } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { Magic } from 'magic-sdk';
import { Chain, Connector } from 'wagmi';

import { UserRejectedRequestError } from './errors/userRejectedRequestError';
import { createModal } from './modal/view';
import { normalizeChainId } from './utils/normalizeChainId';

const IS_SERVER = typeof window === 'undefined';

interface Options {
  apiKey: string;
  customNodeOptions?: {
    chainId: number;
    rpcUrl: string;
  };
}

interface UserDetails {
  email: string;
  isGoogle: boolean;
  isDiscord: boolean;
  isTwitter: boolean;
  isFacebook: boolean;
}

export class MagicLinkConnector extends Connector<Options, any> {
  ready = !IS_SERVER;

  readonly id = 'magiclink';

  readonly name = 'Magic Link';

  provider: any;

  magicSDK: InstanceWithExtensions<SDKBase, OAuthExtension[]> | undefined;

  isModalOpen = false;

  magicOptions: Options;

  constructor(config: { chains?: Chain[] | undefined; options: Options }) {
    super(config);
    this.magicOptions = config.options;
  }

  async connect() {
    try {
      const provider = await this.getProvider();

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged);
        provider.on('chainChanged', this.onChainChanged);
        provider.on('disconnect', this.onDisconnect);
      }

      // Check if there is a user logged in
      const isAuthenticated = await this.isAuthorized();

      // if there is a user logged in, return the user
      if (isAuthenticated) {
        return {
          provider,
          chain: {
            id: 0,
            unsupported: false,
          },
          account: await this.getAccount(),
        };
      }

      // open the modal and process the magic login steps

      if (!this.isModalOpen) {
        const output = await this.getUserDetailsByForm();
        const magic = await this.getMagicSDK();

        // LOGIN WITH MAGIC LINK WITH GOOGLE
        if (output.isGoogle) {
          await magic.oauth.loginWithRedirect({
            provider: 'google',
            redirectURI: window.location.href,
          });
        }

        // LOGIN WITH MAGIC LINK WITH DISCORD
        if (output.isDiscord) {
          await magic.oauth.loginWithRedirect({
            provider: 'discord',
            redirectURI: window.location.href,
          });
        }

        // LOGIN WITH MAGIC LINK WITH TWITTER
        if (output.isTwitter) {
          await magic.oauth.loginWithRedirect({
            provider: 'twitter',
            redirectURI: window.location.href,
          });
        }

        // LOGIN WITH MAGIC LINK WITH FACEBOOK
        if (output.isFacebook) {
          await magic.oauth.loginWithRedirect({
            provider: 'facebook',
            redirectURI: window.location.href,
          });
        }

        // LOGIN WITH MAGIC LINK WITH EMAIL
        else if (output.email) {
          await magic.auth.loginWithMagicLink({
            email: output.email,
          });
        }

        const signer = await this.getSigner();
        const account = await signer.getAddress();

        return {
          account,
          chain: {
            id: 0,
            unsupported: false,
          },
          provider,
        };
      }
      throw new UserRejectedRequestError('User rejected request');
    } catch (error) {
      throw new UserRejectedRequestError();
    }
  }

  async getAccount(): Promise<string> {
    const provider = new ethers.providers.Web3Provider(this.getProvider());
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    return account;
  }

  async getUserDetailsByForm(): Promise<UserDetails> {
    this.isModalOpen = true;

    const output: UserDetails = (await createModal({
      isModalOpen: this.isModalOpen,
    })) as UserDetails;
    return output;
  }

  getProvider() {
    if (this.provider) {
      return this.provider;
    }
    const magic = this.getMagicSDK();
    this.provider = magic.rpcProvider;
    return this.provider;
  }

  async getSigner(): Promise<Signer> {
    const provider = new ethers.providers.Web3Provider(this.getProvider());
    const signer = await provider.getSigner();
    return signer;
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  getMagicSDK(): InstanceWithExtensions<SDKBase, OAuthExtension[]> {
    if (!this.magicSDK) {
      this.magicSDK = new Magic(this.magicOptions.apiKey, {
        network: this.magicOptions.customNodeOptions,
        extensions: [new OAuthExtension()],
      });
      return this.magicSDK;
    }
    return this.magicSDK;
  }

  async getChainId(): Promise<number> {
    throw new Error('Method not implemented.');
  }

  protected onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: getAddress(accounts[0]) });
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  }

  protected onDisconnect(): void {
    this.emit('disconnect');
  }

  async disconnect(): Promise<void> {
    const magic = this.getMagicSDK();
    await magic.user.logout();
  }
}
