# PocketGrant - Walkthrough Aplikasi 💰

> **Smart Contract Engine for Educational Fund Distribution**
>
> "Satu klik, dana rupiah sampai — cepat, transparan, dan audit-ready."

---

## 📖 Overview Aplikasi

PocketGrant adalah platform distribusi dana pendidikan berbasis blockchain yang dibangun di atas **Base Network** menggunakan token **IDRX**. Aplikasi ini dirancang untuk pengalaman **mobile-first** dengan 3 mode distribusi:

| Mode              | Deskripsi                              | Use Case                      |
| ----------------- | -------------------------------------- | ----------------------------- |
| 🎉 **Dana Kaget** | One-tap claim, first-come-first-served | Viral campaign, hadiah massal |
| 📝 **Request**    | Submit request, provider approves      | Beasiswa terverifikasi        |
| 🎁 **GiftCard**   | Claim dengan secret code               | Share via QR/link privat      |

### ⚡ Aturan Claim per Mode

| Mode              | Aturan                             | Penjelasan                                           |
| ----------------- | ---------------------------------- | ---------------------------------------------------- |
| 🎉 **Dana Kaget** | **1x per program per wallet**      | Sekali klaim langsung, tidak bisa klaim ulang        |
| 📝 **Request**    | **Unlimited submissions**          | Bisa ajukan berkali-kali, tunggu approval provider   |
| 🎁 **GiftCard**   | **Unlimited attempts, butuh kode** | Bisa coba berkali-kali, butuh kode valid untuk klaim |

> 💡 **Catatan:** User dapat berpartisipasi di **program yang berbeda** dengan mode yang berbeda. Aturan di atas berlaku **per program**.

---

