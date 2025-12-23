// Contract Addresses - Base Sepolia Testnet
// Deployed V2: 2025-12-22
export const POCKETGRANT_ADDRESS = (process.env.NEXT_PUBLIC_POCKETGRANT_ADDRESS || '0x486c001d1a07b15613ba57b9eeb5b1333a1383ef') as `0x${string}`
export const IDRX_ADDRESS = (process.env.NEXT_PUBLIC_IDRX_ADDRESS || '0x7cca9d58715511d51c9d270a155df79c8f990586') as `0x${string}`
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 84532)

// PocketGrant V2 ABI
export const POCKETGRANT_ABI = [
  // Read functions
  {
    inputs: [{ name: 'programId', type: 'uint256' }],
    name: 'getProgram',
    outputs: [
      { name: 'provider', type: 'address' },
      { name: 'totalFund', type: 'uint256' },
      { name: 'remainingFund', type: 'uint256' },
      { name: 'maxPerClaim', type: 'uint256' },
      { name: 'mode', type: 'uint8' },
      { name: 'status', type: 'uint8' },
      { name: 'capPerWallet', type: 'uint256' },
      { name: 'start', type: 'uint64' },
      { name: 'end', type: 'uint64' },
      { name: 'requireVerification', type: 'bool' } // Added in V2
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'programId', type: 'uint256' },
      { name: 'wallet', type: 'address' }
    ],
    name: 'canClaimDanaKaget',
    outputs: [
      { name: 'canClaim', type: 'bool' },
      { name: 'claimAmount', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'programId', type: 'uint256' },
      { name: 'wallet', type: 'address' }
    ],
    name: 'hasClaimed',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'programCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Admin/Verifier Views
  {
    inputs: [],
    name: 'admin',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'verifier', type: 'address' }],
    name: 'verifiers',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'programId', type: 'uint256' },
      { name: 'wallet', type: 'address' }
    ],
    name: 'isVerified',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Write functions
  {
    inputs: [{
      name: 'config',
      type: 'tuple',
      components: [
        { name: 'totalFund', type: 'uint256' },
        { name: 'maxPerClaim', type: 'uint256' },
        { name: 'mode', type: 'uint8' },
        { name: 'capPerWallet', type: 'uint256' },
        { name: 'start', type: 'uint64' },
        { name: 'end', type: 'uint64' },
        { name: 'giftCodeHash', type: 'bytes32' },
        { name: 'requireVerification', type: 'bool' } // Added in V2
      ]
    }],
    name: 'createProgram',
    outputs: [{ name: 'programId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'programId', type: 'uint256' }],
    name: 'claimDanaKaget',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'programId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'topUpProgram',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'programId', type: 'uint256' },
      { indexed: true, name: 'provider', type: 'address' },
      { indexed: false, name: 'totalFund', type: 'uint256' },
      { indexed: false, name: 'mode', type: 'uint8' }
    ],
    name: 'ProgramCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'programId', type: 'uint256' },
      { indexed: true, name: 'claimant', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ],
    name: 'Claimed',
    type: 'event'
  }
] as const

// IDRX (ERC20) ABI
export const IDRX_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

// Program modes
export const PROGRAM_MODE = {
  Request: 0,
  DanaKaget: 1,
  GiftCard: 2
} as const

// Program status
export const PROGRAM_STATUS = {
  Active: 0,
  Paused: 1,
  Ended: 2
} as const
