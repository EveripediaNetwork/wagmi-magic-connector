# WAGMI Magic Connector

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/EveripediaNetwork/wagmi-magic-connector?style=flat-square)

WAGMI Connector to connect with Magic. Magic is a developer SDK that you can integrate into your application to enable passwordless authentication using magic links, OTPs, OAuth from third-party services, and more for your web3 App.

![Frame 184 (1)](https://user-images.githubusercontent.com/52039218/173542608-19dd8590-3f06-4026-ab10-f3469b212b19.png)

# Table of Contents

- [⬇️ Install](#-install)
- [⭐ Usage](#-usage)
- [🌟 Enable Login by Socials (OAuth)](#-enable-login-by-socials-oauth)
  - [Providers](#providers)
  - [Callback URL](#callback-url)
- [📲 Enable SMS Authentication](#-enable-sms-authentication)
- [🎨 Modal Customization](#-modal-customization)
- [📖 API](#---api)
  - [`options`](#options)
  - [`options.OAuthOptions`](#optionsoauthoptions)
- [🍀 Supported Logins](#-supported-logins)
- [📚 Additional Resources](#-additional-resources)
  - [1. Usage with Rainbowkit](#1-usage-with-rainbowkit)

# ⬇ Install

```bash
npm install @everipedia/wagmi-magic-connector
```

or

```bash
yarn add @everipedia/wagmi-magic-connector
```

# ⭐ Usage

```javascript
import { MagicConnector } from '@everipedia/wagmi-magic-connector';

const connector = new MagicConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    //...Other options
  },
});
```

Check out all the available options in the [API Section](#API).

# 🌟 Enable Login by Socials (OAuth)

You configure OAuth with magic by adding the following options to the connector:

```javascript
const connector = new MagicConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    oauthOptions : {
      providers: ['facebook', 'google', 'twitter'],
      callbackUrl: 'https://your-callback-url.com', //optional
    };
  },
})
```

### Providers

here are all the possible providers:

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

# 📲 Enable SMS Authentication

You can enable SMS authentication by adding the following options to the connector:

```javascript
const connector = new MagicConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    enableSMSLogin: true, //optional (default: false)
    //...Other options
  },
});
```

You have to enable SMS authentication in your Magic Link account first to make it work.

# 🎨 Modal Customization

You can customize the modal's default accent color, logo and header text.

```javascript
import { MagicConnector } from '@everipedia/wagmi-magic-connector';

const connector = new MagicConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY,
    accentColor: '#ff0000',
    customLogo: 'https://example.com/logo.png',
    headerText: 'Login to your account',
    isDarkMode: true,
  },
});
```

check out the [API Section](#API) for more information.

# 📖 API

## `options`

The following can be passed to connector options object:

| Key                    | value                      | Description                                                                                                                                                                   |
| ---------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accentColor            | css color (hex/rgb/etc...) | 🎨 (Optional) Makes modal to use the custom accentColor instead of default purple                                                                                             |
| isDarkMode             | true / false               | 🎨 (Optional) Makes modal dark mode if true. Default value is false                                                                                                           |
| customLogo             | path_to_logo / url         | 🎨 (Optional) Makes modal to use the custom logo instead of default magic logo                                                                                                |
| headerText             | string                     | 🎨 (Optional) Makes modal to use the custom header text instead of default text at the bottom of logo                                                                         |
| enableSMSLogin         | true / false               | 🌟 (Optional) Makes modal to enable SMS login if true. Default value is false                                                                                                 |
| OAuthOptions           | object                     | 🌟 (Optional) Makes modal to enable OAuth login according to configuration passed.                                                                                            |
| additionalMagicOptions | object                     | 🛠️ (Optional) Pass additional options to Magic constructor (refer [Magic API documentation](https://magic.link/docs/api-reference/client-side-sdks/web#constructor) for more) |

## `options.OAuthOptions`

The following can be passed to options.OAuthOptions object to configure OAuth login:

| Key         | value            | Description                                                                                               |
| ----------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| providers   | array of strings | 🌟 (Required) List of providers to enable. check out all possible providers in OauthOptions section above |
| callbackUrl | string           | 🌟 (Optional) Callback URL to redirect to after authentication. Default value is current URL.             |

# 🍀 Supported Logins

- [x] Email
- [x] SMS
- [x] Social Logins
- [ ] WebAuthn
- [ ] Multifactor Authentication

# 📚 Additional Resources

## 1. Usage with RainbowKit

To use the connector with Rainbow kit, create a new file `RainbowMagicConnector.ts` with following contents:

```javascript
// RainbowMagicConnector.ts

import { MagicConnector } from '@everipedia/wagmi-magic-connector';

export const rainbowMagicConnector = ({ chains }: any) => ({
  id: 'magic',
  name: 'Magic',
  iconUrl: 'https://svgshare.com/i/iJK.svg',
  iconBackground: '#fff',
  createConnector: () => {
    const connector = new MagicConnector({
      chains: chains,
      options: {
        apiKey: 'YOUR_MAGIC_API_KEY',
        //...Other options (check out full API below)
      },
    });
    return {
      connector,
    };
  },
});
```

and import the above file to your application root where you wrap your application with `WagmiConfig` component.
pass the client prop to the `WagmiConfig` component as shown below:

```javascript
// App.tsx

// ...
const { chains, provider, webSocketProvider } =
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
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
export default MyApp;
```

This procedure might change depending on the version of Rainbow kit you are using so please check the documentation of the Rainbow kit if it is not working.

🔎 **Example repository:** https://github.com/Royal-lobster/Rainbowkit-Magic
