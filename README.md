# WAGMI Magic Connector

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/EveripediaNetwork/wagmi-magic-connector?style=flat-square)

WAGMI Connector to connect with Magic. Magic is a developer SDK that you can integrate into your application to enable passwordless authentication using magic links, OTPs, OAuth from third-party services, and more for your web3 App.

![Frame 184 (1)](https://user-images.githubusercontent.com/52039218/173542608-19dd8590-3f06-4026-ab10-f3469b212b19.png)


# Install

```bash
npm install @everipedia/wagmi-magic-connector
```

or

```bash
yarn add @everipedia/wagmi-magic-connector
```

# Usage

```javascript
import { MagicConnector } from '@everipedia/wagmi-magic-connector';

const connector = new MagicConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    additionalMagicOptions: {
      // You can add additional magic options here
    },
    //...Other options
  },
});
```

You can pass magic options to `aditionalMagicOptions`. Please refer [Magic Docs](https://magic.link/docs/api-reference/client-side-sdks/web) for more information

# OAuth Configuration

You can configure OAuth with magic by adding the following options to the connector:

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

## Possible Providers

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

## Callback URL

You can provide a callback URL to redirect the user to after authentication. the default callback URL is set to the current URL.

# Customization

You can customize the modal's default accent color, logo and header text.

## Example

```javascript
import { MagicConnector } from '@everipedia/wagmi-magic-connector';

const connector = new MagicConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY,
    accentColor: '#ff0000',
    customLogo: 'https://example.com/logo.png',
  },
});
```

> See Full API below for more options

# API

## options

The following can be passed to connector options object:

| Key            | value                      | Description                                                                                           |
| -------------- | -------------------------- | ----------------------------------------------------------------------------------------------------- |
| accentColor    | css color (hex/rgb/etc...) | 🎨 (Optional) Makes modal to use the custom accentColor instead of default purple                     |
| isDarkMode     | true / false               | 🎨 (Optional) Makes modal dark mode if true. Default value is false                                   |
| customLogo     | path_to_logo / url         | 🎨 (Optional) Makes modal to use the custom logo instead of default magic logo                        |
| headerText     | string                     | 🎨 (Optional) Makes modal to use the custom header text instead of default text at the bottom of logo |
| enableSMSLogin | true / false               | 🌟 (Optional) Makes modal to enable SMS login if true. Default value is false                         |
| OAuthOptions   | object                     | 🌟 (Optional) Makes modal to enable OAuth login according to configuration passed.                    |

## options.OAuthOptions

The following can be passed to options.OAuthOptions object to configure OAuth login:

| Key         | value            | Description                                                                                               |
| ----------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| providers   | array of strings | 🌟 (Required) List of providers to enable. check out all possible providers in OauthOptions section above |
| callbackUrl | string           | 🌟 (Optional) Callback URL to redirect to after authentication. Default value is current URL.             |

# Supported Logins

- [x] Email
- [x] SMS
- [x] Social Logins
- [ ] WebAuthn
- [ ] Multifactor Authentication
