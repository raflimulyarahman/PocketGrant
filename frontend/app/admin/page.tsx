'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, UserCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAdmin, useIsVerifier, useVerifyBeneficiary, useProgramCount, useProgram } from '@/hooks/usePocketGrant'
import { cn, isValidAddress, truncateAddress } from '@/lib/utils'
import { WalletButton } from '@/components/wallet-button'
import { BentoCard } from '@/components/bento-card'
import Link from 'next/link'

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const { data: adminAddress } = useAdmin()
  const { data: isVerifier } = useIsVerifier(address)
  const { data: programCount } = useProgramCount()
  
  const [selectedProgram, setSelectedProgram] = useState('')
  const [beneficiaryAddress, setBeneficiaryAddress] = useState('')
  const [error, setError] = useState('')
  
  const { verify, isPending, isSuccess, error: txError, isConfirming } = useVerifyBeneficiary()
  
  const isAdmin = address && adminAddress && address.toLowerCase() === adminAddress.toLowerCase()
  const hasAccess = isAdmin || isVerifier
  
  const programIds = programCount 
    ? Array.from({ length: Number(programCount) }, (_, i) => (i + 1).toString())
    : []
  
  const handleVerify = () => {
    setError('')
    
    if (!selectedProgram) {
      setError('Pilih program terlebih dahulu')
      return
    }
    
    if (!beneficiaryAddress) {
      setError('Masukkan alamat wallet penerima')
      return
    }
    
    if (!isValidAddress(beneficiaryAddress)) {
      setError('Alamat wallet tidak valid')
      return
    }
    
    verify(BigInt(selectedProgram), beneficiaryAddress as `0x${string}`)
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
          className="space-y-6"
        >
          {/* Title */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Verifier Dashboard</h1>
            <p className="text-muted-foreground">Verifikasi beneficiary untuk program</p>
          </div>
          
          {/* Access Check */}
          {!isConnected ? (
            <BentoCard className="text-center py-8">
              <p className="text-muted-foreground mb-4">Hubungkan wallet untuk mengakses</p>
              <WalletButton />
            </BentoCard>
          ) : !hasAccess ? (
            <BentoCard className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">Akses Ditolak</p>
                  <p className="text-sm text-muted-foreground">
                    Kamu bukan Admin atau Verifier. Hubungi admin untuk mendapatkan akses.
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Admin saat ini:</p>
                <p className="font-mono">{adminAddress ? truncateAddress(adminAddress) : 'Loading...'}</p>
              </div>
            </BentoCard>
          ) : (
            <BentoCard size="lg" className="space-y-6">
              {/* Role Badge */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  isAdmin ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
                )}>
                  {isAdmin ? '👑 Admin' : '✓ Verifier'}
                </span>
              </div>
              
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">
                    Verifikasi Berhasil!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Alamat {truncateAddress(beneficiaryAddress)} sudah terverifikasi untuk Program #{selectedProgram}
                  </p>
                  <button
                    onClick={() => {
                      setBeneficiaryAddress('')
                    }}
                    className="px-6 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium"
                  >
                    Verifikasi Lagi
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Program Select */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Pilih Program</label>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      disabled={isPending || isConfirming}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border',
                        'bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'outline-none transition-all'
                      )}
                    >
                      <option value="">-- Pilih Program --</option>
                      {programIds.map((id) => (
                        <option key={id} value={id}>Program #{id}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Address Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Alamat Wallet Beneficiary</label>
                    <input
                      type="text"
                      value={beneficiaryAddress}
                      onChange={(e) => setBeneficiaryAddress(e.target.value)}
                      placeholder="0x..."
                      disabled={isPending || isConfirming}
                      className={cn(
                        'w-full px-4 py-3 rounded-xl border font-mono text-sm',
                        'bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'outline-none transition-all'
                      )}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {txError && <p className="text-sm text-destructive">Gagal verifikasi: {txError.message.slice(0, 50)}</p>}
                  </div>
                  
                  {/* Verify Button */}
                  <button
                    onClick={handleVerify}
                    disabled={isPending || isConfirming || !selectedProgram || !beneficiaryAddress}
                    className={cn(
                      'w-full py-4 rounded-xl font-bold text-lg',
                      'bg-blue-500 hover:bg-blue-600 text-white',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-colors flex items-center justify-center gap-2'
                    )}
                  >
                    {isPending || isConfirming ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isPending ? 'Konfirmasi Wallet...' : 'Memverifikasi...'}
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5" />
                        Verifikasi Beneficiary
                      </>
                    )}
                  </button>
                </>
              )}
            </BentoCard>
          )}
        </motion.div>
      </main>
    </div>
  )
}
