import { OAuthExtension, OAuthProvider } from "@magic-ext/oauth";
import { InstanceWithExtensions, SDKBase } from "@magic-sdk/provider";
import { Address, Chain, Connector, normalizeChainId } from "@wagmi/core";
import { Signer, ethers } from "ethers";
import { getAddress } from "ethers/lib/utils";

import { createModal } from "../modal/view";

const IS_SERVER = typeof window === "undefined";

export interface MagicOptions {
	apiKey: string;
	accentColor?: string;
	isDarkMode?: boolean;
	customLogo?: string;
	customHeaderText?: string;
}

interface UserDetails {
	email: string;
	phoneNumber: string;
	oauthProvider: OAuthProvider;
}

export abstract class MagicConnector extends Connector {
	ready = !IS_SERVER;

	readonly id = "magic";

	readonly name = "Magic";

	isModalOpen = false;

	magicOptions: MagicOptions;

	protected constructor(config: { chains?: Chain[]; options: MagicOptions }) {
		super(config);
		this.magicOptions = config.options;
	}

	async getAccount(): Promise<Address> {
		const signer = await this.getSigner();
		const account = await signer.getAddress();
		if (account.startsWith("0x")) return account as Address;
		return `0x${account}`;
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
		})) as UserDetails;

		this.isModalOpen = false;
		return output;
	}

	async getProvider() {
		const magic = this.getMagicSDK();
		return new ethers.providers.Web3Provider(magic.rpcProvider);
	}

	async getSigner(): Promise<Signer> {
		const provider = await this.getProvider();
		const signer = provider.getSigner();
		return signer;
	}

	async isAuthorized() {
		const magic = this.getMagicSDK();
		try {
			return await magic.user.isLoggedIn();
		} catch (e) {
			return false;
		}
	}

	protected onAccountsChanged(accounts: string[]): void {
		if (accounts.length === 0) this.emit("disconnect");
		else this.emit("change", { account: getAddress(accounts[0]) });
	}

	protected onChainChanged(chainId: string | number): void {
		const id = normalizeChainId(chainId);
		const unsupported = this.isChainUnsupported(id);
		this.emit("change", { chain: { id, unsupported } });
	}

	protected onDisconnect(): void {
		this.emit("disconnect");
	}

	async disconnect(): Promise<void> {
		const magic = this.getMagicSDK();
		await magic.user.logout();
	}

	abstract getMagicSDK(): InstanceWithExtensions<SDKBase, OAuthExtension[]>;
}
