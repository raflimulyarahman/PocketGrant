'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { POCKETGRANT_ADDRESS, POCKETGRANT_ABI } from '@/lib/contracts'
import { useEffect } from 'react'
import { toast } from 'sonner'

// ===== READ HOOKS =====

// Read program data
export function useProgram(programId: bigint) {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'getProgram',
    args: [programId],
  })
}

// Check if user can claim Dana Kaget
export function useCanClaim(programId: bigint, wallet: `0x${string}` | undefined) {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'canClaimDanaKaget',
    args: wallet ? [programId, wallet] : undefined,
    query: { enabled: !!wallet },
  })
}

// Check if user has already claimed
export function useHasClaimed(programId: bigint, wallet: `0x${string}` | undefined) {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'hasClaimed',
    args: wallet ? [programId, wallet] : undefined,
    query: { enabled: !!wallet },
  })
}

// Get program count
export function useProgramCount() {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'programCount',
  })
}

// Check if user is verified for a program
export function useIsVerified(programId: bigint, wallet: `0x${string}` | undefined) {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'verifiedBeneficiaries',
    args: wallet ? [programId, wallet] : undefined,
    query: { enabled: !!wallet },
  })
}

// Get admin address
export function useAdmin() {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'admin',
  })
}

// Check if address is verifier
export function useIsVerifier(address: `0x${string}` | undefined) {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'verifiers',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
}

// Check global pause status
export function useGlobalPaused() {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'globalPaused',
  })
}

// ===== WRITE HOOKS =====

// Claim Dana Kaget
export function useClaimDanaKaget() {
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (hash && isConfirming) {
      toast.loading('Mengkonfirmasi transaksi...', { id: 'claim-tx' })
    }
  }, [hash, isConfirming])

  useEffect(() => {
    if (isSuccess) {
      toast.success('🎉 Klaim berhasil! Dana sudah masuk ke wallet-mu.', { id: 'claim-tx' })
    }
  }, [isSuccess])

  useEffect(() => {
    if (error) {
      const msg = parseError(error)
      toast.error(msg, { id: 'claim-tx' })
    }
  }, [error])

  const claim = (programId: bigint) => {
    toast.loading('Menunggu konfirmasi wallet...', { id: 'claim-tx' })
    writeContract({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'claimDanaKaget',
      args: [programId],
    })
  }

  return { claim, hash, isPending, isConfirming, isSuccess, error, reset }
}

// Claim GiftCard
export function useClaimGift() {
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (hash && isConfirming) {
      toast.loading('Memverifikasi kode hadiah...', { id: 'gift-tx' })
    }
  }, [hash, isConfirming])

  useEffect(() => {
    if (isSuccess) {
      toast.success('🎁 Gift Card berhasil diklaim!', { id: 'gift-tx' })
    }
  }, [isSuccess])

  useEffect(() => {
    if (error) {
      const msg = parseError(error)
      toast.error(msg, { id: 'gift-tx' })
    }
  }, [error])

  const claimGift = (programId: bigint, giftCode: string) => {
    toast.loading('Menunggu konfirmasi wallet...', { id: 'gift-tx' })
    writeContract({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'claimGift',
      args: [programId, giftCode],
    })
  }

  return { claimGift, hash, isPending, isConfirming, isSuccess, error, reset }
}

// Submit Request
export function useSubmitRequest() {
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (hash && isConfirming) {
      toast.loading('Mengajukan permohonan...', { id: 'request-tx' })
    }
  }, [hash, isConfirming])

  useEffect(() => {
    if (isSuccess) {
      toast.success('📝 Permohonan berhasil diajukan!', { id: 'request-tx' })
    }
  }, [isSuccess])

  useEffect(() => {
    if (error) {
      const msg = parseError(error)
      toast.error(msg, { id: 'request-tx' })
    }
  }, [error])

  const submitRequest = (programId: bigint, amount: bigint) => {
    toast.loading('Menunggu konfirmasi wallet...', { id: 'request-tx' })
    writeContract({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'submitRequest',
      args: [programId, amount],
    })
  }

  return { submitRequest, hash, isPending, isConfirming, isSuccess, error, reset }
}

