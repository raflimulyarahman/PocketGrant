'use client'

import { useEffect, useState } from 'react'
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2, Gift, ExternalLink, Sparkles } from 'lucide-react'
import { useProgram, useCanClaim, useHasClaimed } from '@/hooks/usePocketGrant'
import { formatIDRX, truncateAddress, getExplorerUrl, cn } from '@/lib/utils'
import { POCKETGRANT_ADDRESS, POCKETGRANT_ABI } from '@/lib/contracts'
import { withPaymaster, isPaymasterEnabled } from '@/lib/paymaster'
import { WalletButton } from './wallet-button'
import { ClaimSkeleton } from './skeleton'
import { GaslessBadge, GaslessInfo } from './gasless-badge'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

type ClaimState = 'loading' | 'ready' | 'claiming' | 'success' | 'error' | 'already-claimed' | 'empty'

interface ClaimCardProps {
  programId: bigint
}

export function ClaimCard({ programId }: ClaimCardProps) {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [state, setState] = useState<ClaimState>('loading')
  const [claimedAmount, setClaimedAmount] = useState<bigint>(0n)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  
  // Contract reads
  const { data: program, isLoading: loadingProgram } = useProgram(programId)
  const { data: canClaimData, isLoading: loadingCanClaim } = useCanClaim(programId, address)
  const { data: hasClaimed } = useHasClaimed(programId, address)
  
  // Claim with potential paymaster support
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Determine state
  useEffect(() => {
    if (loadingProgram || loadingCanClaim) {
      setState('loading')
      return
    }
    
    if (!isConnected) {
      setState('ready')
      return
    }

    if (hasClaimed) {
      setState('already-claimed')
      return
    }

    if (isPending || isConfirming) {
      setState('claiming')
      return
    }

    if (isSuccess) {
      setState('success')
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      toast.success('🎉 Dana berhasil masuk ke wallet-mu!')
      return
    }

    if (error) {
      setState('error')
      toast.error('Gagal klaim dana')
      return
    }

    if (canClaimData) {
      const [canClaim, amount] = canClaimData
      if (canClaim && amount > 0n) {
        setClaimedAmount(amount)
        setState('ready')
      } else {
        setState('empty')
      }
    } else if (program) {
      const remainingFund = program[2]
      if (remainingFund === 0n) {
        setState('empty')
      } else {
        setState('ready')
      }
    }
  }, [loadingProgram, loadingCanClaim, isConnected, hasClaimed, isPending, isConfirming, isSuccess, error, canClaimData, program])

  const isWrongChain = isConnected && chain?.id !== baseSepolia.id

  const handleClaim = () => {
    if (isWrongChain) {
      switchChain({ chainId: baseSepolia.id })
      return
    }
    
    toast.loading('Menunggu konfirmasi...', { id: 'claim' })
    
    // Use paymaster helper for gasless support
    writeContract(withPaymaster({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'claimDanaKaget',
      args: [programId],
    }))
  }

  const providerAddress = program?.[0]
  const totalFund = program?.[1] || 0n
  const remainingFund = program?.[2] || 0n
  const maxPerClaim = program?.[3] || 0n
  const isGasless = isPaymasterEnabled()

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-3xl border-2 bg-card p-8',
          'shadow-xl',
          state === 'success' && 'border-green-400 bg-green-50 dark:bg-green-950/20',
          state === 'error' && 'border-red-400 bg-red-50 dark:bg-red-950/20',
          state === 'empty' && 'border-muted',
          state === 'already-claimed' && 'border-orange-300 bg-orange-50 dark:bg-orange-950/20',
          (state === 'ready' || state === 'loading' || state === 'claiming') && 'border-primary/30'
        )}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-4 shadow-lg shadow-primary/25">
            <Gift className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Dana Kaget! 🎉
          </h2>
          {providerAddress && (
            <p className="text-sm text-muted-foreground">
              dari {truncateAddress(providerAddress)}
            </p>
          )}
        </div>

        {/* Content based on state */}
        <AnimatePresence mode="wait">
          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Amount skeleton */}
              <div className="p-4 rounded-2xl bg-muted/50 border border-border">
                <div className="h-4 w-28 mx-auto mb-2 rounded bg-muted animate-pulse" />
                <div className="h-10 w-36 mx-auto rounded bg-muted animate-pulse" />
              </div>

              {/* Progress skeleton */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
              </div>

              {/* Button skeleton */}
              <div className="h-14 w-full rounded-2xl bg-muted animate-pulse" />
            </motion.div>
          )}

          {state === 'ready' && (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Amount preview */}
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Kamu bisa dapat hingga</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatIDRX(maxPerClaim)}
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sisa Dana</span>
                  <span className="font-medium text-foreground">{formatIDRX(remainingFund)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ 
                      width: `${totalFund > 0n ? Number((remainingFund * 100n) / totalFund) : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Gasless badge */}
              {isGasless && (
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full py-1.5 px-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Gratis Gas Fee!</span>
                </div>
              )}

              {/* Action */}
              {!mounted || !isConnected ? (
                <div className="flex justify-center">
                  <WalletButton />
                </div>
              ) : isWrongChain ? (
                <button
                  onClick={() => switchChain({ chainId: baseSepolia.id })}
                  className={cn(
                    'w-full py-4 rounded-2xl font-bold text-lg',
                    'bg-orange-500 hover:bg-orange-600 text-white',
                    'transition-all duration-200'
                  )}
                >
                  Ganti ke Base Sepolia
                </button>
              ) : (
                <motion.button
                  onClick={handleClaim}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full py-4 rounded-2xl font-bold text-lg',
                    'bg-primary hover:bg-primary/90 text-primary-foreground',
                    'shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
                    'transition-all duration-200'
                  )}
                >
                  🎁 AMBIL DANA SEKARANG
                </motion.button>
              )}
            </motion.div>
          )}

          {state === 'claiming' && (
            <motion.div
              key="claiming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-1">
                Dana Sedang Dikirim...
              </p>
              <p className="text-sm text-muted-foreground">
                {isPending ? 'Menunggu konfirmasi wallet...' : 'Memproses transaksi...'}
              </p>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                Berhasil Klaim! 🎉
              </h3>
              <p className="text-lg text-foreground mb-4">
                Kamu dapat <span className="font-bold">{formatIDRX(claimedAmount || maxPerClaim)}</span>
              </p>
              {hash && (
                <a
                  href={getExplorerUrl(hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Lihat di BaseScan
                </a>
              )}
            </motion.div>
          )}

          {state === 'already-claimed' && (
            <motion.div
              key="already-claimed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">😊</span>
              </div>
              <h3 className="text-xl font-bold text-orange-700 dark:text-orange-400 mb-2">
                Kamu Sudah Klaim
              </h3>
              <p className="text-muted-foreground">
                Bagi-bagi link ke teman ya!
              </p>
            </motion.div>
          )}

          {state === 'empty' && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">😢</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Yah, Telat!
              </h3>
              <p className="text-muted-foreground">
                Kuota sudah habis, coba lagi lain waktu ya!
              </p>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                Gagal Klaim
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {error?.message || 'Terjadi kesalahan, coba lagi nanti'}
              </p>
              <button
                onClick={() => setState('ready')}
                className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
              >
                Coba Lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
