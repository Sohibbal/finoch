# VoiCash System Architecture & Technical Design Specification

* **Date:** 2026-10-01
* **Status:** Validated & Approved Design
* **Target Audience:** Indonesian University Students
* **Tagline:** *"Catat pengeluaran cukup dengan bicara"*

---

## 1. Executive Summary & Vision

**VoiCash** is a production-grade Progressive Web App (PWA) engineered to make daily expense tracking effortless for Indonesian university students through natural client-side voice recognition. 

### Core Value Proposition
Students frequently omit expense tracking due to the friction of manual form entry. VoiCash allows students to speak naturally in Indonesian (e.g., *"tadi beli nasi goreng lima belas ribu dan es teh lima ribu"*), converts speech to structured transactions client-side, classifies expenses into `primer` (basic necessities) vs `bocor_halus` (impulsive/lifestyle spending), and saves them via a local-first offline pipeline synced to a PostgreSQL cloud backend.

### Strict Privacy & Zero-Cost Principles
1. **Zero External Paid AI APIs:** No OpenAI, Gemini, Whisper, GCP, or Azure speech/NLP APIs. 100% of speech recognition is handled by the browser's native Web Speech API, and 100% of expense parsing is done via a client-side deterministic TypeScript NLP engine.
2. **Zero Audio Upload or Persistence:** Raw microphone audio is never captured into file blobs, never uploaded to the server, and never permanently retained.
3. **Explicit User Review:** Voice parsing results are never silently committed. Users must review, optionally edit, and explicitly confirm transactions before storage.
4. **Local-First & Multi-Device:** Fully functional offline via IndexedDB. When online, changes sync seamlessly to an authenticated cloud account powered by Next.js and Prisma with PostgreSQL.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Modern React 19 server/client components, route handlers, optimized bundling |
| **Language** | TypeScript (Strict Mode) | Type-safe domain models, compile-time safety across client and server |
| **Styling** | Tailwind CSS + Lucide Icons | Mobile-first utility design system tailored for fast touch interactions |
| **UI Components** | Radix UI primitives / shadcn style | Accessible dialogs, drawers, dropdowns, and button primitives |
| **Speech Recognition** | Browser Native Web Speech API (`id-ID`) | Zero-cost, zero-latency client-side speech-to-text without external dependencies |
| **Local Storage** | IndexedDB (`idb` wrapper) | Resilient, large-capacity local cache acting as client single source of truth |
| **Database & ORM** | PostgreSQL + Prisma ORM | ACID-compliant relational cloud persistence with strict multi-tenant isolation |
| **Authentication** | Stateless JWT in `httpOnly` secure cookies | Secure, lightweight credentials auth with bcrypt password hashing |
| **PWA** | Web App Manifest + Service Worker | Installable on iOS/Android home screens with full offline application shell |

---

## 3. High-Level System Architecture

```
                                  VoiCash Client Application
                                              │
                ┌─────────────────────────────┴─────────────────────────────┐
                ▼                                                           ▼
    [Client Voice & NLP Pipeline]                                 [Local-First Data Store]
                │                                                           │
        Web Speech API (`id-ID`)                                      IndexedDB (`idb`)
                │                                                           │
        Client Transcript                                             Local Expenses
                │                                                           │
    Deterministic Indonesian NLP                                        Sync Queue
    (Tokenize, Split, Numbers, Classify)                        (pending / syncing / synced)
                │                                                           │
       Parsed Expense Items                                                 │
                │                                                           │
       User Confirmation UI ──────────────── Save Confirmed ────────────────┤
                                                                            │
                                                                   POST /api/sync
                                                            (JWT httpOnly Auth Session)
                                                                            │
                                                                            ▼
                                                               Next.js Route Handlers
                                                                            │
                                                                    Prisma ORM Client
                                                                            │
                                                                            ▼
                                                                   PostgreSQL Database
```

---

## 4. Domain Models & Core Types

### 4.1 Expense & Classification Types
```ts
export type ExpenseCategory = "primer" | "bocor_halus";

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";

export interface Expense {
  id: string; // UUID v4 generated on client
  userId: string; // "guest" or authenticated user UUID
  itemName: string;
  amount: number;
  category: ExpenseCategory;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  syncStatus?: SyncStatus;
  isDeleted?: boolean; // Soft delete for remote sync reconciliation
}

export interface ParsedVoiceItem {
  id: string;
  rawText: string;
  itemName: string;
  amount: number;
  category: ExpenseCategory;
  confidence: number; // 0.0 - 1.0 deterministic score
}
```

