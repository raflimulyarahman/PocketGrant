'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { truncateAddress, cn } from '@/lib/utils'
import { Wallet, LogOut, ChevronDown, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'

export function WalletButton() {
  const { address, isConnected, connector } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get available connectors
  const injectedConnector = connectors.find((c) => c.id === 'injected')
  const coinbaseConnector = connectors.find((c) => c.id === 'coinbaseWalletSDK')

  // Show skeleton until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-32 h-[44px] rounded-xl bg-muted animate-pulse" />
    )
  }

  if (isConnected && address) {

    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            'flex items-center gap-2 px-3 sm:px-4 py-2.5 min-h-[44px] rounded-xl',
            'bg-card/80 backdrop-blur border border-border text-foreground font-medium',
            'hover:bg-muted active:scale-[0.98] transition-all touch-manipulation'
          )}
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
            <div className="absolute right-0 mt-2 w-64 py-2 bg-card border border-border rounded-xl shadow-xl z-50">
              {/* Wallet Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs text-muted-foreground">Connected via</p>
                <p className="text-sm font-medium text-foreground">
                  {connector?.name || 'Wallet'}
                </p>
              </div>
              
              {/* Manage Wallet */}
              <a
                href="https://wallet.coinbase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm text-foreground hover:bg-muted transition-colors"
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
                className="w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
    <div className="relative">
      <button
        onClick={() => setShowWalletOptions(!showWalletOptions)}
        disabled={isPending}
        className={cn(
          'flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 min-h-[48px] rounded-xl',
          'bg-primary text-primary-foreground font-medium',
          'hover:bg-primary/90 active:scale-[0.98] transition-all',
          'disabled:opacity-50 shadow-lg shadow-primary/25 touch-manipulation'
        )}
      >
        <Wallet className="w-5 h-5" />
        <span className="text-sm sm:text-base">
          {isPending ? 'Menghubungkan...' : 'Connect Wallet'}
        </span>
      </button>

      {/* Wallet Options Dropdown */}
      {showWalletOptions && !isPending && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowWalletOptions(false)} 
          />
          <div className="absolute right-0 mt-2 w-72 py-2 bg-card border border-border rounded-xl shadow-xl z-50">
            <p className="px-4 py-2 text-xs text-muted-foreground font-medium">
              Pilih Wallet
            </p>

            {/* Injected Wallet (MetaMask, etc.) */}
            {injectedConnector && (
              <button
                onClick={() => {
                  connect({ connector: injectedConnector })
                  setShowWalletOptions(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 min-h-[52px] text-left hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                  🦊
                </div>
                <div>
                  <p className="font-medium text-foreground">Browser Wallet</p>
                  <p className="text-xs text-muted-foreground">MetaMask, Rabby, dll</p>
                </div>
              </button>
            )}

            {/* Coinbase Wallet */}
            {coinbaseConnector && (
              <button
                onClick={() => {
                  connect({ connector: coinbaseConnector })
                  setShowWalletOptions(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 min-h-[52px] text-left hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0052FF]/20 flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#0052FF"/>
                    <path d="M16 6C10.48 6 6 10.48 6 16C6 21.52 10.48 26 16 26C21.52 26 26 21.52 26 16C26 10.48 21.52 6 16 6ZM13.5 19.5C12.12 19.5 11 18.38 11 17V15C11 13.62 12.12 12.5 13.5 12.5H18.5C19.88 12.5 21 13.62 21 15V17C21 18.38 19.88 19.5 18.5 19.5H13.5Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">Coinbase Wallet</p>
                  <p className="text-xs text-muted-foreground">App, Extension, Smart Wallet</p>
                </div>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
