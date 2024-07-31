import { http, createConfig } from 'wagmi'
import { mainnet, polygonAmoy } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'


export const config = createConfig({
  chains: [mainnet, polygonAmoy],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygonAmoy.id]: http(),
  },
})