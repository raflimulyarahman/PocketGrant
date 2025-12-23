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
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border shadow-sm',
        'hover:shadow-md transition-all duration-300',
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
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
        className
      )}
    >
      {children}
    </div>
  )
}
