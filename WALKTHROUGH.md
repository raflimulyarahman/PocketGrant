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

---

## 🏗️ Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ADMIN ||--o{ VERIFIER : manages
    ADMIN ||--o{ PROGRAM : "global pause"

    PROVIDER ||--o{ PROGRAM : creates
    PROGRAM ||--o{ REQUEST : contains
    PROGRAM ||--o{ CLAIM : tracks

    VERIFIER ||--o{ BENEFICIARY : verifies
    BENEFICIARY ||--o{ REQUEST : submits
    BENEFICIARY ||--o{ CLAIM : performs

    ADMIN {
        address wallet PK
        bool canPauseGlobal
        bool canManageVerifiers
    }

    VERIFIER {
        address wallet PK
        bool isActive
        address addedBy FK
    }

    PROVIDER {
        address wallet PK
    }

    PROGRAM {
        uint256 programId PK
        address provider FK
        uint256 totalFund
        uint256 remainingFund
        uint256 maxPerClaim
        enum mode "Request|DanaKaget|GiftCard"
        enum status "Active|Paused|Ended"
        uint256 capPerWallet
        uint64 startTime
        uint64 endTime
        bytes32 giftCodeHash
        bool requireVerification
    }

    REQUEST {
        uint256 requestId PK
        uint256 programId FK
        address requester FK
        uint256 amount
        bool approved
        bool paid
    }

    CLAIM {
        uint256 programId FK
        address claimant FK
        uint256 amount
        bool hasClaimed
    }

    BENEFICIARY {
        address wallet PK
        uint256 programId FK
        bool isVerified
    }
```

---

## 👥 Role-Based Flow Diagrams

### 1. 🔐 Admin Flow

Admin adalah super-user yang memiliki kontrol global atas sistem.

```mermaid
flowchart TD
    A[Admin Login] --> B{Pilih Aksi}

    B --> C[Manage Verifiers]
    C --> C1[setVerifier - Add Verifier]
    C --> C2[setVerifier - Remove Verifier]

    B --> D[Emergency Controls]
    D --> D1[setGlobalPause - Pause All]
    D --> D2[setGlobalPause - Resume All]

    B --> E[Transfer Admin]
    E --> E1[transferAdmin to New Address]

    C1 --> F[Emit VerifierUpdated Event]
    C2 --> F
    D1 --> G[Emit GlobalPauseUpdated Event]
    D2 --> G
    E1 --> H[Emit AdminTransferred Event]

    style A fill:#ff6b6b
    style B fill:#feca57
    style C fill:#48dbfb
    style D fill:#ff9ff3
    style E fill:#54a0ff
```

**Fungsi Admin:**
| Function | Description |
|----------|-------------|
| `transferAdmin(newAdmin)` | Transfer admin role ke address baru |
| `setVerifier(verifier, status)` | Tambah/hapus verifier |
| `setGlobalPause(paused)` | Pause/resume seluruh contract (emergency) |

---

### 2. 💼 Provider Flow

Provider adalah penyedia dana yang membuat dan mengelola program distribusi.

```mermaid
flowchart TD
    A[Provider Login] --> B[Approve IDRX Token]
    B --> C[Create Program]

    C --> D{Pilih Mode}
    D --> D1[Dana Kaget Mode]
    D --> D2[Request Mode]
    D --> D3[GiftCard Mode]

    D1 --> E[Set Config]
    D2 --> E
    D3 --> F[Generate Gift Code Hash]
    F --> E

    E --> G[Deposit IDRX ke Contract]
    G --> H[Program Created!]
    H --> I[Share Link/QR]

    subgraph "Program Management"
        J[Top Up Program]
        K[Pause Program]
        L[Resume Program]
        M[End Program]
        N[Withdraw Remaining]
    end

    H --> J
    H --> K
    K --> L
    H --> M
    M --> N

    subgraph "Request Mode Only"
        O[Review Requests]
        O --> P[Approve & Pay]
    end

    D2 --> O

    style A fill:#1dd1a1
    style C fill:#feca57
    style H fill:#54a0ff
    style N fill:#ff6b6b
```

**Fungsi Provider:**
| Function | Description |
|----------|-------------|
| `createProgram(config)` | Buat program baru + deposit dana |
| `topUpProgram(programId, amount)` | Tambah dana ke program |
| `pauseProgram(programId)` | Pause program sementara |
| `resumeProgram(programId)` | Resume program yang di-pause |
| `endProgram(programId)` | Akhiri program permanent |
| `withdrawRemaining(programId)` | Tarik sisa dana (setelah ended) |
| `approveAndPay(programId, requestId)` | Approve dan bayar request |

---

### 3. ✅ Verifier Flow

Verifier bertanggung jawab memverifikasi beneficiary sebelum mereka bisa claim/request.

```mermaid
flowchart TD
    A[Verifier Login] --> B{Verifikasi Beneficiary}

    B --> C[Single Verification]
    C --> C1["verifyBeneficiary(programId, beneficiary)"]

    B --> D[Batch Verification]
    D --> D1["verifyBeneficiaries(programId, beneficiaries[])"]

    C1 --> E[Emit BeneficiaryVerified Event]
    D1 --> E

    E --> F[Beneficiary Dapat Claim/Request]

    style A fill:#5f27cd
    style C fill:#48dbfb
    style D fill:#ff9ff3
    style F fill:#1dd1a1
```

**Fungsi Verifier:**
| Function | Description |
|----------|-------------|
| `verifyBeneficiary(programId, beneficiary)` | Verifikasi single beneficiary |
| `verifyBeneficiaries(programId, beneficiaries[])` | Batch verifikasi |

---

### 4. 🎓 Beneficiary (User) Flow

Beneficiary adalah penerima dana yang melakukan claim atau submit request.

```mermaid
flowchart TD
    A[User Buka Link/QR] --> B[Connect Wallet]
    B --> C{Check Program Mode}

    C --> D[Dana Kaget Mode]
    D --> D1{Sudah Claim?}
    D1 -->|Ya| D2[Tampilkan "Sudah Klaim"]
    D1 -->|Tidak| D3{Dana Tersedia?}
    D3 -->|Ya| D4["Tap AMBIL DANA"]
    D3 -->|Tidak| D5[Tampilkan "Dana Habis"]
    D4 --> D6[claimDanaKaget]
    D6 --> D7[🎉 Dana Masuk Wallet!]

    C --> E[Request Mode]
    E --> E1{Perlu Verifikasi?}
    E1 -->|Ya| E2{Sudah Verified?}
    E2 -->|Tidak| E3[Tunggu Verifikasi]
    E2 -->|Ya| E4[Submit Request]
    E1 -->|Tidak| E4
    E4 --> E5[Tunggu Approval Provider]
    E5 --> E6[Dana Masuk saat Approved!]

    C --> F[GiftCard Mode]
    F --> F1{Perlu Verifikasi?}
    F1 -->|Ya| F2{Sudah Verified?}
    F2 -->|Tidak| F3[Tunggu Verifikasi]
    F2 -->|Ya| F4[Masukkan Gift Code]
    F1 -->|Tidak| F4
    F4 --> F5{Code Valid?}
    F5 -->|Ya| F6[claimGift]
    F5 -->|Tidak| F7[Invalid Code Error]
    F6 --> F8[🎁 Dana Masuk Wallet!]

    style A fill:#00d2d3
    style D7 fill:#1dd1a1
    style E6 fill:#1dd1a1
    style F8 fill:#1dd1a1
    style D2 fill:#feca57
    style D5 fill:#ff6b6b
```

**Fungsi Beneficiary:**
| Function | Description |
|----------|-------------|
| `claimDanaKaget(programId)` | One-tap claim (tanpa verifikasi) |
| `submitRequest(programId, amount)` | Submit request dana |
| `claimGift(programId, code)` | Claim dengan secret code |

---

## 📱 Frontend Application Flow

### Home Dashboard

```mermaid
flowchart LR
    A[Landing Page] --> B{Wallet Connected?}
    B -->|No| C[Show "Connect Wallet" Card]
    B -->|Yes| D[Show IDRX Balance]

    A --> E[Buat Dana Kaget Card]
    E --> F["/create" Page]

    A --> G[Gift Card Card]
    A --> H[Request Dana Card]
    A --> I[Program Stats Card]
    A --> J[Demo Link Card]
    J --> K["/claim/1" Page]
```

### Create Program Page

```mermaid
flowchart TD
    A["/create" Page] --> B{Wallet Connected?}
    B -->|No| C[Show Connect Wallet]
    B -->|Yes| D{Correct Chain?}
    D -->|No| E[Show Switch Network Button]
    D -->|Yes| F[Show Balance & Form]

    F --> G[Input Total Dana]
    G --> H[Input Per Claim Amount]
    H --> I{Needs Approval?}

    I -->|Yes| J[Click Approve IDRX]
    J --> K[Wait TX Confirmation]
    K --> F

    I -->|No| L[Click "Buat Dana Kaget"]
    L --> M[Wait TX Confirmation]
    M --> N[Success! Show Share Link]
    N --> O[Copy Link / View Claim Page]
```

### Claim Page

```mermaid
flowchart TD
    A["/claim/:id" Page] --> B[Load Program Data]
    B --> C{Loading?}
    C -->|Yes| D[Show Loader]
    C -->|No| E{Wallet Connected?}

    E -->|No| F[Show Connect Wallet]
    E -->|Yes| G{Already Claimed?}

    G -->|Yes| H[Show "Sudah Klaim" Message]
    G -->|No| I{Fund Available?}

    I -->|No| J[Show "Dana Habis" Message]
    I -->|Yes| K{Correct Chain?}

    K -->|No| L[Show Switch Network Button]
    K -->|Yes| M[Show Claim Button]

    M --> N[Click "AMBIL DANA SEKARANG"]
    N --> O{Paymaster Available?}
    O -->|Yes| P[Gasless Transaction]
    O -->|No| Q[Normal Transaction]

    P --> R[Wait Confirmation]
    Q --> R
    R --> S[🎉 Confetti + Success Message]
    S --> T[Show BaseScan Link]
```

---

## 🔧 Smart Contract Architecture

### Contract Structure

```mermaid
classDiagram
    class PocketGrant {
        +IERC20 idrx
        +address admin
        +bool globalPaused
        +uint256 programCount

        +transferAdmin(newAdmin)
        +setVerifier(verifier, status)
        +setGlobalPause(paused)

        +createProgram(config) uint256
        +topUpProgram(programId, amount)
        +pauseProgram(programId)
        +resumeProgram(programId)
        +endProgram(programId)
        +withdrawRemaining(programId)

        +verifyBeneficiary(programId, beneficiary)
        +verifyBeneficiaries(programId, beneficiaries)

        +claimDanaKaget(programId)
        +submitRequest(programId, amount) uint256
        +approveAndPay(programId, requestId)
        +claimGift(programId, code)

        +getProgram(programId)
        +getRequest(programId, requestId)
        +canClaimDanaKaget(programId, wallet)
        +isVerified(programId, wallet)
    }

    class Program {
        +address provider
        +uint256 totalFund
        +uint256 remainingFund
        +uint256 maxPerClaim
        +ProgramMode mode
        +ProgramStatus status
        +uint256 capPerWallet
        +uint64 start
        +uint64 end
        +bool requireVerification
    }

    class Request {
        +address requester
        +uint256 amount
        +bool approved
        +bool paid
    }

    class ProgramMode {
        <<enumeration>>
        Request
        DanaKaget
        GiftCard
    }

    class ProgramStatus {
        <<enumeration>>
        Active
        Paused
        Ended
    }

    PocketGrant "1" *-- "*" Program : contains
    Program "1" *-- "*" Request : has
    Program --> ProgramMode : uses
    Program --> ProgramStatus : uses
```

---

## 🔒 Security Features

| Feature                   | Implementation                                        |
| ------------------------- | ----------------------------------------------------- |
| **Reentrancy Protection** | `nonReentrant` modifier pada semua token transfers    |
| **Safe Transfers**        | OpenZeppelin `SafeERC20`                              |
| **CEI Pattern**           | State updated sebelum external calls                  |
| **Custom Errors**         | Gas-efficient error handling                          |
| **Access Control**        | `onlyProvider`, `onlyAdmin`, `onlyVerifier` modifiers |
| **Time Locks**            | `start` dan `end` timestamps untuk program            |
| **Global Pause**          | Emergency stop untuk seluruh contract                 |

---

## 🌐 Tech Stack

### Smart Contract

- **Language**: Solidity ^0.8.20
- **Framework**: Foundry
- **Token**: IDRX (ERC20)
- **Chain**: Base Sepolia (testnet) / Base (mainnet)

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + Viem
- **Wallet**: Coinbase Smart Wallet (OnchainKit)
- **Animations**: Framer Motion
- **UI**: Radix UI primitives

---

## 📄 Contract Deployment Info

| Contract    | Address                                      | Chain        |
| ----------- | -------------------------------------------- | ------------ |
| PocketGrant | `0x486c001d1a07b15613ba57b9eeb5b1333a1383ef` | Base Sepolia |
| IDRX Token  | `0x7cca9d58715511d51c9d270a155df79c8f990586` | Base Sepolia |

---

## 🎬 Demo Flow (2 Minutes)

### Provider Demo

1. **Connect Wallet** - Hubungkan ke Base network dengan saldo IDRX
2. **Buka Create Page** - Klik "Buat Dana Kaget" dari dashboard
3. **Input Dana** - Total: 100,000 IDRX, Per Claim: 10,000 IDRX
4. **Approve & Create** - Approve token lalu buat program
5. **Share Link** - Copy link atau generate QR untuk dibagikan

### User Demo

1. **Buka Link** - Scan QR atau klik link dari provider
2. **Connect Wallet** - Hubungkan wallet (bisa Smart Wallet)
3. **Tap "AMBIL"** - One-tap claim dana
4. **Cek Balance** - IDRX bertambah instant di wallet
5. **View on BaseScan** - Lihat transaksi untuk transparansi

---

> 💡 **Tip**: Untuk pengalaman gasless, provider dapat mengonfigurasi Paymaster service di environment variable `NEXT_PUBLIC_PAYMASTER_URL`.
