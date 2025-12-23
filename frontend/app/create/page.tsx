'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, CheckCircle2, ExternalLink, Copy, Share2 } from 'lucide-react'
import Link from 'next/link'
import { BentoCard } from '@/components/bento-card'
import { WalletButton } from '@/components/wallet-button'
import { useIDRXBalance, useIDRXAllowance, useApproveIDRX } from '@/hooks/useIDRX'
import { useCreateProgram } from '@/hooks/usePocketGrant'
import { formatIDRX, parseIDRX, getExplorerUrl, cn } from '@/lib/utils'
import { POCKETGRANT_ADDRESS, PROGRAM_MODE } from '@/lib/contracts'

type Step = 'input' | 'approve' | 'create' | 'success'

export default function CreateProgramPage() {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [step, setStep] = useState<Step>('input')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  
  // Form state
  const [totalAmount, setTotalAmount] = useState('')
  const [perClaimAmount, setPerClaimAmount] = useState('')
  const [programId, setProgramId] = useState<string | null>(null)
  
  // Contract hooks
  const { data: balance } = useIDRXBalance(address)
  const { data: allowance, refetch: refetchAllowance } = useIDRXAllowance(address)
  const { approve, isPending: approving, isSuccess: approveSuccess } = useApproveIDRX()
  const { create, hash, isPending: creating, isSuccess: createSuccess } = useCreateProgram()

  const totalFund = totalAmount ? parseIDRX(totalAmount) : 0n
  const maxPerClaim = perClaimAmount ? parseIDRX(perClaimAmount) : 0n
  const hasEnoughBalance = balance !== undefined && balance >= totalFund
  const needsApproval = allowance !== undefined && allowance < totalFund
  const isWrongChain = isConnected && chain?.id !== baseSepolia.id

  // Handle approval
  const handleApprove = async () => {
    setStep('approve')
    approve(totalFund)
  }

  // Handle create
  const handleCreate = async () => {
    setStep('create')
    create({
      totalFund,
      maxPerClaim,
      mode: PROGRAM_MODE.DanaKaget,
      capPerWallet: 0n,
      start: 0n,
      end: 0n,
      giftCodeHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
      requireVerification: false
    })
  }

  // Watch for approval success
  if (approveSuccess && step === 'approve') {
    refetchAllowance()
    setStep('input')
  }

  // Watch for create success  
  if (createSuccess && step === 'create') {
    setStep('success')
    // Extract program ID from logs (simplified - in production parse from tx receipt)
    setProgramId('1') // Placeholder
  }

  const claimUrl = programId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/claim/${programId}` : ''

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            href="/"
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="font-bold text-lg text-gray-900">Buat Dana Kaget</h1>
            <p className="text-xs text-gray-500">Deposit IDRX dan bagikan link</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {step === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BentoCard variant="highlight" size="lg" className="text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Dana Kaget Siap! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Bagikan link ini ke penerima dana
              </p>

              {/* Share URL */}
              <div className="bg-gray-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-2">Link Klaim</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={claimUrl}
                    readOnly
                    className="flex-1 bg-white rounded-lg px-3 py-2 text-sm border border-gray-200"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(claimUrl)}
                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <a
                  href={hash ? getExplorerUrl(hash) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  BaseScan
                </a>
                <Link
                  href={`/claim/${programId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0052FF] text-white hover:bg-[#0047E0]"
                >
                  <Share2 className="w-4 h-4" />
                  Lihat Halaman Klaim
                </Link>
              </div>
            </BentoCard>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Wallet Check */}
            {(!mounted || !isConnected) && (
              <BentoCard>
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Hubungkan dompet untuk melanjutkan</p>
                  <WalletButton />
                </div>
              </BentoCard>
            )}

            {mounted && isConnected && isWrongChain && (
              <BentoCard variant="accent">
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Ganti ke jaringan Base Sepolia</p>
                  <button
                    onClick={() => switchChain({ chainId: baseSepolia.id })}
                    className="px-6 py-2 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
                  >
                    Ganti Jaringan
                  </button>
                </div>
              </BentoCard>
            )}

            {mounted && isConnected && !isWrongChain && (
              <>
                {/* Balance Info */}
                <BentoCard>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Saldo IDRX</span>
                    <span className="font-bold text-lg">
                      {balance !== undefined ? formatIDRX(balance) : 'Loading...'}
                    </span>
                  </div>
                </BentoCard>

                {/* Form */}
                <BentoCard size="lg">
                  <div className="space-y-6">
                    {/* Total Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Dana (IDRX dalam Rupiah)
                      </label>
                      <input
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        placeholder="100000"
                        className={cn(
                          'w-full px-4 py-3 rounded-xl border text-lg',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500',
                          !hasEnoughBalance && totalAmount ? 'border-red-300' : 'border-gray-200'
                        )}
                      />
                      {!hasEnoughBalance && totalAmount && (
                        <p className="text-red-500 text-sm mt-1">Saldo tidak cukup</p>
                      )}
                    </div>

                    {/* Per Claim */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Per Klaim (IDRX dalam Rupiah)
                      </label>
                      <input
                        type="number"
                        value={perClaimAmount}
                        onChange={(e) => setPerClaimAmount(e.target.value)}
                        placeholder="10000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Preview */}
                    {totalAmount && perClaimAmount && (
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Deposit</span>
                          <span className="font-medium">{formatIDRX(totalFund)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Per Klaim</span>
                          <span className="font-medium">{formatIDRX(maxPerClaim)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Estimasi Penerima</span>
                          <span className="font-medium">
                            {maxPerClaim > 0n ? (totalFund / maxPerClaim).toString() : '0'} orang
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                      {needsApproval ? (
                        <button
                          onClick={handleApprove}
                          disabled={approving || !hasEnoughBalance || !totalAmount}
                          className={cn(
                            'w-full py-4 rounded-xl font-bold text-lg',
                            'bg-orange-500 hover:bg-orange-600 text-white',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center justify-center gap-2'
                          )}
                        >
                          {approving && <Loader2 className="w-5 h-5 animate-spin" />}
                          {approving ? 'Approving...' : 'Approve IDRX'}
                        </button>
                      ) : (
                        <button
                          onClick={handleCreate}
                          disabled={creating || !hasEnoughBalance || !totalAmount || !perClaimAmount}
                          className={cn(
                            'w-full py-4 rounded-xl font-bold text-lg',
                            'bg-[#0052FF] hover:bg-[#0047E0] text-white',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center justify-center gap-2'
                          )}
                        >
                          {creating && <Loader2 className="w-5 h-5 animate-spin" />}
                          {creating ? 'Membuat Program...' : 'Buat Dana Kaget'}
                        </button>
                      )}
                    </div>
                  </div>
                </BentoCard>
              </>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}
