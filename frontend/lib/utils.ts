import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format IDRX amount (6 decimals)
export function formatIDRX(amount: bigint): string {
  const decimals = 6
  const value = Number(amount) / Math.pow(10, decimals)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('IDR', 'Rp')
}

// Parse IDRX amount to bigint
export function parseIDRX(amount: string | number): bigint {
  const decimals = 6
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return BigInt(Math.floor(value * Math.pow(10, decimals)))
}

// Truncate address
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Get BaseScan URL
export function getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
  const baseUrl = 'https://sepolia.basescan.org'
  return `${baseUrl}/${type}/${hash}`
}
