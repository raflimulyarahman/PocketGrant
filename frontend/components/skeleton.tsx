'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

// Basic skeleton shape
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted',
        className
      )}
    />
  )
}

// Skeleton for cards in bento grid
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6',
        className
      )}
    >
      <div className="space-y-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

// Skeleton for balance display
export function BalanceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

// Skeleton for program info in claim page
export function ClaimSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-3xl border-2 border-border bg-card p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
        
        {/* Amount */}
        <div className="p-4 rounded-2xl bg-muted/50">
          <Skeleton className="h-4 w-28 mx-auto mb-2" />
          <Skeleton className="h-10 w-36 mx-auto" />
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        
        {/* Button */}
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </div>
  )
}

// Skeleton for program card in provider dashboard
export function ProgramCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      
      <Skeleton className="h-2 w-full rounded-full" />
      
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  )
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Inline text skeleton
export function TextSkeleton({ width = 'w-24' }: { width?: string }) {
  return <Skeleton className={cn('h-4 inline-block', width)} />
}
