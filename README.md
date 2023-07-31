# WAGMI Magic Connector

> 🚧 **DEPRECATION NOTICE:** We are moving this project to a new repository under magiclabs ! Please follow the new repository for future updates: https://github.com/magiclabs/wagmi-magic-connector

![](https://flat.badgen.net/github/release/EveripediaNetwork/wagmi-magic-connector) ![](http://flat.badgen.net/github/tag/EveripediaNetwork/wagmi-magic-connector) ![](http://flat.badgen.net/github/open-issues/EveripediaNetwork/wagmi-magic-connector) ![](http://flat.badgen.net/npm/dt/@everipedia/wagmi-magic-connector) ![](http://flat.badgen.net/packagephobia/publish/@everipedia/wagmi-magic-connector) ![](http://flat.badgen.net/github/stars/EveripediaNetwork/wagmi-magic-connector)

[WAGMI](https://wagmi.sh/) Connector to connect with [Magic](https://magic.link/). Magic is a developer SDK that you can integrate into your application to enable passwordless authentication using magic links, OTPs, OAuth from third-party services, and more for your web3 App.

![Frame 184 (4)](https://user-images.githubusercontent.com/52039218/174133833-fc63f237-63bf-4134-a22b-ce77ae0f2a9b.png)



# Table of Contents

- [⬇️ Install](#%EF%B8%8F-install)
- [🔎 Package TL;DR](#-package-tldr)
- [⭐ Usage](#-usage)
- [📖 API](#-api)
  - [`options`](#options)
  - [`options.OAuthOptions`](#optionsoauthoptions)
    - [Providers](#providers)
    - [Callback URL](#callback-url)
- [🍀 Supported Logins](#-supported-logins)
- [🔆 Examples](#-examples)
  - [🌟 Enable Login by Socials (OAuth)](#-enable-login-by-socials-oauth)
  - [📲 Enable SMS Authentication](#-enable-sms-authentication)
  - [📧 Disable Email Authentication](#-disable-email-authentication)
  - [🎨 Modal Customization](#-modal-customization)
- [📚 Additional Resources](#-additional-resources)
  - [Usage with Rainbowkit](#usage-with-rainbowkit)
  - [Example Repositories](#example-repositories)

# ⬇️ Install

```bash
npm install @everipedia/wagmi-magic-connector
```

or

```bash
yarn add @everipedia/wagmi-magic-connector
```

# 🔎 Package TL;DR

The package contains two main connector classes: `MagicAuthConnector` & `MagicConnectConnector`

`MagicAuthConnector` is a connector integrated to the [Magic Auth](https://magic.link/docs/auth/overview)
product. It is useful if you need to assign an address to your user. 

`MagicConnectConnector` is a connector integrated to the [Magic Connect](https://magic.link/docs/connect/overview)
product. It can be used to assign a read-write wallet to your user.


# ⭐ Usage

```javascript
import { MagicAuthConnector, MagicConnectConnector } from '@everipedia/wagmi-magic-connector';

// Magic Auth integration
const connector = new MagicAuthConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    //...Other options
  },
});

// Magic Connect integration 
const connector = new MagicConnectConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    //...Other options
  },
});
```

# 📖 API

## `options`

The following can be passed to connector options object:

| Key                   | Value                      | `MagicAuthConnector` support | `MagicConnectConnector` support | Description                                                                                                                                                                    |
|-----------------------|----------------------------|------------------------------|---------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| accentColor           | css color (hex/rgb/etc...) | ✔️	                          | ✔️                              | 🎨 (Optional) Makes modal to use the custom accentColor instead of default purple                                                                                              |
| isDarkMode            | true / false               | ✔️	                          | ✔️                              | 🎨 (Optional) Makes modal dark mode if true. Default value is false                                                                                                            |
| customLogo            | path_to_logo / url         | ✔️	                          | ✔️                              | 🎨 (Optional) Makes modal to use the custom logo instead of default magic logo                                                                                                 |
| customHeaderText            | string                     | ✔️	                          | ✔️                              | 🎨 (Optional) Makes modal to use the custom header text instead of default text at the bottom of logo                                                                          |
| enableSMSLogin        | true / false               | ✔️	                          | ❌                               | 🌟 (Optional) Makes modal to enable SMS login if true. Default value is false                                                                                                  |
| enableEmailLogin      | true / false               | ✔️	                          | ❌                               | 🌟 (Optional) Makes modal to disable Email login if false. Default value is true                                                                                               |
| OAuthOptions          | object                     | ✔️	                          | ❌                               | 🌟 (Optional) Makes modal to enable OAuth login according to configuration passed.                                                                                             |
| magicSdkConfiguration | object                     | ✔️	                          | ✔️                              | 🛠️ (Optional) Pass additional options to Magic constructor (refer [Magic API documentation](https://magic.link/docs/api-reference/client-side-sdks/web#constructor) for more) |
| networks              | array of EthNetworkConfiguration | ❌                     | ✔️                              | 🛠️ (Optional) Pass the list of network compatible to switch networks |

## `options.OAuthOptions`

The following can be passed to options.OAuthOptions object to configure OAuth login:

| Key         | Vvalue           | Description                                                                                               |
|-------------|------------------|-----------------------------------------------------------------------------------------------------------|
| providers   | array of strings | 🌟 (Required) List of providers to enable. check out all possible providers in OauthOptions section above |
| callbackUrl | string           | 🌟 (Optional) Callback URL to redirect to after authentication. Default value is current URL.             |

### Providers

Here are all the possible providers:

- google
- facebook
- apple
- github
- bitbucket
- gitlab
- linkedin
- twitter
- discord
- twitch
- microsoft

### Callback URL

You can provide a callback URL to redirect the user to after authentication. the default callback URL is set to the current URL.

# 🍀 Supported Logins

| Key                        | `MagicAuthConnector` support | `MagicConnectConnector` support |
|----------------------------|------------------------------|---------------------------------|
| Email                      | ✔️	                          | ✔️	                             |
| SMS                        | ✔️	                          | ❌                               |
| Social Logins              | ✔️	                          | ❌                               |
| WebAuthn                   | ❌                            | ❌                               |
| Multifactor Authentication | ❌                            | ❌                               |

# 🔆 Examples

## 🌟 Enable Login by Socials (OAuth)

You configure OAuth with magic by adding the following options to the connector:

```javascript
const connector = new MagicAuthConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    oauthOptions : {
      providers: ['facebook', 'google', 'twitter'],
      callbackUrl: 'https://your-callback-url.com', //optional
    }
  },
})
```


## 📲 Enable SMS Authentication

You can enable SMS authentication by adding the following options to the connector:

```javascript
const connector = new MagicAuthConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    enableSMSLogin: true, //optional (default: false)
    //...Other options
  },
});
```

You have to enable SMS authentication in your Magic Link account first to make it work.

## 📧 Disable Email Authentication

By default Email Authentication is set to true as default. if you wish to remove sending magic links via emails, pass ```enableEmailLogin: false``` in options object as follows :

```javascript
const connector = new MagicAuthConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    enableEmailLogin: false, //optional (default: true)
    //...Other options
  },
});
```
  

## 🎨 Modal Customization

You can customize the modal's theme, default accent color, logo and header text.

```javascript
import { MagicAuthConnector } from '@everipedia/wagmi-magic-connector';

const connector = new MagicAuthConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY,
    accentColor: '#ff0000',
    customLogo: 'https://example.com/logo.png',
    headerText: 'Login to your account',
    isDarkMode: true,
  },
});
```

check out the [API Section](#-api) for more information.
for complete styling, you can override styles of the modal with ```! important```.

# 📚 Additional Resources

## Usage with RainbowKit

To use the connector with Rainbow kit, create a new file `RainbowMagicConnector.ts` with following contents:

```javascript
// RainbowMagicConnector.ts

import { MagicConnectConnector } from '@everipedia/wagmi-magic-connector';

export const rainbowMagicConnector = ({ chains }: any) => ({
  id: 'magic',
  name: 'Magic',
  iconUrl: 'https://svgshare.com/i/iJK.svg',
  iconBackground: '#fff',
  createConnector: () => {
    const connector = new MagicConnectConnector({
      chains: chains,
      options: {
        apiKey: 'YOUR_MAGIC_CONNECT_API_KEY',
        magicSdkConfiguration: {
          network: {
            rpcUrl: 'https://polygon-rpc.com', // your ethereum, polygon, or optimism mainnet/testnet rpc URL
            chainId: 137,
          },
        },
        //...Other options (check out full API below)
      },
    });
    return {
      connector,
    };
  },
});
```

> Note: `options.magicSdkConfiguration.network.chainId` is mandatory for the integration with RainbowKit
> to properly work.

Import the above file to your application root where you wrap your application with `WagmiConfig` component.
pass the ```client``` prop with ```createClient``` instance to the `WagmiConfig` component as shown below:

```javascript
// App.tsx

// ...
const { chains, publicClient, webSocketPublicClient } =
  configureChains(YOUR_CHAIN_CONFIG);
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      //... other wallets connectors
      rainbowMagicConnector({ chains }),
    ],
  },
]);
const wagmiConfig = createConfig({
	autoConnect: false,
	connectors,
	publicClient,
	webSocketPublicClient
});
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
export default MyApp;
```

This procedure might change depending on the version of Rainbow kit you are using so please check the documentation of the Rainbow kit if it is not working.

## **Example repositories:** 
- https://github.com/Royal-lobster/vanilla-magic-example
- https://github.com/Royal-lobster/rainbow-magic-example (With Rainbowkit 🌈)
