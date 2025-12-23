'use client'

import { Sparkles, Zap } from 'lucide-react'
import { isPaymasterEnabled } from '@/lib/paymaster'
import { cn } from '@/lib/utils'

interface GaslessBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

export function GaslessBadge({ className, size = 'md', showTooltip = true }: GaslessBadgeProps) {
  const enabled = isPaymasterEnabled()
  
  if (!enabled) return null
  
  const sizes = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3',
    lg: 'text-base py-1.5 px-4',
  }
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
        'text-green-600 dark:text-green-400',
        'border border-green-500/30',
        sizes[size],
        className
      )}
      title={showTooltip ? 'Transaksi ini GRATIS gas fee!' : undefined}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>Gratis Gas</span>
    </div>
  )
}

// Inline indicator for buttons
export function GaslessIcon({ className }: { className?: string }) {
  const enabled = isPaymasterEnabled()
  
  if (!enabled) return null
  
  return <Zap className={cn('w-4 h-4 text-yellow-400', className)} />
}

// Info card explaining gasless
export function GaslessInfo() {
  const enabled = isPaymasterEnabled()
  
  if (!enabled) return null
  
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
      <Sparkles className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-green-600 dark:text-green-400">
          Transaksi Gratis!
        </p>
        <p className="text-sm text-muted-foreground">
          Kamu tidak perlu membayar gas fee. Biaya ditanggung oleh provider.
        </p>
      </div>
    </div>
  )
}
