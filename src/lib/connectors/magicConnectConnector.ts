import { Magic } from 'magic-sdk';
import {
  InstanceWithExtensions,
  MagicSDKAdditionalConfiguration,
  SDKBase,
} from '@magic-sdk/provider';
import { ConnectExtension } from '@magic-ext/connect';
import {
  Address,
  Chain,
  normalizeChainId,
  UserRejectedRequestError,
  Connector,
} from '@wagmi/core';
import { AbstractProvider } from 'web3-core';
import { RPCProviderModule } from '@magic-sdk/provider/dist/types/modules/rpc-provider';
import { ethers, Signer } from 'ethers';
import { getAddress } from 'ethers/lib/utils.js';

// Define the interface for MagicConnector options
export interface MagicConnectorOptions {
  apiKey: string;
  magicSdkConfiguration?: MagicSDKAdditionalConfiguration;
}

// MagicConnectConnector class extends the base wagmi Connector class
export class MagicConnectConnector extends Connector {
  readonly id = 'magic';
  readonly name = 'Magic';
  readonly ready = true;
  provider: RPCProviderModule & AbstractProvider;
  magic: InstanceWithExtensions<SDKBase, ConnectExtension[]>;
  apiKey: string;
  rpcUrls: { [key: number]: string };

  // Constructor initializes the Magic instance
  // allows connectUI modal to display faster when connect method is called
  constructor(
    config: { chains?: Chain[]; options: MagicConnectorOptions },
    rpcUrls: { [key: number]: string }
  ) {
    super(config);
    this.apiKey = config.options.apiKey;
    this.rpcUrls = rpcUrls;
    this.initializeMagicInstance();
  }

  // Private method to initialize the Magic instance
  private initializeMagicInstance() {
    const { apiKey, magicSdkConfiguration } = this.options;
    if (typeof window !== 'undefined') {
      this.magic = new Magic(apiKey, {
        ...magicSdkConfiguration,
        extensions: [new ConnectExtension()],
      });

      this.provider = this.magic.rpcProvider;
    }
  }

  // Connect method attempts to connects to wallet using Magic Connect modal
  async connect() {
    try {
      await this.magic.wallet.connectWithUI();
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
      await this.magic.wallet.disconnect();
      this.emit('disconnect');
    } catch (error) {
      console.error('Error disconnecting from Magic SDK:', error);
    }
  }

  // Get connected wallet address
  async getAccount(): Promise<Address> {
    const signer = await this.getSigner();
    const account = await signer.getAddress();
    return getAddress(account);
  }

  // Get chain ID
  async getChainId(): Promise<number> {
    if (this.provider) {
      const chainId = await this.provider.request({
        method: 'eth_chainId',
        params: [],
      });
      return normalizeChainId(chainId);
    }
    const networkOptions = this.options.magicSdkConfiguration?.network;
    if (typeof networkOptions === 'object') {
      const chainID = networkOptions.chainId;
      if (chainID) return normalizeChainId(chainID);
    }
    throw new Error('Chain ID is not defined');
  }

  // Get the Magic Instance provider
  async getProvider() {
    if (!this.provider) {
      this.provider = this.magic.rpcProvider;
    }
    return this.provider;
  }

  // Get the Magic Instance signer
  async getSigner(): Promise<Signer> {
    const provider = new ethers.providers.Web3Provider(
      await this.getProvider()
    );
    return provider.getSigner();
  }

  // Autoconnect if account is available
  async isAuthorized() {
    try {
      const walletInfo = await this.magic.wallet.getInfo();
      return !!walletInfo;
    } catch {
      return false;
    }
  }

  // Event handler for accountsChanged event
  onAccountsChanged = (accounts: string[]): void => {
    if (accounts.length === 0) this.emit('disconnect');
    else this.emit('change', { account: getAddress(accounts[0]) });
  };

  // Event handler for chainChanged event
  onChainChanged = (chainId: string | number): void => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit('change', { chain: { id, unsupported } });
  };

  // Event handler for disconnect event
  onDisconnect = (): void => {
    this.emit('disconnect');
  };

  async switchChain(chainId: number): Promise<Chain> {
    const normalizedChainId = normalizeChainId(chainId);
    const chain = this.chains.find((x) => x.id === normalizedChainId);
    if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
    const rpcUrl = this.rpcUrls[normalizedChainId];
    if (!rpcUrl) throw new Error(`Unsupported chainId: ${chainId}`);

    const account = await this.getAccount();

    if (this.provider.off) {
      this.provider.off('accountsChanged', this.onAccountsChanged);
      this.provider.off('chainChanged', this.onChainChanged);
      this.provider.off('disconnect', this.onDisconnect);
    }

    this.magic = new Magic(this.apiKey, {
      network: { chainId: normalizedChainId, rpcUrl },
      extensions: [new ConnectExtension()],
    });

    this.provider = null;
    const provider = await this.getProvider();
    this.registerProviderEventListeners(provider);

    this.onChainChanged(chain.id);

    this.onAccountsChanged([account]);

    return chain;
  }
}
