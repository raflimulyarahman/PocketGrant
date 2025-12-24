'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { ArrowLeft, Pause, Play, StopCircle, Loader2, Plus, RefreshCw } from 'lucide-react'
import { useProgram, useProgramCount, usePauseProgram, useResumeProgram, useEndProgram } from '@/hooks/usePocketGrant'
import { formatIDRX, truncateAddress, cn } from '@/lib/utils'
import { PROGRAM_MODE, PROGRAM_STATUS } from '@/lib/contracts'
import { WalletButton } from '@/components/wallet-button'
import { BentoCard } from '@/components/bento-card'
import Link from 'next/link'

const MODE_LABELS = ['Request', 'Dana Kaget', 'Gift Card']
const STATUS_LABELS = ['Aktif', 'Dijeda', 'Berakhir']
const STATUS_COLORS = ['text-green-500', 'text-orange-500', 'text-gray-500']

function ProgramCard({ programId }: { programId: bigint }) {
  const { address } = useAccount()
  const { data: program, isLoading, refetch } = useProgram(programId)
  
  const { pause, isPending: pausePending } = usePauseProgram()
  const { resume, isPending: resumePending } = useResumeProgram()
  const { end, isPending: endPending } = useEndProgram()
  
  if (isLoading) {
    return (
      <BentoCard className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
      </BentoCard>
    )
  }
  
  if (!program) return null
  
  const [provider, totalFund, remainingFund, maxPerClaim, mode, status] = program
  const isOwner = address?.toLowerCase() === provider.toLowerCase()
  const isActive = status === 0
  const isPaused = status === 1
  const isEnded = status === 2
  
  if (!isOwner) return null
  
  const handlePause = () => pause(programId)
  const handleResume = () => resume(programId)
  const handleEnd = () => {
    if (confirm('Yakin mengakhiri program? Dana sisa akan dikembalikan.')) {
      end(programId)
    }
  }
  
  const isPendingAction = pausePending || resumePending || endPending
  
  return (
    <BentoCard className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Program #{programId.toString()}</p>
          <p className="font-bold text-foreground">{MODE_LABELS[Number(mode)]}</p>
        </div>
        <span className={cn('text-sm font-medium', STATUS_COLORS[Number(status)])}>
          {STATUS_LABELS[Number(status)]}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Total Dana</p>
          <p className="font-medium text-foreground">{formatIDRX(totalFund)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Sisa Dana</p>
          <p className="font-medium text-foreground">{formatIDRX(remainingFund)}</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${totalFund > 0n ? Number((remainingFund * 100n) / totalFund) : 0}%` }}
        />
      </div>
      
      {/* Actions */}
      {!isEnded && (
        <div className="flex gap-2 pt-2">
          {isActive && (
            <button
              onClick={handlePause}
              disabled={isPendingAction}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg',
                'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-sm font-medium transition-colors'
              )}
            >
              {pausePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
              Jeda
            </button>
          )}
          
          {isPaused && (
            <button
              onClick={handleResume}
              disabled={isPendingAction}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg',
                'bg-green-500/10 text-green-500 hover:bg-green-500/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-sm font-medium transition-colors'
              )}
            >
              {resumePending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Lanjutkan
            </button>
          )}
          
          <button
            onClick={handleEnd}
            disabled={isPendingAction}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg',
              'bg-red-500/10 text-red-500 hover:bg-red-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'text-sm font-medium transition-colors'
            )}
          >
            {endPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4" />}
            Akhiri
          </button>
        </div>
      )}
    </BentoCard>
  )
}

export default function ProviderPage() {
  const { address, isConnected } = useAccount()
  const { data: programCount, isLoading: loadingCount, refetch } = useProgramCount()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const programIds = programCount 
    ? Array.from({ length: Number(programCount) }, (_, i) => BigInt(i + 1))
    : []
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Link>
          <WalletButton />
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Provider Dashboard</h1>
              <p className="text-muted-foreground">Kelola program yang kamu buat</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link
                href="/create"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
                Buat Program
              </Link>
            </div>
          </div>
          
          {/* Programs List */}
          {!mounted || loadingCount ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : !isConnected ? (
            <BentoCard className="text-center py-12">
              <p className="text-muted-foreground mb-4">Hubungkan wallet untuk melihat program kamu</p>
              <WalletButton />
            </BentoCard>
          ) : programIds.length === 0 ? (

            <BentoCard className="text-center py-12">
              <p className="text-muted-foreground mb-4">Belum ada program yang dibuat</p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
                Buat Program Pertama
              </Link>
            </BentoCard>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {programIds.map((id) => (
                <ProgramCard key={id.toString()} programId={id} />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
