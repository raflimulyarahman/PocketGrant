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
    classDef adminLogin stroke:#333,stroke-width:2px,fill:#e1f5fe,color:#000
    classDef decision stroke:#333,stroke-width:1px,fill:#fff9c4,color:#000
    classDef manage stroke:#333,stroke-width:1px,fill:#bbdefb,color:#000
    classDef emergency stroke:#333,stroke-width:1px,fill:#f3e5f5,color:#000
    classDef transfer stroke:#333,stroke-width:1px,fill:#e3f2fd,color:#000
    classDef event stroke:#333,stroke-width:1px,fill:#f5f5f5,color:#000

    A[Admin Login]:::adminLogin --> B{Pilih Aksi}:::decision

    B --> C[Manage Verifiers]:::manage
    C --> C1[setVerifier - Add Verifier]:::manage
    C --> C2[setVerifier - Remove Verifier]:::manage

    B --> D[Emergency Controls]:::emergency
    D --> D1[setGlobalPause - Pause All]:::danger
    D --> D2[setGlobalPause - Resume All]:::success

    B --> E[Transfer Admin]:::transfer
    E --> E1[transferAdmin to New Address]:::transfer

    C1 --> F[Emit VerifierUpdated Event]:::event
    C2 --> F
    D1 --> G[Emit GlobalPauseUpdated Event]:::event
    D2 --> G
    E1 --> H[Emit AdminTransferred Event]:::event

    classDef success stroke:#333,stroke-width:1px,fill:#c8e6c9,color:#000
    classDef danger stroke:#333,stroke-width:1px,fill:#ffcdd2,color:#000
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
    classDef startNode stroke:#333,stroke-width:2px,fill:#e1f5fe,color:#000
    classDef decision stroke:#333,stroke-width:1px,fill:#fff9c4,color:#000
    classDef action stroke:#333,stroke-width:1px,fill:#bbdefb,color:#000
    classDef subNode stroke:#333,stroke-width:1px,fill:#f5f5f5,color:#000
    classDef success stroke:#333,stroke-width:1px,fill:#c8e6c9,color:#000
    classDef danger stroke:#333,stroke-width:1px,fill:#ffcdd2,color:#000

    A[Provider Login]:::startNode --> B[Approve IDRX Token]:::action
    B --> C[Create Program]:::action

    C --> D{Pilih Mode}:::decision
    D --> D1[Dana Kaget Mode]:::action
    D --> D2[Request Mode]:::action
    D --> D3[GiftCard Mode]:::action

    D1 --> E[Set Config]:::subNode
    D2 --> E
    D3 --> F[Generate Gift Code Hash]:::subNode
    F --> E

    E --> G[Deposit IDRX ke Contract]:::action
    G --> H[Program Created!]:::success
    H --> I[Share Link/QR]:::action

    subgraph "Program Management"
        J[Top Up Program]:::action
        K[Pause Program]:::danger
        L[Resume Program]:::success
        M[End Program]:::danger
        N[Withdraw Remaining]:::danger
    end

    H --> J
    H --> K
    K --> L
    H --> M
    M --> N

    subgraph "Request Mode Only"
        O[Review Requests]:::action
        O --> P[Approve & Pay]:::success
    end

    D2 --> O
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
    classDef startNode stroke:#333,stroke-width:2px,fill:#e1f5fe,color:#000
    classDef decision stroke:#333,stroke-width:1px,fill:#fff9c4,color:#000
    classDef action stroke:#333,stroke-width:1px,fill:#bbdefb,color:#000
    classDef success stroke:#333,stroke-width:1px,fill:#c8e6c9,color:#000
    classDef subNode stroke:#333,stroke-width:1px,fill:#f5f5f5,color:#000

    A[Verifier Login]:::startNode --> B{Verifikasi Beneficiary}:::decision

    B --> C[Single Verification]:::action
    C --> C1["verifyBeneficiary(programId, beneficiary)"]:::action

    B --> D[Batch Verification]:::action
    D --> D1["verifyBeneficiaries(programId, beneficiaries[])"]:::action

    C1 --> E[Emit BeneficiaryVerified Event]:::subNode
    D1 --> E

    E --> F[Beneficiary Dapat Claim/Request]:::success
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
    classDef startNode stroke:#333,stroke-width:2px,fill:#e1f5fe,color:#000
    classDef decision stroke:#333,stroke-width:1px,fill:#fff9c4,color:#000
    classDef action stroke:#333,stroke-width:1px,fill:#bbdefb,color:#000
    classDef success stroke:#333,stroke-width:1px,fill:#c8e6c9,color:#000
    classDef danger stroke:#333,stroke-width:1px,fill:#ffcdd2,color:#000
    classDef info stroke:#333,stroke-width:1px,fill:#e0f7fa,color:#000

    A[User Buka Link/QR]:::startNode --> B[Connect Wallet]:::action
    B --> C{Check Program Mode}:::decision

    C --> D[Dana Kaget Mode]:::info
    D --> D1{Sudah Claim?}:::decision
    D1 -->|Ya| D2[Tampilkan Sudah Klaim]:::decision
    D1 -->|Tidak| D3{Dana Tersedia?}:::decision
    D3 -->|Ya| D4["Tap AMBIL DANA"]:::action
    D3 -->|Tidak| D5[Tampilkan Dana Habis]:::danger
    D4 --> D6[claimDanaKaget]:::action
    D6 --> D7[🎉 Dana Masuk Wallet!]:::success

    C --> E[Request Mode]:::info
    E --> E1{Perlu Verifikasi?}:::decision
    E1 -->|Ya| E2{Sudah Verified?}:::decision
    E2 -->|Tidak| E3[Tunggu Verifikasi]:::decision
    E2 -->|Ya| E4[Submit Request]:::action
    E1 -->|Tidak| E4
    E4 --> E5[Tunggu Approval Provider]:::action
    E5 --> E6[Dana Masuk saat Approved!]:::success

    C --> F[GiftCard Mode]:::info
    F --> F1{Perlu Verifikasi?}:::decision
    F1 -->|Ya| F2{Sudah Verified?}:::decision
    F2 -->|Tidak| F3[Tunggu Verifikasi]:::decision
    F2 -->|Ya| F4[Masukkan Gift Code]:::action
    F1 -->|Tidak| F4
    F4 --> F5{Code Valid?}:::decision
    F5 -->|Ya| F6[claimGift]:::action
    F5 -->|Tidak| F7[Invalid Code Error]:::danger
    F6 --> F8[🎁 Dana Masuk Wallet!]:::success
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

