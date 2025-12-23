# PocketGrant (Dana Kaget Edu) 💰

> **Smart Contract Engine for Educational Fund Distribution**
>
> "Satu klik, dana rupiah sampai — cepat, transparan, dan audit-ready."

[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-blue)](https://soliditylang.org/)
[![Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange)](https://book.getfoundry.sh/)
[![Base](https://img.shields.io/badge/Chain-Base-0052FF)](https://base.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Overview

PocketGrant is a smart contract engine optimized for **Base mini-app mobile-first** experiences using **IDRX** token. It supports three distribution modes:

| Mode              | Description                            | UX                      |
| ----------------- | -------------------------------------- | ----------------------- |
| **Dana Kaget** 🎉 | One-tap claim, first-come-first-served | Primary mode            |
| **Request** 📝    | Submit request, provider approves      | For verified recipients |
| **GiftCard** 🎁   | Claim with secret code                 | Share via link/QR       |

## 🚀 Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Node.js 18+ (optional, for frontend integration)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd PocketGrants

# Install dependencies
forge install

# Build contracts
forge build
```

### Run Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvv

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test test_danaKagetClaimSuccess -vvv
```

### Expected Test Output

```
Running 22 tests for test/PocketGrant.t.sol:PocketGrantTest
[PASS] test_approveAndPay_RevertsNotProvider()
[PASS] test_approveAndPay_RevertsOnDoublePayment()
[PASS] test_canClaimDanaKaget_ReturnsCorrectly()
[PASS] test_capPerWallet_Enforced()
[PASS] test_claimAfterEnd_Reverts()
[PASS] test_claimBeforeStart_Reverts()
[PASS] test_constructor_RevertsOnZeroAddress()
[PASS] test_createProgram_RevertsOnInvalidTimeRange()
[PASS] test_createProgram_RevertsOnZeroAmount()
[PASS] test_createProgram_Success()
[PASS] test_danaKagetClaimSuccess()
[PASS] test_danaKagetDoubleClaimFails()
[PASS] test_danaKagetExhaustedStops()
[PASS] test_danaKaget_RevertsOnWrongMode()
[PASS] test_endProgram_Success()
[PASS] test_giftCodeClaim_RevertsOnDoubleClaim()
[PASS] test_giftCodeClaim_RevertsOnWrongCode()
[PASS] test_giftCodeClaim_Success()
[PASS] test_pauseBehavior()
[PASS] test_pauseProgram_RevertsNotProvider()
[PASS] test_reentrancyAttempt()
[PASS] test_requestApproveFlow()
[PASS] test_topUpProgram_RevertsNotProvider()
[PASS] test_topUpProgram_Success()
[PASS] test_withdrawRemaining_RevertsIfNotEnded()
[PASS] test_withdrawRemaining_Success()
```

## 📦 Deployment

### Environment Setup

Create `.env` file:

```bash
# Private key (without 0x prefix for some tools)
PRIVATE_KEY=your_private_key_here

# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org

# BaseScan API Key (for verification)
BASESCAN_API_KEY=your_basescan_api_key
```

### Deploy to Base Sepolia (Testnet)

```bash
# Load environment
source .env

# Deploy and verify
forge script script/deploy.s.sol:DeployPocketGrant \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

### Deploy to Local (Anvil)

```bash
# Terminal 1: Start local node
anvil

# Terminal 2: Deploy with mock IDRX
forge script script/deploy.s.sol:DeployWithMock \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

## 🔧 Contract API

### Core Functions

```solidity
// Provider: Create program & deposit IDRX
createProgram(ProgramConfig config) → uint256 programId

// Provider: Add more funds
topUpProgram(uint256 programId, uint256 amount)

// User: One-tap claim (Dana Kaget mode)
claimDanaKaget(uint256 programId)

// User: Submit funding request (Request mode)
submitRequest(uint256 programId, uint256 amount) → uint256 requestId

// Provider: Approve & pay request
approveAndPay(uint256 programId, uint256 requestId)

// User: Claim with code (GiftCard mode)
claimGift(uint256 programId, string code)

// Provider: Admin controls
pauseProgram(uint256 programId)
resumeProgram(uint256 programId)
endProgram(uint256 programId)
withdrawRemaining(uint256 programId)
```

### Events (for UI/Indexing)

```solidity
event ProgramCreated(uint256 indexed programId, address indexed provider, uint256 totalFund, ProgramMode mode);
event ProgramTopUp(uint256 indexed programId, uint256 amount);
event Claimed(uint256 indexed programId, address indexed claimant, uint256 amount);
event RequestSubmitted(uint256 indexed programId, uint256 indexed requestId, address indexed requester, uint256 amount);
event RequestApproved(uint256 indexed programId, uint256 indexed requestId, address indexed beneficiary, uint256 amount);
event ProgramPaused(uint256 indexed programId);
event ProgramResumed(uint256 indexed programId);
event ProgramEnded(uint256 indexed programId);
event FundsWithdrawn(uint256 indexed programId, uint256 amount);
```

## 🔒 Security Features

| Feature                   | Implementation                                 |
| ------------------------- | ---------------------------------------------- |
| **Reentrancy Protection** | `nonReentrant` modifier on all token transfers |
| **Safe Transfers**        | OpenZeppelin `SafeERC20`                       |
| **CEI Pattern**           | State updated before external calls            |
| **Custom Errors**         | Gas-efficient error handling                   |
| **Access Control**        | `onlyProvider` modifier                        |
| **Time Locks**            | `start` and `end` timestamps                   |

## 🎬 Demo Script (2 Minutes)

### Provider Flow

1. **Connect Wallet** - Connect to Base network with IDRX balance
2. **Approve IDRX** - `idrx.approve(pocketGrantAddress, amount)`
3. **Create Program**:
   ```javascript
   pocketGrant.createProgram({
     totalFund: 100000 * 1e6, // 100K IDRX
     maxPerClaim: 10000 * 1e6, // 10K per claim
     mode: 1, // DanaKaget
     capPerWallet: 0,
     start: 0,
     end: 0,
     giftCodeHash: bytes32(0),
   });
   ```
4. **Share Link** - Generate QR/link with programId

### User Flow

1. **Open Mini-App** - Scan QR or click link
2. **Tap "AMBIL"** - One-tap claim
3. **View Balance** - IDRX balance increases instantly
4. **View on BaseScan** - Transaction hash for transparency

### Closing Line

> "Satu klik, dana rupiah sampai — cepat, transparan, dan audit-ready."

## 📁 Project Structure

```
PocketGrants/
├── foundry.toml           # Foundry configuration
├── README.md              # This file
├── src/
│   └── PocketGrant.sol    # Main contract
├── test/
│   ├── PocketGrant.t.sol  # Test suite
│   └── mocks/
│       └── MockERC20.sol  # Mock token for testing
└── script/
    └── deploy.s.sol       # Deployment scripts
```

## 🔗 References

- [WeChat Red Packet (Hongbao)](https://en.wikipedia.org/wiki/WeChat_red_envelope) - UX Inspiration
- [Linkdrop SDK](https://github.com/LinkdropHQ/linkdrop-sdk) - Web3 Claiming Reference
- [Base Documentation](https://docs.base.org/) - Target Chain

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built for Base Hackathon** 🔵
