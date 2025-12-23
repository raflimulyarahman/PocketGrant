'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { HandCoins, Search } from 'lucide-react'
import { HamburgerMenu } from '@/components/hamburger-menu'
import { WalletButton } from '@/components/wallet-button'
import { cn } from '@/lib/utils'
import { useProgramCount } from '@/hooks/usePocketGrant'
import { useRouter } from 'next/navigation'

export default function RequestHubPage() {
  const router = useRouter()
  const [programId, setProgramId] = useState('')
  const { data: programCount } = useProgramCount()

  const handleSearch = () => {
    if (programId && parseInt(programId) > 0) {
      router.push(`/request/${programId}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/25">
              <HandCoins className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Request Dana</h1>
            <p className="text-muted-foreground">Ajukan permohonan bantuan pendidikan</p>
          </div>

          {/* Search Program */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <p className="text-sm font-medium text-foreground mb-4">
              Masukkan ID program yang ingin kamu tuju
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                placeholder="ID Program"
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl border text-lg',
                  'bg-background border-border focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
                  'outline-none transition-all'
                )}
              />
              <button
                onClick={handleSearch}
                disabled={!programId}
                className={cn(
                  'px-6 py-3 rounded-xl',
                  'bg-green-500 text-white font-medium',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'active:scale-[0.98] transition-all'
                )}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            {programCount && (
              <p className="text-sm text-muted-foreground">
                💡 Ada {programCount.toString()} program yang tersedia
              </p>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground text-center">
              Minta ID program kepada penyedia bantuan atau cari di media sosial
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
