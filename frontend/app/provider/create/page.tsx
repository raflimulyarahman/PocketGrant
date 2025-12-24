'use client'

import { useState, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, CheckCircle2, ExternalLink, FileText, Shield, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { HamburgerMenu } from '@/components/hamburger-menu'
import { WalletButton } from '@/components/wallet-button'
import { useIDRXBalance, useIDRXAllowance, useApproveIDRX } from '@/hooks/useIDRX'
import { useCreateProgram } from '@/hooks/usePocketGrant'
import { formatIDRX, parseIDRX, getExplorerUrl, cn } from '@/lib/utils'
import { PROGRAM_MODE } from '@/lib/contracts'

type Step = 'input' | 'approve' | 'create' | 'success'

export default function CreateRequestProgramPage() {
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()
  const [step, setStep] = useState<Step>('input')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Form state
  const [totalAmount, setTotalAmount] = useState('')
  const [maxPerRequest, setMaxPerRequest] = useState('')
  const [duration, setDuration] = useState('30') // days
  const [requireVerification, setRequireVerification] = useState(true)
  const [programId, setProgramId] = useState<string | null>(null)
  
  // Contract hooks
  const { data: balance } = useIDRXBalance(address)
  const { data: allowance, refetch: refetchAllowance } = useIDRXAllowance(address)
  const { approve, isPending: approving, isSuccess: approveSuccess } = useApproveIDRX()
  const { create, hash, isPending: creating, isSuccess: createSuccess } = useCreateProgram()

  const totalFund = totalAmount ? parseIDRX(totalAmount) : 0n
  const maxPerClaim = maxPerRequest ? parseIDRX(maxPerRequest) : 0n
  const hasEnoughBalance = balance !== undefined && balance >= totalFund
  const needsApproval = allowance !== undefined && allowance < totalFund
  const isWrongChain = isConnected && chain?.id !== baseSepolia.id

  // Handle approval
  const handleApprove = async () => {
    setStep('approve')
    approve(totalFund)
  }

  // Handle create - Request mode
  const handleCreate = async () => {
    setStep('create')
    const now = Math.floor(Date.now() / 1000)
    const endTime = now + (parseInt(duration) * 24 * 60 * 60)
    
    create({
      totalFund,
      maxPerClaim,
      mode: PROGRAM_MODE.Request,
      capPerWallet: 0n,
      start: BigInt(now),
      end: BigInt(endTime),
      giftCodeHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
      requireVerification
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
    setProgramId('1') // Placeholder - in production, parse from tx receipt
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Professional Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <HamburgerMenu />

      {/* Header */}
      <header className="fixed top-0 right-0 z-50 p-4 flex items-center gap-3">
        {mounted && <WalletButton />}
      </header>

      {/* Main */}
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/30">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Program Beasiswa 📝</h1>
            <p className="text-muted-foreground">Buat program bantuan dana pendidikan</p>
            <p className="text-xs text-green-500 mt-2">✅ Penerima mengajukan, Anda yang approve</p>
          </div>

          {step === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-card border border-border p-6 text-center"
            >
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Program Beasiswa Berhasil Dibuat! 📝
              </h2>
              <p className="text-muted-foreground mb-6">
                Bagikan informasi program ini ke calon penerima
              </p>

              <div className="flex gap-3 justify-center">
                <a
                  href={hash ? getExplorerUrl(hash) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80"
                >
                  <ExternalLink className="w-4 h-4" />
                  BaseScan
                </a>
                <Link
                  href="/provider"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600"
                >
                  <Users className="w-4 h-4" />
                  Kelola Program
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl bg-card border border-border p-6 space-y-6">
              {/* Wallet Check */}
              {(!mounted || !isConnected) && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Hubungkan dompet untuk melanjutkan</p>
                  <WalletButton />
                </div>
              )}

              {mounted && isConnected && isWrongChain && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Ganti ke jaringan Base Sepolia</p>
                  <button
                    onClick={() => switchChain({ chainId: baseSepolia.id })}
                    className="px-6 py-2 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600"
                  >
                    Ganti Jaringan
                  </button>
                </div>
              )}

              {mounted && isConnected && !isWrongChain && (
                <>
                  {/* Balance Info */}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                    <span className="text-muted-foreground">Saldo IDRX</span>
                    <span className="font-bold text-lg text-foreground">
                      {balance !== undefined ? formatIDRX(balance) : 'Loading...'}
                    </span>
                  </div>

                  {/* Form */}
                  <div className="space-y-5">
                    {/* Total Amount */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Total Dana Program (Rupiah)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                        <input
                          type="number"
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          placeholder="1000000"
                          className={cn(
                            'w-full pl-12 pr-4 py-3 rounded-xl border text-lg font-bold',
                            'bg-background border-border focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
                            'outline-none transition-all',
                            !hasEnoughBalance && totalAmount ? 'border-destructive' : ''
                          )}
                        />
                      </div>
                      {!hasEnoughBalance && totalAmount && (
                        <p className="text-destructive text-sm mt-1">Saldo tidak cukup</p>
                      )}
                    </div>

                    {/* Max Per Request */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Maksimal Per Permohonan (Rupiah)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                        <input
                          type="number"
                          value={maxPerRequest}
                          onChange={(e) => setMaxPerRequest(e.target.value)}
                          placeholder="100000"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-lg font-bold focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <Clock className="w-4 h-4" />
                        Durasi Program
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                      >
                        <option value="7">7 Hari</option>
                        <option value="14">14 Hari</option>
                        <option value="30">30 Hari</option>
                        <option value="60">60 Hari</option>
                        <option value="90">90 Hari</option>
                      </select>
                    </div>

                    {/* Verification Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium text-foreground">Wajib Verifikasi</p>
                          <p className="text-xs text-muted-foreground">Penerima harus diverifikasi admin</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRequireVerification(!requireVerification)}
                        className={cn(
                          'relative w-12 h-6 rounded-full transition-colors',
                          requireVerification ? 'bg-green-500' : 'bg-muted'
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                            requireVerification ? 'translate-x-7' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>

                    {/* Preview */}
                    {totalAmount && maxPerRequest && (
                      <div className="bg-green-500/10 rounded-xl p-4 space-y-2 border border-green-500/30">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Dana</span>
                          <span className="font-medium text-foreground">{formatIDRX(totalFund)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Max/Permohonan</span>
                          <span className="font-medium text-foreground">{formatIDRX(maxPerClaim)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Durasi</span>
                          <span className="font-medium text-foreground">{duration} Hari</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-green-500/20">
                          <span className="text-green-600 font-medium">Mode</span>
                          <span className="font-bold text-green-600">📝 Request (Perlu Approval)</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2">
                      {needsApproval ? (
                        <button
                          onClick={handleApprove}
                          disabled={approving || !hasEnoughBalance || !totalAmount}
                          className={cn(
                            'w-full py-4 rounded-xl font-bold text-lg',
                            'bg-orange-500 hover:bg-orange-600 text-white',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center justify-center gap-2',
                            'active:scale-[0.98] transition-all'
                          )}
                        >
                          {approving && <Loader2 className="w-5 h-5 animate-spin" />}
                          {approving ? 'Approving...' : 'Approve IDRX'}
                        </button>
                      ) : (
                        <button
                          onClick={handleCreate}
                          disabled={creating || !hasEnoughBalance || !totalAmount || !maxPerRequest}
                          className={cn(
                            'w-full py-4 rounded-xl font-bold text-lg',
                            'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'flex items-center justify-center gap-2',
                            'active:scale-[0.98] transition-all shadow-lg shadow-green-500/25'
                          )}
                        >
                          {creating && <Loader2 className="w-5 h-5 animate-spin" />}
                          {creating ? 'Membuat...' : '📝 Buat Program Beasiswa'}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Info */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            💡 Penerima akan mengajukan permohonan, Anda review dan approve secara manual
          </p>
        </motion.div>
      </main>
    </div>
  )
}
