'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from '../wagmiConfig'
import { WalletOptions } from './components/wallet-options'
import { NftUploader } from './components/NftUploader'

const queryClient = new QueryClient()

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <NftUploader />
  return <WalletOptions />
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>            
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}