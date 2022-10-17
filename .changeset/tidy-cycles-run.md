---
'@everipedia/wagmi-magic-connector': minor
---

### Major

- Creation of two classes `MagicAuthConnector` & `MagicConnectConnector`
    - `MagicAuthConnector`: Connector integrating with [Magic Auth](https://magic.link/docs/auth/overview). Most of the code comes from previous implementation
    - `MagicConnectConnector`: Connector integrating with [Magic Connect](https://magic.link/docs/connect/overview).
- Made `MagicConnector` an abstract class containing shared logic between `MagicAuthConnector` & `MagicConnectConnector`
- Renamed `options.additionalMagicOptions` to `options.magicSdkConfiguration`, which seemed to be a clearer name
- Updated documentation in README to fit changes

### Minor

- Fixed some typos in the README
- Fixed Rainbow Kit example in the README and specified that `options.magicSdkConfiguration.network.chainId` needs to be specified. This comes from the fact that in their most recent version Rainbow Kit makes a `getChainId()` call on the connector before calling the `connect()` method.
- Fixed typo in enableSMSlogin -> enableSMSLogin
