'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { POCKETGRANT_ADDRESS, POCKETGRANT_ABI } from '@/lib/contracts'
import { useEffect } from 'react'
import { toast } from 'sonner'

// Read program data
export function useProgram(programId: bigint) {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'getProgram',
    args: [programId],
  })
}

// Check if user can claim
export function useCanClaim(programId: bigint, wallet: `0x${string}` | undefined) {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'canClaimDanaKaget',
    args: wallet ? [programId, wallet] : undefined,
    query: {
      enabled: !!wallet,
    },
  })
}

// Check if user has already claimed
export function useHasClaimed(programId: bigint, wallet: `0x${string}` | undefined) {
  return useReadContract({
    address: POCKETGRANT_ADDRESS,
    abi: POCKETGRANT_ABI,
    functionName: 'hasClaimed',
    args: wallet ? [programId, wallet] : undefined,
    query: {
      enabled: !!wallet,
    },
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

// Claim Dana Kaget with toast notifications
export function useClaimDanaKaget() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Show toast on transaction states
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
      toast.error(`Gagal klaim: ${error.message.slice(0, 50)}...`, { id: 'claim-tx' })
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

  return {
    claim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

// Create program with toast notifications
export function useCreateProgram() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (hash && isConfirming) {
      toast.loading('Membuat program Dana Kaget...', { id: 'create-tx' })
    }
  }, [hash, isConfirming])

  useEffect(() => {
    if (isSuccess) {
      toast.success('✅ Program berhasil dibuat!', { id: 'create-tx' })
    }
  }, [isSuccess])

  useEffect(() => {
    if (error) {
      toast.error(`Gagal membuat program: ${error.message.slice(0, 50)}...`, { id: 'create-tx' })
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

  return {
    create,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
