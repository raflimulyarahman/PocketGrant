'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Sparkles, FileText, Gift, ChevronRight, Loader2 } from 'lucide-react'
import { HamburgerMenu } from '@/components/hamburger-menu'
import { WalletButton } from '@/components/wallet-button'
import { cn, parseIDRX } from '@/lib/utils'
import { PROGRAM_MODE } from '@/lib/contracts'
import { useCreateProgram } from '@/hooks/usePocketGrant'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 'amount' | 'mode' | 'config' | 'success'
type Mode = 'danakaget' | 'request' | 'giftcard'

export default function DonatePage() {
  const router = useRouter()
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [step, setStep] = useState<Step>('amount')
  const [amount, setAmount] = useState('')
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null)
  const [maxPerClaim, setMaxPerClaim] = useState('')
  const [duration, setDuration] = useState('7') // days
  
  const { create, isPending, isConfirming, isSuccess, hash } = useCreateProgram()
  
  const isWrongChain = isConnected && chain?.id !== baseSepolia.id
  
  useEffect(() => {
    if (isSuccess) {
      setStep('success')
    }
  }, [isSuccess])
  
  const handleCreateProgram = () => {
    if (!amount || !selectedMode || !maxPerClaim) return
    
    const now = Math.floor(Date.now() / 1000)
    const endTime = now + (parseInt(duration) * 24 * 60 * 60)
    
    create({
      totalFund: parseIDRX(amount),
      maxPerClaim: parseIDRX(maxPerClaim),
      mode: selectedMode === 'danakaget' ? PROGRAM_MODE.DanaKaget : 
            selectedMode === 'request' ? PROGRAM_MODE.Request : PROGRAM_MODE.GiftCard,
      capPerWallet: 1n,
      start: BigInt(now),
      end: BigInt(endTime),
      giftCodeHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      requireVerification: selectedMode === 'request',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/25">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">My Donation</h1>
            <p className="text-muted-foreground">Berbagi kebaikan dengan mudah</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-card border border-border p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Amount */}
              {step === 'amount' && (
                <motion.div
                  key="amount"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Berapa yang ingin kamu donasikan?
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100.000"
                        className={cn(
                          'w-full pl-12 pr-4 py-4 rounded-xl border text-xl font-bold',
                          'bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                          'outline-none transition-all'
                        )}
                      />
                    </div>
                  </div>
                  
                  {!isConnected ? (
                    <WalletButton />
                  ) : isWrongChain ? (
                    <button
                      onClick={() => switchChain({ chainId: baseSepolia.id })}
                      className="w-full py-4 rounded-xl bg-orange-500 text-white font-bold"
                    >
                      Ganti ke Base Sepolia
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep('mode')}
                      disabled={!amount || parseFloat(amount) <= 0}
                      className={cn(
                        'w-full py-4 rounded-xl font-bold text-lg',
                        'bg-primary text-primary-foreground',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'active:scale-[0.98] transition-all'
                      )}
                    >
                      Lanjutkan
                    </button>
                  )}
                </motion.div>
              )}

              {/* Step 2: Mode */}
              {step === 'mode' && (
                <motion.div
                  key="mode"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setStep('amount')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                  </button>
                  
                  <p className="text-sm font-medium text-foreground mb-4">Pilih mode donasi:</p>

                  {/* Dana Kaget */}
                  <button
                    onClick={() => { setSelectedMode('danakaget'); setStep('config'); }}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border text-left',
                      'hover:border-accent hover:bg-accent/5 transition-all',
                      'active:scale-[0.98]'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">Dana Kaget</p>
                      <p className="text-sm text-muted-foreground">Siapa cepat dia dapat</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>

                  {/* Request Mode */}
                  <button
                    onClick={() => { setSelectedMode('request'); setStep('config'); }}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border text-left',
                      'hover:border-green-500 hover:bg-green-500/5 transition-all',
                      'active:scale-[0.98]'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">Request Mode</p>
                      <p className="text-sm text-muted-foreground">Kamu review sebelum approve</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>

                  {/* Gift Card - Under Construction */}
                  <div className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border text-left',
                    'opacity-50 cursor-not-allowed'
                  )}>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Gift className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground">Gift Card</p>
                      <p className="text-sm text-muted-foreground">Segera hadir</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 text-xs font-medium">
                      Soon
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Config */}
              {step === 'config' && (
                <motion.div
                  key="config"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <button
                    onClick={() => setStep('mode')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                  </button>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Maksimal per klaim
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                      <input
                        type="number"
                        value={maxPerClaim}
                        onChange={(e) => setMaxPerClaim(e.target.value)}
                        placeholder="10.000"
                        className={cn(
                          'w-full pl-12 pr-4 py-3 rounded-xl border',
                          'bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                          'outline-none transition-all'
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Durasi program
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border',
                        'bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                        'outline-none transition-all'
                      )}
                    >
                      <option value="1">1 Hari</option>
                      <option value="3">3 Hari</option>
                      <option value="7">7 Hari</option>
                      <option value="14">14 Hari</option>
                      <option value="30">30 Hari</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCreateProgram}
                    disabled={isPending || isConfirming || !maxPerClaim}
                    className={cn(
                      'w-full py-4 rounded-xl font-bold text-lg',
                      'bg-gradient-to-r from-pink-500 to-red-500 text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'active:scale-[0.98] transition-all'
                    )}
                  >
                    {isPending || isConfirming ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isPending ? 'Konfirmasi...' : 'Membuat...'}
                      </span>
                    ) : (
                      '💝 Buat Program Donasi'
                    )}
                  </button>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Program Berhasil Dibuat!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Bagikan link program ke penerima bantuan
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/provider"
                      className={cn(
                        'block w-full py-3 rounded-xl font-medium',
                        'bg-primary text-primary-foreground',
                        'hover:bg-primary/90 transition-colors'
                      )}
                    >
                      Lihat Program Saya
                    </Link>
                    <button
                      onClick={() => {
                        setStep('amount')
                        setAmount('')
                        setSelectedMode(null)
                        setMaxPerClaim('')
                      }}
                      className="w-full py-3 rounded-xl font-medium bg-muted text-foreground"
                    >
                      Buat Program Lagi
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