### 4.2 Sync Queue Model
```ts
export type SyncAction = "create" | "update" | "delete";

export interface SyncQueueItem {
  id: string; // UUID v4
  expenseId: string;
  action: SyncAction;
  payload: Expense;
  timestamp: number;
  retryCount: number;
  errorMessage?: string;
}
```

### 4.3 User & Authentication Model
```ts
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

---

## 5. Client-Side Speech Recognition (`useSpeechRecognition`)

### 5.1 Browser Web Speech API Integration
* Targets `window.SpeechRecognition || window.webkitSpeechRecognition`.
* Language configuration: `lang = "id-ID"`.
* Configuration flags: `continuous = true`, `interimResults = true`.

### 5.2 Speech Silence Detection & Auto-Stop
* A 2000ms inactivity countdown is activated upon microphone listening.
* Every incoming interim or final transcript event resets this timer.
* When silence exceeds 2000ms after speech has started, `stopListening()` is automatically triggered, transitioning the UI directly to the **PROCESSING** / **REVIEW** state.

### 5.3 Error Handling & Cleanup
* Recognizes specific Web Speech error codes:
  * `not-allowed`: User denied microphone access.
  * `no-speech`: Microphone did not pick up audible sound.
  * `network`: Network-level connection issue in browser speech backend.
  * `audio-capture`: Hardware microphone unavailable.
* Teardown logic cleanly unbinds event listeners during component unmount to prevent memory leaks and React Strict Mode re-mount anomalies.
* Detects browser support on mount (`isSupported: boolean`). If unsupported, prompts user with a graceful fallback to direct text input.

---

## 6. Deterministic Indonesian NLP Engine (`lib/nlp/`)

The NLP engine is pure TypeScript with zero DOM, React, or network dependencies.

```
Raw Transcript
    ↓
1. normalizeText()          [Normalizes slang, removes noise, cleans whitespace]
    ↓
2. splitTransactions()      [Splits compound sentences on conjunctions like "dan", "sama"]
    ↓
3. parseAmount()            [Parses Indonesian spoken numbers, tokens, and currencies]
    ↓
4. extractItem()            [Strips filler verbs, cleans item name]
    ↓
5. classifyCategory()       [Matches rules for "primer" vs "bocor_halus"]
    ↓
6. calculateConfidence()    [Computes deterministic score based on item & amount match]
    ↓
