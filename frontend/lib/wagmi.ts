import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'

// Wagmi config with multiple wallet options
export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    // Injected wallets (MetaMask, Rabby, Coinbase Extension, etc.)
    injected({
      shimDisconnect: true,
    }),
    // Coinbase Wallet (mobile app + smart wallet)
    coinbaseWallet({
      appName: 'PocketGrant',
      preference: 'all',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
})


