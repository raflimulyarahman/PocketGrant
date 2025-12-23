'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HandCoins, Gift, Sparkles, ChevronRight } from 'lucide-react'
import { HamburgerMenu } from '@/components/hamburger-menu'
import { WalletButton } from '@/components/wallet-button'
import { BalanceDisplay } from '@/components/balance-display'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function Home() {
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hamburger Menu */}
      <HamburgerMenu />

      {/* Header - Minimal */}
      <header className="fixed top-0 right-0 z-50 p-4 flex items-center gap-3">
        {mounted && <WalletButton />}
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Logo & Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent mb-6 shadow-2xl shadow-primary/30">
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
            PocketGrant
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-md mx-auto">
            Bantuan dana pendidikan, langsung ke dompetmu
          </p>
        </motion.div>

        {/* Balance (if connected) */}
        {mounted && isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-6 rounded-2xl bg-card/80 backdrop-blur border border-border"
          >
            <BalanceDisplay />
          </motion.div>
        )}

        {/* Main Action - Request Dana */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md mb-6"
        >
          <Link href="/request">
            <div className={cn(
              'group relative overflow-hidden rounded-2xl p-6',
              'bg-gradient-to-br from-primary to-primary/80',
              'shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30',
              'active:scale-[0.98] transition-all touch-manipulation'
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <HandCoins className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Request Dana</h2>
                    <p className="text-white/80 text-sm">Ajukan permohonan bantuan</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Sub Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md grid grid-cols-2 gap-4"
        >
          {/* Claim Dana Kaget */}
          <Link href="/claim">
            <div className={cn(
              'group rounded-2xl p-5 h-full',
              'bg-card border border-border',
              'hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10',
              'active:scale-[0.98] transition-all touch-manipulation'
            )}>
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Dana Kaget</h3>
              <p className="text-sm text-muted-foreground">Klaim dana gratis</p>
            </div>
          </Link>

          {/* Gift Card - Under Construction */}
          <Link href="/gift">
            <div className={cn(
              'group rounded-2xl p-5 h-full relative overflow-hidden',
              'bg-card border border-border',
              'hover:border-muted-foreground/30',
              'active:scale-[0.98] transition-all touch-manipulation opacity-60'
            )}>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 text-xs font-medium">
                Soon
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                <Gift className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Gift Card</h3>
              <p className="text-sm text-muted-foreground">Segera hadir</p>
            </div>
          </Link>
        </motion.div>

        {/* Footer tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-sm text-muted-foreground text-center"
        >
          Ditenagai oleh <span className="text-primary font-medium">Base</span> blockchain
        </motion.p>
      </main>
    </div>
  )
}