ParsedVoiceItem[]
```

### 6.1 Text Normalization (`normalizeText.ts`)
* Converts to lowercase and normalizes accented or colloquial tokens.
* Normalizes monetary shortcuts:
  * `rb`, `k` → `ribu`
  * `jt` → `juta`
  * `ceban` → `10000`
  * `gocap` → `50000`
  * `seceng` → `1000`
  * `gopek` → `500`
  * `setengah juta` → `500000`
  * `dua setengah juta` → `2500000`
* Strips currency noise: `rupiah`, `rp`, `perak`.

### 6.2 Transaction Splitting (`transaction-splitter.ts`)
* Identifies conjunction delimiters: `dan`, `sama`, `lalu`, `terus`, `kemudian`, `serta`, or comma `,`.
* **Smart Guard against False Splits:** Does not split phrases where `dan` is part of an item without a preceding monetary amount (e.g., *"nasi dan ayam geprek 20 ribu"* remains one item). Only splits when an amount or currency token is detected before the conjunction, or when multiple amounts are detected.

### 6.3 Indonesian Number & Currency Normalizer (`number-normalizer.ts`)
* Maps word numerals to values:
  * Base: `satu (1)`, `dua (2)`, `tiga (3)`, `empat (4)`, `lima (5)`, `enam (6)`, `tujuh (7)`, `delapan (8)`, `sembilan (9)`, `sepuluh (10)`, `sebelas (11)`, `nol (0)`.
  * Multipliers: `belas (+10)`, `puluh (*10)`, `ratus (*100)`, `seratus (100)`, `ribu (*1000)`, `seribu (1000)`, `juta (*1000000)`, `sejuta (1000000)`.
* Resolves hybrid numeric and word combinations:
  * `"15 ribu"` → `15000`
  * `"25 rb"` → `25000`
  * `"50k"` → `50000`
  * `"2,5 juta"` / `"2.5 juta"` → `2500000`
  * `"dua puluh lima ribu lima ratus"` → `25500`

### 6.4 Item Extraction (`item-extractor.ts`)
* Removes conversational filler preambles:
  * `tadi beli`, `beli`, `bayar`, `bayarin`, `keluar uang`, `pengeluaran`, `buat`, `untuk`, `seharga`, `sebesar`, `habis`.
* Preserves descriptive qualifiers (e.g. `"ayam geprek sambal matah"`, `"kopi susu gula aren"`).
* Capitalizes words for presentation in the confirmation card.

### 6.5 Categorization Classifier (`expense-category-classifier.ts`)
Deterministic student budget rule classifier:

* **`primer` (Kebutuhan Pokok):**
  * *Food / Daily meals:* makan, nasi, beras, warteg, lauk, sayur, ayam, telur, tempe, tahu, mie, roti, sarapan, makan siang, makan malam, galon.
  * *Transport:* bensin, pertalite, pertamax, spbu, ojol, gojek, grab, maxim, angkot, bus, transjakarta, krl, kereta, parkir.
  * *Education / Campus:* kuliah, fotokopi, print, jilid, buku, pulpen, alat tulis, modul, praktikum, ukt, spp.
  * *Living & Health:* kos, kontrakan, listrik, token, pdam, laundry, sabun, odol, obat, apotek, dokter, vitamin.
  * *Connectivity:* pulsa, kuota, paket data, internet, wifi, indihome.

* **`bocor_halus` (Latte Factor / Impulsive / Lifestyle):**
  * *Hangout / Drinks / Cafe:* kopi, coffee, cafe, cafein, starbucks, janji jiwa, point coffee, kenangan, boba, chatime, mixue, es teh, jus, nongkrong, nongki.
  * *Snacks / Impulse:* snack, ciki, cemilan, keripik, es krim, biskuit, martabak, donat, cilok, seblak, gorengan.
  * *Entertainment & Hobbies:* game, top up, diamond, mobile legends, ml, steam, valorant, netflix, spotify, bioskop, nonton, bioskop xxi.
  * *Vices & Shopping:* rokok, marlboro, surya, vape, pods, liquid, checkout, shopee, tiktok shop, olshop, belanja baju.

* **Default & Confidence:** Defaults to `primer` for general food/unmatched essential items, with confidence `0.9` for exact keyword matches, `0.75` for partial matches, and allows immediate single-tap toggle during review.

---

## 7. Local-First Storage & Synchronization Architecture

### 7.1 IndexedDB Store Schema (`lib/storage/indexed-db.ts`)
* Database: `voicash_db`, Version: `1`.
* Object Stores:
  1. `expenses`: KeyPath: `id`. Index: `userId`, `createdAt`, `updatedAt`, `syncStatus`.
  2. `sync_queue`: KeyPath: `id`. Index: `timestamp`, `action`.
  3. `settings`: KeyPath: `key`.

### 7.2 Storage Service (`lib/storage/expense-storage.ts`)
Encapsulates all IndexedDB reads and writes:
* `saveExpense(expense)`: Inserts into local store and enqueues sync mutation.
* `getExpenses(userId)`: Returns all active (non-deleted) expenses sorted by `createdAt DESC`.
* `updateExpense(id, updates)`: Modifies local record, increments `updatedAt`, marks `syncStatus: "pending"`, and enqueues update.
* `deleteExpense(id)`: Soft-deletes locally (`isDeleted: true`), marks `syncStatus: "pending"`, and enqueues delete mutation.
* `claimGuestExpenses(newUserId)`: Migrates all records currently assigned to `"guest"` to the authenticated user ID and triggers immediate cloud synchronization.

### 7.3 Sync Queue & Protocol (`lib/sync/sync-manager.ts`)
* **State Machine:** `pending` → `syncing` → `synced` (or `failed` with exponential backoff retry).
* **Automatic Triggers:**
  * When device transitions from offline to online (`window.addEventListener("online")`).
  * Immediately upon saving or editing an expense if online.
  * On user authentication / login.
  * On app visibility / foregrounding (`visibilitychange`).
* **Batch Endpoint (`POST /api/sync`):**
  * Payload:
    ```json
    {
      "clientChanges": [
        {
          "id": "uuid-1",
          "action": "create",
          "payload": {
            "id": "uuid-1",
            "itemName": "Nasi Padang",
            "amount": 18000,
            "category": "primer",
            "createdAt": "2026-10-01T12:00:00.000Z",
            "updatedAt": "2026-10-01T12:00:00.000Z"
          }
        }
      ],
      "lastSyncTimestamp": "2026-10-01T00:00:00.000Z"
    }
    ```
  * Backend reconciles incoming batch within a PostgreSQL transaction.
  * Resolves conflicts via **Last-Write-Wins** using `updatedAt`.
  * Returns `{ appliedIds: string[], serverChanges: Expense[], serverTimestamp: string }`.
  * Client commits server changes to IndexedDB and purges applied items from `sync_queue`.

---

## 8. Backend & Cloud Persistence

### 8.1 Prisma Database Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String    // bcrypt hashed
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  expenses  Expense[]

  @@map("users")
}

model Expense {
  id        String   @id // Client-generated UUID
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemName  String
  amount    Int
  category  String   // "primer" | "bocor_halus"
  isDeleted Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, updatedAt])
  @@map("expenses")
}
```