// Create program
export function useCreateProgram() {
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (hash && isConfirming) {
      toast.loading('Membuat program...', { id: 'create-tx' })
    }
  }, [hash, isConfirming])

  useEffect(() => {
    if (isSuccess) {
      toast.success('✅ Program berhasil dibuat!', { id: 'create-tx' })
    }
  }, [isSuccess])

  useEffect(() => {
    if (error) {
      const msg = parseError(error)
      toast.error(msg, { id: 'create-tx' })
    }
  }, [error])

  const create = (config: {
    totalFund: bigint
    maxPerClaim: bigint
    mode: number
    capPerWallet: bigint
    start: bigint
    end: bigint
    giftCodeHash: `0x${string}`
    requireVerification: boolean
  }) => {
    toast.loading('Menunggu konfirmasi wallet...', { id: 'create-tx' })
    writeContract({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'createProgram',
      args: [config],
    })
  }

  return { create, hash, isPending, isConfirming, isSuccess, error, reset }
}

// ===== PROVIDER HOOKS =====

export function usePauseProgram() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) toast.success('⏸️ Program dijeda', { id: 'pause-tx' })
  }, [isSuccess])

  useEffect(() => {
    if (error) toast.error(parseError(error), { id: 'pause-tx' })
  }, [error])

  const pause = (programId: bigint) => {
    toast.loading('Menjeda program...', { id: 'pause-tx' })
    writeContract({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'pauseProgram',
      args: [programId],
    })
  }

  return { pause, hash, isPending, isConfirming, isSuccess, error }
}

export function useResumeProgram() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) toast.success('▶️ Program dilanjutkan', { id: 'resume-tx' })
  }, [isSuccess])

  useEffect(() => {
    if (error) toast.error(parseError(error), { id: 'resume-tx' })
  }, [error])

  const resume = (programId: bigint) => {
    toast.loading('Melanjutkan program...', { id: 'resume-tx' })
    writeContract({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'resumeProgram',
      args: [programId],
    })
  }

  return { resume, hash, isPending, isConfirming, isSuccess, error }
}

export function useEndProgram() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) toast.success('🏁 Program diakhiri', { id: 'end-tx' })
  }, [isSuccess])

  useEffect(() => {
    if (error) toast.error(parseError(error), { id: 'end-tx' })
  }, [error])

  const end = (programId: bigint) => {
    toast.loading('Mengakhiri program...', { id: 'end-tx' })
    writeContract({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'endProgram',
      args: [programId],
    })
  }

  return { end, hash, isPending, isConfirming, isSuccess, error }
}

// ===== VERIFIER HOOKS =====

export function useVerifyBeneficiary() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) toast.success('✅ Pengguna terverifikasi', { id: 'verify-tx' })
  }, [isSuccess])

  useEffect(() => {
    if (error) toast.error(parseError(error), { id: 'verify-tx' })
  }, [error])

  const verify = (programId: bigint, beneficiary: `0x${string}`) => {
    toast.loading('Memverifikasi pengguna...', { id: 'verify-tx' })
    writeContract({
      address: POCKETGRANT_ADDRESS,
      abi: POCKETGRANT_ABI,
      functionName: 'verifyBeneficiary',
      args: [programId, beneficiary],
    })
  }

  return { verify, hash, isPending, isConfirming, isSuccess, error }
}

// ===== HELPER FUNCTIONS =====

function parseError(error: Error): string {
  const msg = error.message.toLowerCase()
  
  if (msg.includes('user rejected') || msg.includes('user denied')) {
    return 'Transaksi dibatalkan'
  }
  if (msg.includes('insufficient funds')) {
    return 'Saldo tidak cukup untuk gas'
  }
  if (msg.includes('already claimed')) {
    return 'Kamu sudah pernah klaim'
  }
  if (msg.includes('program not active')) {
    return 'Program tidak aktif'
  }
  if (msg.includes('invalid code')) {
    return 'Kode hadiah tidak valid'
  }
  if (msg.includes('not verified')) {
    return 'Akun belum terverifikasi'
  }
  if (msg.includes('program expired')) {
    return 'Program sudah berakhir'
  }
  if (msg.includes('not started')) {
    return 'Program belum dimulai'
  }
  
  return 'Terjadi kesalahan, coba lagi'
}
