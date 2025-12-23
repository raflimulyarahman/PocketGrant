'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { truncateAddress } from '@/lib/utils'
import { Wallet, LogOut, ChevronDown, Fingerprint } from 'lucide-react'
import { useState } from 'react'

export function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showDropdown, setShowDropdown] = useState(false)

  const coinbaseConnector = connectors.find((c) => c.id === 'coinbaseWalletSDK')

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-foreground font-medium hover:bg-muted transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent" />
          <span className="hidden sm:inline">{truncateAddress(address)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)} 
            />
            <div className="absolute right-0 mt-2 w-56 py-2 bg-card border border-border rounded-xl shadow-lg z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs text-muted-foreground">Connected via</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  Smart Wallet
                </p>
              </div>
              <a
                href="https://keys.coinbase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Kelola Wallet
              </a>
              <button
                onClick={() => {
                  disconnect()
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Putuskan
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        if (coinbaseConnector) {
          connect({ connector: coinbaseConnector })
        }
      }}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/25"
    >
      <Fingerprint className="w-5 h-5" />
      {isPending ? 'Menghubungkan...' : 'Smart Wallet'}
    </button>
  )
}
