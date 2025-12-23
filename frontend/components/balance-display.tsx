'use client'

import { useIDRXBalance } from '@/hooks/useIDRX'
import { formatIDRX } from '@/lib/utils'
import { useAccount } from 'wagmi'
import { Wallet } from 'lucide-react'

export function BalanceDisplay() {
  const { address } = useAccount()
  const { data: balance, isLoading } = useIDRXBalance(address)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <span className="text-muted-foreground text-sm">Saldo IDRX</span>
        </div>
        <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Wallet className="w-4 h-4 text-primary" />
        </div>
        <span className="text-muted-foreground text-sm">Saldo IDRX</span>
      </div>
      <div>
        <p className="text-3xl font-bold text-foreground">
          {balance ? formatIDRX(balance) : '0'}
        </p>
        <p className="text-muted-foreground text-sm mt-1">
          Indonesian Rupiah Extended
        </p>
      </div>
    </div>
  )
}
