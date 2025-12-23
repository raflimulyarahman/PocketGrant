'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAccount, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useProgram, useSubmitRequest, useIsVerified } from '@/hooks/usePocketGrant'
import { formatIDRX, cn, parseUnits } from '@/lib/utils'
import { WalletButton } from '@/components/wallet-button'
import { BentoCard } from '@/components/bento-card'
import Link from 'next/link'

export default function RequestPage() {
  const params = useParams()
  const router = useRouter()
  const programId = BigInt(params.id as string)
  
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  
  const { data: program, isLoading: loadingProgram } = useProgram(programId)
  const { data: isVerified } = useIsVerified(programId, address)
  const { submitRequest, isPending, isConfirming, isSuccess, error: txError, reset } = useSubmitRequest()
  
  const isWrongChain = isConnected && chain?.id !== baseSepolia.id
  const requiresVerification = program?.[9] // requireVerification field
  const maxPerClaim = program?.[3] || 0n
  const mode = program?.[4]
  
  // Validate mode (must be Request = 0)
  useEffect(() => {
    if (program && mode !== 0) {
      router.push(`/claim/${programId}`)
    }
  }, [program, mode, programId, router])
  
  const handleSubmit = () => {
    setError('')
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Masukkan jumlah yang valid')
      return
    }
    
    const amountBigInt = parseUnits(amount, 2) // IDRX has 2 decimals
    
    if (amountBigInt > maxPerClaim) {
      setError(`Maksimal ${formatIDRX(maxPerClaim)}`)
      return
    }
    
    submitRequest(programId, amountBigInt)
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
              <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Ajukan Permohonan Dana</h1>
              <p className="text-muted-foreground mt-1">Program #{programId.toString()}</p>
            </div>
            
            {/* Verification Check */}
            {requiresVerification && !isVerified && isConnected && (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-600 dark:text-orange-400">Verifikasi Diperlukan</p>
                  <p className="text-sm text-muted-foreground">Akun kamu harus diverifikasi terlebih dahulu oleh admin.</p>
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
                  Permohonan Terkirim!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Permohonan kamu sebesar <span className="font-bold">Rp {amount}</span> sedang ditinjau.
                </p>
                <button
                  onClick={() => {
                    reset()
                    setAmount('')
                  }}
                  className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium"
                >
                  Ajukan Lagi
                </button>
              </motion.div>
            ) : (
              <>
                {/* Info */}
                <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Maksimal per permohonan</span>
                    <span className="font-medium text-foreground">{formatIDRX(maxPerClaim)}</span>
                  </div>
                </div>
                
                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Jumlah yang Dimohonkan</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      disabled={isPending || isConfirming}
                      className={cn(
                        'w-full pl-12 pr-4 py-4 rounded-xl border text-lg font-bold',
                        'bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'outline-none transition-all'
                      )}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
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
                    onClick={handleSubmit}
                    disabled={isPending || isConfirming || !amount}
                    className={cn(
                      'w-full py-4 rounded-xl font-bold text-lg',
                      'bg-green-500 hover:bg-green-600 text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-colors'
                    )}
                  >
                    {isPending || isConfirming ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isPending ? 'Konfirmasi Wallet...' : 'Mengirim...'}
                      </span>
                    ) : (
                      '📝 Ajukan Permohonan'
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
