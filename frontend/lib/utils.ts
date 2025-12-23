import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format IDRX amount (2 decimals for IDRX standard)
export function formatIDRX(amount: bigint): string {
  const decimals = 2
  const value = Number(amount) / Math.pow(10, decimals)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('IDR', 'Rp')
}

// Parse IDRX amount to bigint (2 decimals)
export function parseIDRX(amount: string | number): bigint {
  const decimals = 2
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return BigInt(Math.floor(value * Math.pow(10, decimals)))
}

// Parse amount with custom decimals
export function parseUnits(amount: string | number, decimals: number): bigint {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount
  return BigInt(Math.floor(value * Math.pow(10, decimals)))
}

// Format units with custom decimals
export function formatUnits(amount: bigint, decimals: number): string {
  return (Number(amount) / Math.pow(10, decimals)).toString()
}

// Truncate address
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Get BaseScan URL
export function getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
  const baseUrl = 'https://sepolia.basescan.org'
  return `${baseUrl}/${type}/${hash}`
}