### 8.2 Authentication & Security Architecture
* Password hashing using `bcryptjs` (salt rounds: 10).
* Stateless JWT signed with `JWT_SECRET`, containing `{ userId: string, email: string }`.
* Token persisted exclusively in `httpOnly`, `secure`, `sameSite=lax` cookie named `voicash_session`.
* **Zero Authorization Bypass:** All backend route handlers (`/api/sync`, `/api/expenses/*`) parse the JWT cookie. Any query or mutation strictly includes `where: { userId: session.userId }`, ensuring no cross-user data leakage.

---

## 9. Progressive Web App (PWA) & Offline Shell

### 9.1 Web App Manifest (`public/manifest.json` / `app/manifest.ts`)
* `name`: "VoiCash - Catat Pengeluaran Suara"
* `short_name`: "VoiCash"
* `description`: "Catat pengeluaran mahasiswa cukup dengan bicara."
* `start_url`: "/"
* `display`: "standalone"
* `background_color`: "#090d16"
* `theme_color`: "#0f172a"
* Icons: 192x192, 512x512, maskable icons in `public/icons/`.

### 9.2 Service Worker (`public/sw.js`)
* Implements Cache-First strategy for static assets (scripts, stylesheets, fonts, app icons, audio icons).
* Implements Network-First with Cache Fallback for navigation routes.
* Provides offline application shell fallback when disconnected.

---

## 10. User Experience & Component Specification

### 10.1 Voice Sheet Interaction Flow
1. **Trigger:** Bottom center microphone floating button with pulse animation.
2. **Recording State Sheet:**
   * Shows waveform animation and *"Mendengarkan..."*.
   * Live interim transcript renders in real-time.
   * Auto-stops on 2 seconds of silence.
3. **Review State:**
   * Lists detected cards:
     * Editable item name.
     * Currency-formatted amount with quick adjustment.
     * Category badge toggle (`Primer` vs `Bocor Halus`).
     * `[Hapus]` button per item.
   * Footer buttons: `[+ Tambah Item]`, `[Batal]`, `[Konfirmasi & Simpan]`.
4. **Saved Confirmation:** Clean micro-interaction checkmark with haptic feedback (where supported) before closing sheet.
5. **Fallback:** If speech recognition is unsupported or microphone is blocked, a direct manual input appears: *"Ketik pengeluaran (misal: 'ayam geprek 15rb')"* running the same parser.

### 10.2 Student Dashboard UI
* **Header:** VoiCash branding + user profile badge + online/offline sync status pill.
* **Top Metric Cards:**
  * Pengeluaran Bulan Ini (Rp)
  * Pengeluaran Hari Ini & Minggu Ini
* **Primer vs Bocor Halus Ratio Card:** Visual bar showing percentage of essential needs vs impulsive/lifestyle leaks.
* **Transaction Feed:** Grouped by date, showing item name, amount, category tag (`Primer`: emerald/blue, `Bocor Halus`: amber/rose), and sync status indicator.

### 10.3 Privacy Notice Modal
Student-friendly disclosure:
> *"VoiCash tidak menyimpan rekaman suara Anda. Pemrosesan suara dilakukan langsung di perangkat Anda melalui Web Speech API browser, dan data transaksi hanya disinkronkan ke akun Anda saat Anda telah mengonfirmasinya."*

---

## 11. Testing & Verification Plan

1. **Unit Testing NLP Pipeline:**
   * Indonesian numeral parsing (e.g. `lima belas ribu` → `15000`, `setengah juta` → `500000`).
   * Complex compound sentences (e.g. `beli nasi padang 20 ribu sama es teh 5 ribu`).
   * Item extraction and filler word removal.
   * Category classification (`primer` vs `bocor_halus`).
2. **Storage & Queue Testing:**
   * IndexedDB persistence and CRUD.
   * Sync queue FIFO ordering and retry mechanics.
   * Guest-to-authenticated data migration.
3. **API & Security Testing:**
   * JWT validation and unauthorized access rejection.
   * Multi-tenant isolation verification (`User A cannot read or write User B's expenses`).
   * Batch sync conflict resolution (`last-write-wins`).
4. **PWA & Production Build Verification:**
   * Web App Manifest validation.
   * Service worker registration and offline shell test.
   * Full TypeScript type check (`tsc --noEmit`).
   * Production build (`next build`).
