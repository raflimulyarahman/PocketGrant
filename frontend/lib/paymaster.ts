'use client'

/**
 * Paymaster Configuration for Gasless Transactions
 * 
 * To enable gasless transactions:
 * 1. Get a Coinbase Developer Platform (CDP) API key at https://portal.cdp.coinbase.com/
 * 2. Create a Paymaster for Base Sepolia
 * 3. Add the Paymaster URL to your .env.local:
 *    NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/...
 */

// Check if paymaster is configured
export function isPaymasterEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_PAYMASTER_URL
}

// Get paymaster URL
export function getPaymasterUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_PAYMASTER_URL
}

// Get paymaster capabilities for wagmi writeContract
export function getPaymasterCapabilities() {
  const url = getPaymasterUrl()
  
  if (!url) {
    return undefined
  }
  
  return {
    paymasterService: {
      url,
    },
  }
}

// Build write contract options with optional paymaster
export function withPaymaster<T extends object>(options: T): T & { capabilities?: ReturnType<typeof getPaymasterCapabilities> } {
  const capabilities = getPaymasterCapabilities()
  
  if (!capabilities) {
    return options
  }
  
  return {
    ...options,
    // @ts-ignore - capabilities for paymaster
    capabilities,
  }
}
