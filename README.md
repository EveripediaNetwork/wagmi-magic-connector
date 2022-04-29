# WAGMI Magic Connector

WAGMI Connector to connect with Magic. Magic is a developer SDK that you can integrate into your application to enable passwordless authentication using magic links, OTPs, OAuth from third-party services, and more for your web3 App.

![screely-1651049369339](https://user-images.githubusercontent.com/52039218/165480064-59671e3f-90fb-4387-a408-1055055ad8d3.png)

# Usage

```javascript
import { MagicLinkConnector } from 'wagmi-magic-connector';

const connector = new MagicLinkConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY, //required
    additionalMagicOptions: {
      // You can add additional magic options here
    },
    //...Other options
  },
});
```

You can pass magic options to ```aditionalMagicOptions```. Please refer [Magic Docs](https://magic.link/docs/api-reference/client-side-sdks/web) for more information 

# OAuth Configuration

You can configure OAuth with magic by adding the following options to the connector:

```javascript
const connector = new MagicLinkConnector({
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
import { MagicLinkConnector } from 'wagmi-magic-connector';

const connector = new MagicLinkConnector({
  options: {
    apiKey: YOUR_MAGIC_LINK_API_KEY,
    accentColor: '#ff0000',
    customLogo: 'https://example.com/logo.png',
  },
});
```

## API

| Key         | value                      | Description                                                                                        |
| ----------- | -------------------------- | -------------------------------------------------------------------------------------------------- |
| accentColor | css color (hex/rgb/etc...) | (Optional) Makes modal to use the custom accentColor instead of default purple                     |
| isDarkMode  | true / false               | (Optional) Makes modal dark mode if true. Default value is false                                   |
| customLogo  | path_to_logo / url         | (Optional) Makes modal to use the custom logo instead of default magic logo                        |
| headerText  | string                     | (Optional) Makes modal to use the custom header text instead of default text at the bottom of logo |

# Supported Logins

- [x] Email
- [ ] SMS
- [x] Social Logins
- [ ] WebAuthn
- [ ] Multifactor Authentication
