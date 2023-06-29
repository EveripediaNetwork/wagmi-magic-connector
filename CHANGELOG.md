# @magiclabs/wagmi-magic-connector

## 1.1.0

### Minor Changes

- Moves package ownership to @magiclabs and adds @everipedianetwork as maintainers

## 1.0.2

### Patch Changes

- 6e648bb: Adds post processing to build to fix bundling issues

## 1.0.1

### Patch Changes

- eb25ae1: Makes package es module from package json type

## 1.0.0

### Major Changes

- 9e97169: Adds support to use the connectors with wagmi v1.
  Major version bump to support wagmi v1 ✌️

  For migration:

  1. update the connector version to 1.0.0
  2. update Wagmi to v1 and install Viem (https://viem.sh) in place of ethers
  3. follow migration guide https://wagmi.sh/react/migration-guide#1xx-breaking-changes to adapt your code to the new wagmi api.

  Note: The connector itself has no API change.

## 0.12.1

### Patch Changes

- 897ed1f: Fixes magic auth not working with oauth login. updates magic sdk and wagmi versions to latest

## 0.12.0

### Minor Changes

- c09ccc0: Add support for switchChain for MagicConnectConnector
  You can now pass a list of network accepted to switch chain
  ```ts
  new MagicConnectConnector({
    chains: chains,
    options: {
      apiKey: environment.MAGIC_API_KEY,
      networks: [
        { chainId: 1, rpcUrl: "https://your-ethereum-rpc-url" },
        { chainId: 137, rpcUrl: "https://your-polygon-rpc-url" },
        // ...
      ],
    },
  });
  ```

## 0.11.0

### Minor Changes

- 58b39f3: Update Magic Connect Connector to use Magic Connect's Modal UI
  - This will use Magic Connect's Modal instead of homemade one.
  - Remove the styling props to constructor for migration

## 0.10.1

### Patch Changes

- febd0a3: ### Patch Changes

  - Fixing a bug that prevents login with email because of a MagicSDK naming convention recent change.
  - Dependencies update.

## 0.10.0

### Minor Changes

- 82a5174: Throws `api key not provided` error instead of `user rejected request` error

## 0.9.1

### Patch Changes

- 5a555d8: Adds post processing on build output for adding .js ext for ESM resolution

## 0.9.0

### Minor Changes

- adb6e07: Changes @everipedia/wagmi-magic-connector to a pure ESM Module package.

  Requires Node 12.20.0 or higher. it fixes resolution issues of latest wagmi and magic packages and should work well out of the box with Nextjs and other react frameworks without the need for any extra configuration.

## 0.8.0

### Minor Changes

- a5d6191: Updates packages to use latest magic sdk and wagmi core

## 0.7.1

### Patch Changes

- b19d703: - `magic.user.disconnect()` is no available for Magic Connect, relying on local storage instead
  - Require email input for `connect()` flow to continue once modal is open. Otherwise the Magic Connect
    modals appears even if the user quits the process manually.

## 0.7.0

### Minor Changes

- 38dd8cc: ### Major

  - Creation of two classes `MagicAuthConnector` & `MagicConnectConnector`
    - `MagicAuthConnector`: Connector integrating with [Magic Auth](https://magic.link/docs/auth/overview). Most of the code comes from previous implementation
    - `MagicConnectConnector`: Connector integrating with [Magic Connect](https://magic.link/docs/connect/overview).
  - Made `MagicConnector` an abstract class containing shared logic between `MagicAuthConnector` & `MagicConnectConnector`
  - Renamed `options.additionalMagicOptions` to `options.magicSdkConfiguration`, which seemed to be a clearer name
  - Renamed `enableSMSlogin` to `enableSMSLogin`
  - Updated documentation in README to fit changes

  ### Minor

  - Fixed some typos in the README
  - Fixed Rainbow Kit example in the README and specified that `options.magicSdkConfiguration.network.chainId` needs to be specified. This comes from the fact that in their most recent version Rainbow Kit makes a `getChainId()` call on the connector before calling the `connect()` method.
  - Fixed typo in enableSMSlogin -> enableSMSLogin

## 0.6.5

### Patch Changes

- d5c95eb: updates email regex to take +

## 0.6.4

### Patch Changes

- d49c203: updated dependancies to latest versions

## 0.6.3

### Patch Changes

- 4288ba5: Prevent changing chainId type from number to string

## 0.6.2

### Patch Changes

- 127b67e: added implementation for getChainId

## 0.6.1

### Patch Changes

- 85cc525: Fix Custom header images not working

## 0.6.0

### Minor Changes

- 1001fbf: - Made dark mode styles overridable by converting darkmode styles to pure css
  - Fixed OAuth provider buttons not following the order they are passed in
  - Redesigned Modal look and feel
  - Changed Github and Default header icons

## 0.5.0

### Minor Changes

- 075cf2b: Made Email Authentication Optional. To remove the email authentication requirement, you can set `enableEmailLogin` to `false` in connector configuration's options object.

## 0.4.1

### Patch Changes

- 7ab9877: fixes animations not working while opening and closing modal
