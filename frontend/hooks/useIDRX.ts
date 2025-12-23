'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { IDRX_ADDRESS, IDRX_ABI, POCKETGRANT_ADDRESS } from '@/lib/contracts'

// Get IDRX balance
export function useIDRXBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: IDRX_ADDRESS,
    abi: IDRX_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

// Get IDRX allowance for PocketGrant
export function useIDRXAllowance(owner: `0x${string}` | undefined) {
  return useReadContract({
    address: IDRX_ADDRESS,
    abi: IDRX_ABI,
    functionName: 'allowance',
    args: owner ? [owner, POCKETGRANT_ADDRESS] : undefined,
    query: {
      enabled: !!owner,
    },
  })
}

// Approve IDRX spending
export function useApproveIDRX() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const approve = (amount: bigint) => {
    writeContract({
      address: IDRX_ADDRESS,
      abi: IDRX_ABI,
      functionName: 'approve',
      args: [POCKETGRANT_ADDRESS, amount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