[Dashboard Flow](file:///home/sofi-mulyarahman/PocketGrants/frontend/app/page.tsx)

```mermaid
flowchart LR
    A["Landing Page"] --> B{Wallet Connected?}
    B -->|No| C["Show Connect Wallet Card"]
    B -->|Yes| D["Show IDRX Balance"]

    A --> E["Buat Dana Kaget Card"]
    E --> F["/create Page"]

    A --> G["Gift Card Card"]
    A --> H["Request Dana Card"]
    A --> I["Program Stats Card"]
    A --> J["Demo Link Card"]
    J --> K["/claim/1 Page"]
```

### Create Program Page

[Create Page](file:///home/sofi-mulyarahman/PocketGrants/frontend/app/create/page.tsx)

```mermaid
flowchart TD
    A["/create Page"] --> B{Wallet Connected?}
    B -->|No| C["Show Connect Wallet"]
    B -->|Yes| D{Correct Chain?}
    D -->|No| E["Show Switch Network Button"]
    D -->|Yes| F["Show Balance & Form"]

    F --> G["Input Total Dana"]
    G --> H["Input Per Claim Amount"]
    H --> I{Needs Approval?}

    I -->|Yes| J["Click Approve IDRX"]
    J --> K["Wait TX Confirmation"]
    K --> F

    I -->|No| L["Click Buat Dana Kaget"]
    L --> M["Wait TX Confirmation"]
    M --> N["Success! Show Share Link"]
    N --> O["Copy Link / View Claim Page"]
```

### Claim Page

[Claim Page](file:///home/sofi-mulyarahman/PocketGrants/frontend/app/claim/[id]/page.tsx)

```mermaid
flowchart TD
    A["/claim/:id Page"] --> B["Load Program Data"]
    B --> C{Loading?}
    C -->|Yes| D["Show Loader"]
    C -->|No| E{Wallet Connected?}

    E -->|No| F["Show Connect Wallet"]
    E -->|Yes| G{Already Claimed?}

    G -->|Yes| H["Show Sudah Klaim Message"]
    G -->|No| I{Fund Available?}

    I -->|No| J["Show Dana Habis Message"]
    I -->|Yes| K{Correct Chain?}

    K -->|No| L["Show Switch Network Button"]
    K -->|Yes| M["Show Claim Button"]

    M --> N["Click AMBIL DANA SEKARANG"]
    N --> O{Paymaster Available?}
    O -->|Yes| P["Gasless Transaction"]
    O -->|No| Q["Normal Transaction"]

    P --> R["Wait Confirmation"]
    Q --> R
    R --> S["🎉 Confetti + Success Message"]
    S --> T["Show BaseScan Link"]
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
