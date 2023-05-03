---
"@everipedia/wagmi-magic-connector": minor
---

Add support for switchChain for MagicConnectConnector
You can now pass a list of network accepted to switch chain
```ts
new MagicConnectConnector({
  chains: chains,
  options: {
    apiKey: environment.MAGIC_API_KEY,
    networks: [
      { chainId: 1, rpcUrl: 'https://your-ethereum-rpc-url' },
      { chainId: 137, rpcUrl: 'https://your-polygon-rpc-url' },
      // ...
    ]
  },
},
)
```