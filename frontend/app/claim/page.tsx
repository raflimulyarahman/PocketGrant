'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Gift, ArrowRight, Search } from 'lucide-react'
import { HamburgerMenu } from '@/components/hamburger-menu'
import { WalletButton } from '@/components/wallet-button'
import { cn } from '@/lib/utils'
import { useProgramCount } from '@/hooks/usePocketGrant'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ClaimHubPage() {
  const router = useRouter()
  const [programId, setProgramId] = useState('')
  const { data: programCount } = useProgramCount()

  const handleSearch = () => {
    if (programId && parseInt(programId) > 0) {
      router.push(`/claim/${programId}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <HamburgerMenu />

      {/* Header */}
      <header className="fixed top-0 right-0 z-50 p-4 flex items-center gap-3">
        <WalletButton />
      </header>

      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Klaim Dana</h1>
            <p className="text-muted-foreground">Pilih jenis klaim atau cari program</p>
          </div>

          {/* Search Program */}
          <div className="rounded-2xl bg-card border border-border p-4 mb-6">
            <p className="text-sm font-medium text-foreground mb-3">Cari Program</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                placeholder="ID Program (contoh: 1)"
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl border',
                  'bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                  'outline-none transition-all'
                )}
              />
              <button
                onClick={handleSearch}
                disabled={!programId}
                className={cn(
                  'px-4 py-3 rounded-xl',
                  'bg-primary text-primary-foreground',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'active:scale-[0.98] transition-all'
                )}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            {programCount && (
              <p className="text-xs text-muted-foreground mt-2">
                {programCount.toString()} program tersedia
              </p>
            )}
          </div>

          {/* Claim Options */}
          <div className="space-y-4">
            {/* Dana Kaget */}
            <Link href="/claim/1">
              <div className={cn(
                'group flex items-center gap-4 p-5 rounded-2xl',
                'bg-gradient-to-r from-accent/10 to-orange-500/10',
                'border border-accent/30 hover:border-accent/50',
                'active:scale-[0.98] transition-all touch-manipulation'
              )}>
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">Dana Kaget</h3>
                  <p className="text-sm text-muted-foreground">Klaim dana gratis secara acak</p>
                  <p className="text-xs text-accent mt-1">⚡ 1x klaim per program</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Gift Card - Under Construction */}
            <Link href="/gift/construction">
              <div className={cn(
                'group flex items-center gap-4 p-5 rounded-2xl',
                'bg-card border border-border',
                'active:scale-[0.98] transition-all touch-manipulation opacity-60'
              )}>
                <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Gift className="w-7 h-7 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">Gift Card</h3>
                  <p className="text-sm text-muted-foreground">Klaim dengan kode rahasia</p>
                  <p className="text-xs text-purple-500 mt-1">🔑 Butuh kode valid</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 text-xs font-medium">
                  Soon
                </span>
              </div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
