'use client'

import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { Plus, Gift, FileText, History, ArrowRight, Github, Twitter } from 'lucide-react'
import { BentoCard, BentoGrid } from '@/components/bento-card'
import { WalletButton } from '@/components/wallet-button'
import { BalanceDisplay } from '@/components/balance-display'
import { ThemeToggle } from '@/components/theme-toggle'
import { useProgramCount } from '@/hooks/usePocketGrant'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function Dashboard() {
  const { isConnected } = useAccount()
  const { data: programCount } = useProgramCount()

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white text-lg">💰</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">PocketGrant</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Selamat Datang! 👋
          </h2>
          <p className="text-muted-foreground">
            Buat dan bagikan Dana Kaget untuk pendidikan
          </p>
        </motion.div>

        {/* Bento Grid */}
        <BentoGrid className="lg:grid-cols-4">
          {/* Card A: Balance (Hero - spans 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            <BentoCard variant="highlight" size="lg" className="h-full">
              {isConnected ? (
                <BalanceDisplay />
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">
                    Hubungkan Dompetmu
                  </h3>
                  <p className="text-muted-foreground">
                    Untuk mulai membuat atau mengklaim Dana Kaget
                  </p>
                  <WalletButton />
                </div>
              )}
            </BentoCard>
          </motion.div>

          {/* Card B: Create Program (Primary Action - spans 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Link href="/create">
              <BentoCard 
                variant="accent" 
                size="lg" 
                className={cn(
                  'h-full cursor-pointer group',
                  'hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all'
                )}
              >
                <div className="flex items-center justify-between h-full">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Buat Dana Kaget
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Deposit IDRX dan bagikan link ke penerima
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </BentoCard>
            </Link>
          </motion.div>

          {/* Card C: Gift Card Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BentoCard className="h-full cursor-pointer group hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-bold text-foreground">Gift Card</h3>
                <p className="text-muted-foreground text-sm">
                  Klaim dengan kode rahasia
                </p>
              </div>
            </BentoCard>
          </motion.div>

          {/* Card D: Request Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <BentoCard className="h-full cursor-pointer group hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-bold text-foreground">Request Dana</h3>
                <p className="text-muted-foreground text-sm">
                  Ajukan permohonan bantuan
                </p>
              </div>
            </BentoCard>
          </motion.div>

          {/* Card E: Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BentoCard className="h-full">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">Program Aktif</h3>
                <p className="text-3xl font-bold text-primary">
                  {programCount?.toString() || '0'}
                </p>
              </div>
            </BentoCard>
          </motion.div>

          {/* Card F: Quick Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <BentoCard className="h-full bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 border-gray-800">
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">Coba klaim</p>
                <Link 
                  href="/claim/1" 
                  className="text-white font-medium hover:text-primary transition-colors"
                >
                  Demo Dana Kaget →
                </Link>
                <p className="text-gray-500 text-xs">
                  Program ID: 1
                </p>
              </div>
            </BentoCard>
          </motion.div>
        </BentoGrid>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-muted-foreground text-sm">
                Dibangun di Base Blockchain dengan 💙
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                PocketGrant © 2024 • Powered by IDRX
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
