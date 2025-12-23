'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { truncateAddress } from '@/lib/utils'
import { Wallet, LogOut, ChevronDown, Fingerprint, ExternalLink } from 'lucide-react'
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
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl bg-card border border-border text-foreground font-medium hover:bg-muted active:scale-[0.98] transition-all touch-manipulation"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent shrink-0" />
          <span className="text-sm sm:text-base">{truncateAddress(address)}</span>
          <ChevronDown className="w-4 h-4 shrink-0" />
        </button>

        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)} 
            />
            <div className="absolute right-0 mt-2 w-64 py-2 bg-card border border-border rounded-xl shadow-xl z-50 safe-area-bottom">
              {/* Wallet Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs text-muted-foreground">Connected via</p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  Smart Wallet
                </p>
              </div>
              
              {/* Manage Wallet */}
              <a
                href="https://keys.coinbase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm text-foreground hover:bg-muted active:bg-muted/80 transition-colors touch-manipulation"
              >
                <Wallet className="w-5 h-5" />
                <span className="flex-1">Kelola Wallet</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
              
              {/* Disconnect */}
              <button
                onClick={() => {
                  disconnect()
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-colors touch-manipulation"
              >
                <LogOut className="w-5 h-5" />
                Putuskan Koneksi
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
      className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[48px] rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/25 touch-manipulation"
    >
      <Fingerprint className="w-5 h-5" />
      <span className="text-sm sm:text-base">{isPending ? 'Menghubungkan...' : 'Smart Wallet'}</span>
    </button>
  )
}
