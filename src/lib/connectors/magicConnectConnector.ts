import { ConnectExtension } from '@magic-ext/connect';
import {
  InstanceWithExtensions,
  MagicSDKAdditionalConfiguration,
  SDKBase,
} from '@magic-sdk/provider';
import { Chain, normalizeChainId, UserRejectedRequestError } from '@wagmi/core';
import { Magic } from 'magic-sdk';
import { MagicConnector, MagicOptions } from './magicConnector';

import { AbstractProvider } from 'web3-core';
import { RPCProviderModule } from '@magic-sdk/provider/dist/types/modules/rpc-provider';

interface MagicConnectOptions extends MagicOptions {
  magicSdkConfiguration?: MagicSDKAdditionalConfiguration;
}

export class MagicConnectConnector extends MagicConnector {
  magicSDK?: InstanceWithExtensions<SDKBase, ConnectExtension[]>;

  magicSdkConfiguration: MagicConnectOptions['magicSdkConfiguration'];

  constructor(config: { chains?: Chain[]; options: MagicConnectOptions }) {
    super(config);
    this.magicSdkConfiguration = config.options.magicSdkConfiguration;
    this.initializeMagicInstance();
  }

  // Private method to initialize the Magic instance
  private initializeMagicInstance() {
    const { apiKey, magicSdkConfiguration } = this.options;
    if (typeof window !== 'undefined') {
      this.magicSDK = new Magic(apiKey, {
        ...magicSdkConfiguration,
        extensions: [new ConnectExtension()],
      });

      this.provider = this.magicSDK.rpcProvider;
      console.log('initializeMagicInstance', this.magicSDK);
    }
  }

  // Connect method attempts to connects to wallet using Magic Connect modal
  async connect() {
    try {
      await this.magicSDK.wallet.connectWithUI();
      const provider = await this.getProvider();
      const chainId = await this.getChainId();

      this.registerProviderEventListeners(provider);

      const account = await this.getAccount();

      return {
        account,
        chain: {
          id: chainId,
          unsupported: false,
        },
        provider,
      };
    } catch (error) {
      throw new UserRejectedRequestError(error);
    }
  }

  // Private method to register event listeners for the provider
  private registerProviderEventListeners(
    provider: RPCProviderModule & AbstractProvider
  ) {
    if (provider.on) {
      provider.on('accountsChanged', this.onAccountsChanged);
      provider.on('chainChanged', this.onChainChanged);
      provider.on('disconnect', this.onDisconnect);
    }
  }

  // Disconnect method attempts to disconnect wallet from Magic
  async disconnect(): Promise<void> {
    try {
      await this.magicSDK.wallet.disconnect();
      this.emit('disconnect');
    } catch (error) {
      console.error('Error disconnecting from Magic SDK:', error);
    }
  }

  // Get chain ID
  async getChainId(): Promise<number> {
    const networkOptions = this.options.magicSdkConfiguration?.network;
    if (typeof networkOptions === 'object') {
      const chainID = networkOptions.chainId;
      if (chainID) return normalizeChainId(chainID);
    }
    throw new Error('Chain ID is not defined');
  }

  // Autoconnect if wallet info is available
  async isAuthorized() {
    try {
      await this.magicSDK.wallet.getInfo();
      return true;
    } catch {
      return false;
    }
  }

  getMagicSDK(): InstanceWithExtensions<SDKBase, ConnectExtension[]> {
    if (!this.magicSDK) {
      this.magicSDK = new Magic(this.magicOptions.apiKey, {
        ...this.magicSdkConfiguration,
        extensions: [new ConnectExtension()],
      });
    }
    return this.magicSDK;
  }
}
