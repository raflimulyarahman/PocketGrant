'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BentoCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'highlight' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

export function BentoCard({
  children,
  className,
  variant = 'default',
  size = 'md',
}: BentoCardProps) {
  const variants = {
    default: 'bg-card border-border',
    highlight: 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20',
    accent: 'bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20',
  }

  const sizes = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-5 sm:p-8',
  }

  return (
    <div
      className={cn(
        'rounded-2xl sm:rounded-3xl border shadow-sm',
        'hover:shadow-md active:scale-[0.99] transition-all duration-200',
        'touch-manipulation',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoGridProps {
  children: ReactNode
  className?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4',
        className
      )}
    >
      {children}
    </div>
  )
}

// Skeleton component for loading states
export function BentoCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6',
        'animate-pulse',
        className
      )}
    >
      <div className="space-y-3">
        <div className="w-10 h-10 rounded-xl bg-muted skeleton" />
        <div className="h-5 w-24 rounded bg-muted skeleton" />
        <div className="h-4 w-32 rounded bg-muted skeleton" />
      </div>
    </div>
  )
}