## 🏗️ Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ADMIN ||--o{ VERIFIER : manages
    ADMIN ||--o{ PROGRAM : controls
    PROVIDER ||--o{ PROGRAM : creates
    PROGRAM ||--o{ REQUEST : contains
    PROGRAM ||--o{ CLAIM : tracks
    VERIFIER ||--o{ BENEFICIARY : verifies
    BENEFICIARY ||--o{ REQUEST : submits
    BENEFICIARY ||--o{ CLAIM : performs
```

### 📋 Entity Details

| Entity          | Key Fields                                                               |
| --------------- | ------------------------------------------------------------------------ |
| **ADMIN**       | wallet, canPauseGlobal, canManageVerifiers                               |
| **VERIFIER**    | wallet, isActive, addedBy                                                |
| **PROVIDER**    | wallet                                                                   |
| **PROGRAM**     | programId, provider, totalFund, remainingFund, maxPerClaim, mode, status |
| **REQUEST**     | requestId, programId, requester, amount, approved, paid                  |
| **CLAIM**       | programId, claimant, amount, hasClaimed                                  |
| **BENEFICIARY** | wallet, programId, isVerified                                            |

---

## 📅 Role-Based Flows

### 1. 🔐 Admin Flow

Admin adalah super-user yang memiliki kontrol global atas sistem.

```mermaid
flowchart TD
    A[Admin Login] --> B{Pilih Aksi}
    B --> C[Manage Verifiers]
    B --> D[Emergency Controls]
    B --> E[Transfer Admin]
    C --> C1[Add Verifier]
    C --> C2[Remove Verifier]
    D --> D1[Pause All]
    D --> D2[Resume All]
    E --> E1[Transfer to New Address]
```

**Fungsi Admin:**
| Function | Description |
|----------|-------------|
| `transferAdmin(newAdmin)` | Transfer admin role ke address baru |
| `setVerifier(verifier, status)` | Tambah/hapus verifier |
| `setGlobalPause(paused)` | Pause/resume seluruh contract |

---

### 2. 💼 Provider Flow

Provider adalah penyedia dana yang membuat dan mengelola program distribusi.

```mermaid
flowchart TD
    A[Provider Login] --> B[Approve IDRX]
    B --> C[Create Program]
    C --> D{Pilih Mode}
    D --> D1[Dana Kaget]
    D --> D2[Request Mode]
    D --> D3[GiftCard Mode]
    D1 --> E[Set Config]
    D2 --> E
    D3 --> E
    E --> F[Deposit IDRX]
    F --> G[Program Created]
    G --> H[Share Link]
```

**Program Management:**
| Function | Description |
|----------|-------------|
| `createProgram(config)` | Buat program baru + deposit dana |
| `topUpProgram(programId, amount)` | Tambah dana |
| `pauseProgram(programId)` | Pause sementara |
| `resumeProgram(programId)` | Resume program |
| `endProgram(programId)` | Akhiri permanent |
| `withdrawRemaining(programId)` | Tarik sisa dana |

---

### 3. ✅ Verifier Flow

Verifier bertanggung jawab memverifikasi beneficiary.

```mermaid
flowchart TD
    A[Verifier Login] --> B{Verifikasi}
    B --> C[Single Verify]
    B --> D[Batch Verify]
    C --> E[Beneficiary Verified]
    D --> E
    E --> F[Dapat Claim/Request]
```

**Fungsi Verifier:**
| Function | Description |
|----------|-------------|
| `verifyBeneficiary(programId, beneficiary)` | Single verification |
| `verifyBeneficiaries(programId, beneficiaries[])` | Batch verification |

---

### 4. 🎓 Beneficiary Flow

Beneficiary adalah penerima dana.

```mermaid
flowchart TD
    A[Buka Link] --> B[Connect Wallet]
    B --> C{Check Mode}
    C --> D[Dana Kaget]
    C --> E[Request Mode]
    C --> F[GiftCard Mode]
    D --> D1{Sudah Claim?}
    D1 -->|Ya| D2[Tampil Sudah Klaim]
    D1 -->|Tidak| D3[Tap AMBIL]
    D3 --> D4[Dana Masuk!]
    E --> E1[Submit Request]
    E1 --> E2[Tunggu Approval]
    E2 --> E3[Dana Approved!]
    F --> F1[Input Code]
    F1 --> F2{Valid?}
    F2 -->|Ya| F3[Dana Masuk!]
    F2 -->|Tidak| F4[Error]
```

**Fungsi Beneficiary:**
| Function | Description |
|----------|-------------|
| `claimDanaKaget(programId)` | One-tap claim |
| `submitRequest(programId, amount)` | Submit request |
| `claimGift(programId, code)` | Claim dengan code |

---

## 📱 Frontend Pages

### Home Page (`/`)

```mermaid
flowchart TD
    A[Buka PocketGrant] --> B{Connected?}
    B -->|No| C[Show Wallet Button]
    B -->|Yes| D[Show Balance]
    A --> E[Request Dana - CTA]
    A --> F[Dana Kaget]
    A --> G[Gift Card - Soon]
```

### Claim Flow (`/claim/:id`)

```mermaid
flowchart TD
    A[Load Program] --> B{Connected?}
    B -->|No| C[Connect Wallet]
    B -->|Yes| D{Already Claimed?}
    D -->|Yes| E[Show Message]
    D -->|No| F{Fund Available?}
    F -->|No| G[Dana Habis]
    F -->|Yes| H[Show Claim Button]
    H --> I[Tap AMBIL]
    I --> J[Success + Confetti!]
```

### Create Program (`/donate`)

```mermaid
flowchart TD
    A[Input Amount] --> B[Choose Mode]
    B --> C[Set Config]
    C --> D[Approve IDRX]
    D --> E[Create Program]
    E --> F[Success!]
    F --> G[Share Link]
```

---

## 🔧 Smart Contract

### Contract Structure

```mermaid
classDiagram
    class PocketGrant {
        +IERC20 idrx
        +address admin
        +bool globalPaused
        +createProgram()
        +claimDanaKaget()
        +submitRequest()
        +claimGift()
    }
    class Program {
        +address provider
        +uint256 totalFund
        +uint256 remainingFund
        +ProgramMode mode
        +ProgramStatus status
    }
    class Request {
        +address requester
        +uint256 amount
        +bool approved
    }
    PocketGrant "1" *-- "*" Program
    Program "1" *-- "*" Request
```

---

## 🔒 Security Features

| Feature                   | Implementation               |
| ------------------------- | ---------------------------- |
| **Reentrancy Protection** | `nonReentrant` modifier      |
| **Safe Transfers**        | OpenZeppelin `SafeERC20`     |
| **CEI Pattern**           | State update before calls    |
| **Access Control**        | `onlyProvider`, `onlyAdmin`  |
| **Time Locks**            | `start` dan `end` timestamps |
| **Global Pause**          | Emergency stop               |

---

## 🌐 Tech Stack

### Smart Contract

- **Language**: Solidity ^0.8.20
- **Framework**: Foundry
- **Token**: IDRX (ERC20)
- **Chain**: Base Sepolia / Base Mainnet

### Frontend

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + Viem
- **Wallet**: Coinbase Smart Wallet
- **Animations**: Framer Motion

---

## 📄 Deployed Contracts

| Contract    | Address                                      | Chain        |
| ----------- | -------------------------------------------- | ------------ |
| PocketGrant | `0x486c001d1a07b15613ba57b9eeb5b1333a1383ef` | Base Sepolia |
| IDRX Token  | `0x7cca9d58715511d51c9d270a155df79c8f990586` | Base Sepolia |

---

## 🎬 Demo Flow

### Provider Demo

1. Connect Wallet dengan saldo IDRX
2. Buka `/donate` → Input dana
3. Pilih mode → Set config
4. Approve IDRX → Create program
5. Share link ke penerima

### User Demo

1. Buka link dari provider
2. Connect Smart Wallet
3. Tap "AMBIL DANA"
4. IDRX masuk instant!

---

> 💡 **Tip**: Untuk gasless, set `NEXT_PUBLIC_PAYMASTER_URL` di environment.
