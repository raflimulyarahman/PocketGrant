'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { motion } from 'framer-motion'
import { ArrowLeft, Gift, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useProgram, useClaimGift, useHasClaimed, useIsVerified } from '@/hooks/usePocketGrant'
import { formatIDRX, cn } from '@/lib/utils'
import { WalletButton } from '@/components/wallet-button'
import { BentoCard } from '@/components/bento-card'
import Link from 'next/link'
import confetti from 'canvas-confetti'

export default function GiftPage() {
  const params = useParams()
  const router = useRouter()
  const programId = BigInt(params.id as string)
  
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  
  const [giftCode, setGiftCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState('')
  
  const { data: program, isLoading: loadingProgram } = useProgram(programId)
  const { data: hasClaimed } = useHasClaimed(programId, address)
  const { data: isVerified } = useIsVerified(programId, address)
  const { claimGift, isPending, isConfirming, isSuccess, error: txError, reset } = useClaimGift()
  
  const isWrongChain = isConnected && chain?.id !== baseSepolia.id
  const requiresVerification = program?.[9]
  const maxPerClaim = program?.[3] || 0n
  const mode = program?.[4]
  
  // Validate mode (must be GiftCard = 2)
  useEffect(() => {
    if (program && mode !== 2) {
      router.push(`/claim/${programId}`)
    }
  }, [program, mode, programId, router])
  
  // Trigger confetti on success
  useEffect(() => {
    if (isSuccess) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
    }
  }, [isSuccess])
  
  const handleClaim = () => {
    setError('')
    
    if (!giftCode.trim()) {
      setError('Masukkan kode hadiah')
      return
    }
    
    claimGift(programId, giftCode.trim())
  }
  
  if (loadingProgram) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 border-b border-border backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Link>
          <WalletButton />
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BentoCard size="lg" className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Klaim Gift Card</h1>
              <p className="text-muted-foreground mt-1">Program #{programId.toString()}</p>
            </div>
            
            {/* Already Claimed */}
            {hasClaimed && (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-600 dark:text-orange-400">Sudah Diklaim</p>
                  <p className="text-sm text-muted-foreground">Kamu sudah pernah klaim hadiah dari program ini.</p>
                </div>
              </div>
            )}
            
            {/* Verification Check */}
            {requiresVerification && !isVerified && isConnected && !hasClaimed && (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-600 dark:text-orange-400">Verifikasi Diperlukan</p>
                  <p className="text-sm text-muted-foreground">Akun kamu harus diverifikasi terlebih dahulu.</p>
                </div>
              </div>
            )}
            
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                  🎁 Gift Card Berhasil Diklaim!
                </h3>
                <p className="text-muted-foreground mb-2">
                  Kamu mendapatkan
                </p>
                <p className="text-3xl font-bold text-foreground mb-6">
                  {formatIDRX(maxPerClaim)}
                </p>
                <Link
                  href="/"
                  className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium inline-block"
                >
                  Kembali ke Beranda
                </Link>
              </motion.div>
            ) : hasClaimed ? (
              <div className="text-center py-4">
                <Link
                  href="/"
                  className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium inline-block"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            ) : (
              <>
                {/* Info */}
                <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Nilai Hadiah</span>
                    <span className="font-medium text-foreground">{formatIDRX(maxPerClaim)}</span>
                  </div>
                </div>
                
                {/* Gift Code Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Kode Hadiah</label>
                  <div className="relative">
                    <input
                      type={showCode ? 'text' : 'password'}
                      value={giftCode}
                      onChange={(e) => setGiftCode(e.target.value)}
                      placeholder="Masukkan kode rahasia"
                      disabled={isPending || isConfirming}
                      className={cn(
                        'w-full px-4 py-4 pr-12 rounded-xl border text-lg font-mono',
                        'bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'outline-none transition-all uppercase tracking-widest'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  {txError && <p className="text-sm text-destructive">Kode tidak valid atau sudah digunakan</p>}
                </div>
                
                {/* Action Button */}
                {!isConnected ? (
                  <div className="flex justify-center">
                    <WalletButton />
                  </div>
                ) : isWrongChain ? (
                  <button
                    onClick={() => switchChain({ chainId: baseSepolia.id })}
                    className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
                  >
                    Ganti ke Base Sepolia
                  </button>
                ) : requiresVerification && !isVerified ? (
                  <button
                    disabled
                    className="w-full py-4 rounded-xl bg-muted text-muted-foreground font-bold cursor-not-allowed"
                  >
                    Menunggu Verifikasi
                  </button>
                ) : (
                  <button
                    onClick={handleClaim}
                    disabled={isPending || isConfirming || !giftCode}
                    className={cn(
                      'w-full py-4 rounded-xl font-bold text-lg',
                      'bg-purple-500 hover:bg-purple-600 text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-colors'
                    )}
                  >
                    {isPending || isConfirming ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isPending ? 'Konfirmasi Wallet...' : 'Memproses...'}
                      </span>
                    ) : (
                      '🎁 Klaim Hadiah'
                    )}
                  </button>
                )}
              </>
            )}
          </BentoCard>
        </motion.div>
      </main>
    </div>
  )
}
