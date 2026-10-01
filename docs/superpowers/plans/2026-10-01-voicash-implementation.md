# VoiCash Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship VoiCash, a production-ready, privacy-first, local-first Progressive Web App (PWA) for Indonesian university students that converts natural spoken Indonesian into structured expenses without third-party AI APIs.

**Architecture:** Client-side Web Speech API (`id-ID`) feeds a pure TypeScript deterministic NLP engine to parse multi-item Indonesian expenses and classify them (`primer` vs `bocor_halus`). Structured records are confirmed by the student, saved locally in IndexedDB, and synchronized via an explicit FIFO Sync Queue to Next.js App Router route handlers with Prisma and PostgreSQL using stateless JWT auth in `httpOnly` cookies.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Native Web Speech API, IndexedDB (`idb`), Prisma ORM, PostgreSQL, bcryptjs, jose (JWT), Vitest.

**Spec:** [docs/superpowers/specs/2026-10-01-voicash-design.md](file:///D:/Project/VoiCash/docs/superpowers/specs/2026-10-01-voicash-design.md)

---

## Global Constraints

- Never use third-party paid AI or speech APIs (no OpenAI, Gemini, Whisper, GCP, Azure, or external NLP APIs).
- Never store or upload raw microphone audio recordings or audio blobs.
- Speech recognition language must be `lang = "id-ID"`.
- Speech recognition auto-stop after 2000ms of inactivity/silence.
- Expense parser must be pure TypeScript (zero React, DOM, or backend dependencies).
- Strictly require user review and confirmation before saving detected voice expenses.
- Primary budget categories are strictly `primer` and `bocor_halus`.
- IndexedDB is the local-first source of truth; app must function completely offline.
- Backend synchronization must enforce server-side user isolation (User A cannot see/mutate User B's data).
- Conflict resolution is Last-Write-Wins based on `updatedAt`.
- Production builds must pass strict TypeScript checks (`tsc --noEmit`), lint, and unit test suites.

---

## Review Focus

1. **Compound Conjunction Guard:** "beli nasi dan ayam bakar 25 ribu" must NOT split into two items because "dan" connects food words without a preceding price; it must produce 1 item ("Nasi dan ayam bakar", 25000).
2. **Indonesian Colloquial Currency Slang:** Words like "15rb", "15k", "ceban" (10.000), "gocap" (50.000), "setengah juta" (500.000), and "2.5jt" (2.500.000) must normalize accurately to integer rupiah.
3. **Speech Inactivity Auto-Stop:** Speech recognition must cleanly stop and trigger parsing after 2 seconds of silence, while resetting the timer on every interim speech chunk.
4. **Guest-to-User Local Record Migration:** A student recording expenses as a guest must not lose them upon registration/login; records must be migrated to their new authenticated `userId` and queued for sync.
5. **Offline Sync Queue Idempotence:** Offline mutations queued in `sync_queue` must synchronize upon reconnecting without duplicating records on the server.

---

## File Structure & Responsibilities

```
src/
├── app/
│   ├── layout.tsx                     # Root HTML shell, PWA metadata, fonts, SW registration
│   ├── page.tsx                       # Main student dashboard & voice recording bottom sheet
│   ├── login/page.tsx                 # Student login page
│   ├── register/page.tsx              # Student registration page
│   ├── manifest.ts                    # Dynamic Web App Manifest
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts      # User registration endpoint
│       │   ├── login/route.ts         # User login endpoint
│       │   ├── me/route.ts            # Current session profile endpoint
│       │   └── logout/route.ts        # Session clearance endpoint
│       ├── sync/route.ts              # Batch transactional sync endpoint (upsert/delete)
│       └── expenses/route.ts          # REST expenses fallback endpoint
│
├── components/
│   ├── expense/
│   │   ├── voice-expense-sheet.tsx    # Bottom sheet controller for voice recording states
│   │   ├── voice-recorder.tsx         # Large pulsing microphone button & state feedback
│   │   ├── transcript-preview.tsx     # Real-time interim & final Indonesian speech display
│   │   ├── parsed-expense-list.tsx    # Detected expense cards with category toggles
│   │   ├── expense-editor.tsx         # Modal dialog to edit item name, amount, category
│   │   ├── manual-expense-input.tsx   # Direct text fallback running same NLP parser
│   │   └── expense-list-item.tsx      # Dashboard feed card with sync status badge
│   ├── dashboard/
│   │   ├── metric-cards.tsx           # Monthly, weekly, and daily total cards
│   │   ├── category-breakdown.tsx     # Primer vs Bocor Halus spending ratio bar
│   │   └── sync-indicator.tsx         # Offline / Pending / Synced indicator badge
│   ├── layout/
│   │   ├── bottom-nav.tsx             # Mobile bottom bar with floating Voice Mic trigger
│   │   └── privacy-dialog.tsx         # Privacy-first modal explanation
│   └── ui/                            # Clean button, input, dialog, card primitives
│
├── hooks/
│   ├── use-speech-recognition.ts      # Web Speech API wrapper with silence auto-stop
│   ├── use-expenses.ts                # React hook binding IndexedDB and sync manager
│   └── use-auth.ts                    # Authentication context & guest state hook
│
├── lib/
│   ├── types/
│   │   ├── expense.ts                 # Domain models for Expense, ParsedVoiceItem, Category
│   │   ├── sync.ts                    # SyncStatus, SyncQueueItem, BatchSyncPayload
│   │   └── auth.ts                    # UserProfile, Session, AuthState
│   ├── nlp/
│   │   ├── indonesian-expense-parser.ts # Main NLP facade coordinating submodules
│   │   ├── normalize-text.ts          # Text cleaning and slang substitution
│   │   ├── number-normalizer.ts       # Spoken Indonesian number & currency parser
│   │   ├── transaction-splitter.ts    # Conjunction-aware multi-transaction splitter
│   │   ├── item-extractor.ts          # Filler words stripping & item name formatting
│   │   └── confidence.ts              # Deterministic confidence score calculation
│   ├── categorization/
│   │   └── expense-category-classifier.ts # Rule-based Primer vs Bocor Halus classifier
│   ├── storage/
│   │   ├── indexed-db.ts              # IDB database initialization and schema setup
│   │   ├── expense-storage.ts         # High-level local storage CRUD abstraction
│   │   └── sync-queue.ts              # FIFO queue manager for pending mutations
│   ├── sync/
│   │   └── sync-manager.ts            # Online/offline sync scheduler and API reconciler
│   ├── auth/
│   │   └── jwt.ts                     # Stateless JWT creation, verification, and cookie helpers
│   └── prisma.ts                      # Prisma client singleton instance
│
├── prisma/
│   └── schema.prisma                  # Prisma schema: User and Expense models
│
├── public/
│   ├── sw.js                          # Service worker for offline shell caching
│   ├── icons/                         # 192x192, 512x512 PWA icons
│   └── favicon.ico
```

---

## Tasks

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.env.example`, `.gitignore`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Consumes: Node.js 24 environment, npm 11
- Produces: Runnable Next.js 15 project with TypeScript, Tailwind, and Vitest test runner

- [ ] **Step 1: Write setup test**

```ts
// tests/setup.test.ts
import { describe, it, expect } from "vitest";

describe("Environment & Setup", () => {
  it("verifies test suite is functional", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Create package.json and install dependencies**

Run:
```bash
npm init -y
npm install next@latest react@latest react-dom@latest lucide-react clsx tailwind-merge idb bcryptjs jose @prisma/client
npm install -D typescript @types/node @types/react @types/react-dom @types/bcryptjs tailwindcss postcss autoprefixer prisma vitest @vitejs/plugin-react
```

- [ ] **Step 3: Configure TypeScript, Tailwind, Next.js, and Vitest**

Create `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, and `.gitignore`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/setup.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs vitest.config.ts tests/setup.test.ts .gitignore .env.example
git commit -m "chore: scaffold Next.js 15 project with TypeScript, Tailwind, and Vitest"
```

---

### Task 2: Core Domain Types

**Files:**
- Create: `src/lib/types/expense.ts`
- Create: `src/lib/types/sync.ts`
- Create: `src/lib/types/auth.ts`
- Test: `tests/types/domain-types.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `Expense`, `ExpenseCategory`, `ParsedVoiceItem`, `SyncStatus`, `SyncQueueItem`, `UserProfile`, `BatchSyncRequest`, `BatchSyncResponse`

- [ ] **Step 1: Write the domain type assertions test**

```ts
// tests/types/domain-types.test.ts
import { describe, it, expect } from "vitest";
import type { Expense, ExpenseCategory, ParsedVoiceItem } from "@/lib/types/expense";
import type { SyncQueueItem } from "@/lib/types/sync";

describe("Domain Types Validation", () => {
  it("creates valid Expense and ParsedVoiceItem instances", () => {
    const category: ExpenseCategory = "primer";
    const item: ParsedVoiceItem = {
      id: "item-1",
      rawText: "beli nasi goreng 15rb",
      itemName: "Nasi Goreng",
      amount: 15000,
      category,
      confidence: 0.95,
    };
    expect(item.amount).toBe(15000);
    expect(item.category).toBe("primer");
  });
});
```

- [ ] **Step 2: Run test to verify it fails (types not defined yet)**

Run: `npx vitest run tests/types/domain-types.test.ts`
Expected: FAIL (Cannot find module '@/lib/types/expense')

- [ ] **Step 3: Implement domain types**

Create `src/lib/types/expense.ts`, `src/lib/types/sync.ts`, and `src/lib/types/auth.ts` with strict TypeScript types as specified in Section 4 of the design doc.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/types/domain-types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/types/ tests/types/
git commit -m "feat(types): define domain models for expenses, sync queue, and auth"
```

---

### Task 3: Deterministic Indonesian NLP - Number & Currency Normalizer

**Files:**
- Create: `src/lib/nlp/number-normalizer.ts`
- Test: `tests/nlp/number-normalizer.test.ts`

**Interfaces:**
- Consumes: Indonesian numeric word tokens and numeric strings
- Produces: `parseIndonesianNumber(text: string): { amount: number; matchedText: string } | null`

- [ ] **Step 1: Write tests for Indonesian spoken number parsing**

```ts
// tests/nlp/number-normalizer.test.ts
import { describe, it, expect } from "vitest";
import { parseIndonesianNumber } from "@/lib/nlp/number-normalizer";

describe("Indonesian Number Normalizer", () => {
  it("parses single words", () => {
    expect(parseIndonesianNumber("lima belas ribu")?.amount).toBe(15000);
    expect(parseIndonesianNumber("dua puluh lima ribu")?.amount).toBe(25000);
    expect(parseIndonesianNumber("dua juta lima ratus ribu")?.amount).toBe(2500000);
  });

  it("parses colloquial abbreviations", () => {
    expect(parseIndonesianNumber("15rb")?.amount).toBe(15000);
    expect(parseIndonesianNumber("15k")?.amount).toBe(15000);
    expect(parseIndonesianNumber("20 rb")?.amount).toBe(20000);
    expect(parseIndonesianNumber("2.5jt")?.amount).toBe(2500000);
    expect(parseIndonesianNumber("2,5 juta")?.amount).toBe(2500000);
  });

  it("parses Indonesian slang denominations", () => {
    expect(parseIndonesianNumber("ceban")?.amount).toBe(10000);
    expect(parseIndonesianNumber("gocap")?.amount).toBe(50000);
    expect(parseIndonesianNumber("seceng")?.amount).toBe(1000);
    expect(parseIndonesianNumber("gopek")?.amount).toBe(500);
    expect(parseIndonesianNumber("setengah juta")?.amount).toBe(500000);
  });

  it("handles currency words gracefully", () => {
    expect(parseIndonesianNumber("sepuluh ribu rupiah")?.amount).toBe(10000);
    expect(parseIndonesianNumber("lima ribu perak")?.amount).toBe(5000);
    expect(parseIndonesianNumber("rp 15.000")?.amount).toBe(15000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/nlp/number-normalizer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/lib/nlp/number-normalizer.ts`**

Implement deterministic mapping of Indonesian base words (`satu`..`sembilan`, `belas`, `puluh`, `ratus`, `ribu`, `juta`), slang (`ceban`, `gocap`, `seceng`, `gopek`, `setengah juta`), and hybrid digit suffixes (`k`, `rb`, `jt`, `rupiah`, `perak`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/nlp/number-normalizer.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/nlp/number-normalizer.ts tests/nlp/number-normalizer.test.ts
git commit -m "feat(nlp): implement Indonesian spoken number and currency normalizer"
```

---

### Task 4: Deterministic Indonesian NLP - Text Normalizer & Transaction Splitter

**Files:**
- Create: `src/lib/nlp/normalize-text.ts`
- Create: `src/lib/nlp/transaction-splitter.ts`
- Test: `tests/nlp/transaction-splitter.test.ts`

**Interfaces:**
- Consumes: Raw spoken Indonesian transcript string
- Produces: `normalizeText(raw: string): string`, `splitTransactions(text: string): string[]`

- [ ] **Step 1: Write test for splitting multi-item speech and avoiding false splits**

```ts
// tests/nlp/transaction-splitter.test.ts
import { describe, it, expect } from "vitest";
import { splitTransactions } from "@/lib/nlp/transaction-splitter";

describe("Transaction Splitter", () => {
  it("splits compound sentence with price before conjunction", () => {
    const raw = "beli nasi goreng lima belas ribu dan es teh lima ribu";
    const segments = splitTransactions(raw);
    expect(segments.length).toBe(2);
    expect(segments[0]).toContain("nasi goreng");
    expect(segments[1]).toContain("es teh");
  });

  it("splits multiple conjunctions: sama, lalu, terus", () => {
    const raw = "ayam geprek 15rb terus parkir 2rb sama pulsa 25rb";
    const segments = splitTransactions(raw);
    expect(segments.length).toBe(3);
  });

  it("does NOT split 'dan' when connecting items without preceding price (smart guard)", () => {
    const raw = "beli nasi dan ayam bakar 25 ribu";
    const segments = splitTransactions(raw);
    expect(segments.length).toBe(1);
    expect(segments[0]).toBe("beli nasi dan ayam bakar 25 ribu");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/nlp/transaction-splitter.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `normalizeText.ts` and `transaction-splitter.ts`**

Implement sentence splitting with conjunction regex (`\b(dan|sama|lalu|terus|kemudian|serta)\b|,`) while validating whether the substring preceding the delimiter contains a valid amount/price marker.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/nlp/transaction-splitter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/nlp/normalize-text.ts src/lib/nlp/transaction-splitter.ts tests/nlp/transaction-splitter.test.ts
git commit -m "feat(nlp): implement text normalizer and conjunction-aware transaction splitter"
```

---

### Task 5: Item Extractor, Categorization, and Complete Parser Pipeline

**Files:**
- Create: `src/lib/nlp/item-extractor.ts`
- Create: `src/lib/categorization/expense-category-classifier.ts`
- Create: `src/lib/nlp/confidence.ts`
- Create: `src/lib/nlp/indonesian-expense-parser.ts`
- Test: `tests/nlp/indonesian-expense-parser.test.ts`

**Interfaces:**
- Consumes: Full raw transcript string
- Produces: `parseIndonesianExpense(transcript: string): ParsedVoiceItem[]`

- [ ] **Step 1: Write integration tests for the full parser pipeline**

```ts
// tests/nlp/indonesian-expense-parser.test.ts
import { describe, it, expect } from "vitest";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";

describe("Indonesian Expense Parser Pipeline", () => {
  it("parses single student expense with filler removal", () => {
    const result = parseIndonesianExpense("tadi beli nasi padang lima belas ribu");
    expect(result).toHaveLength(1);
    expect(result[0].itemName.toLowerCase()).toBe("nasi padang");
    expect(result[0].amount).toBe(15000);
    expect(result[0].category).toBe("primer");
    expect(result[0].confidence).toBeGreaterThan(0.8);
  });

  it("parses compound expense into primer and bocor_halus", () => {
    const transcript = "beli ayam geprek dua puluh ribu sama kopi susu lima belas ribu";
    const result = parseIndonesianExpense(transcript);
    expect(result).toHaveLength(2);

    expect(result[0].itemName.toLowerCase()).toBe("ayam geprek");
    expect(result[0].amount).toBe(20000);
    expect(result[0].category).toBe("primer");

    expect(result[1].itemName.toLowerCase()).toBe("kopi susu");
    expect(result[1].amount).toBe(15000);
    expect(result[1].category).toBe("bocor_halus");
  });

  it("handles empty or unparseable input gracefully", () => {
    expect(parseIndonesianExpense("")).toHaveLength(0);
    expect(parseIndonesianExpense("halo selamat pagi")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/nlp/indonesian-expense-parser.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement item extraction, classifier, confidence, and main parser**

Implement:
- `src/lib/nlp/item-extractor.ts`: strips filler phrases (`tadi beli`, `bayar`, `beli`, `buat`, `untuk`, `keluar uang`, `seharga`, `habis`), title-cases output.
- `src/lib/categorization/expense-category-classifier.ts`: deterministic matching for `primer` (makan, bensin, pulsa, kos, laundry, obat, fotokopi, etc.) and `bocor_halus` (kopi, cafe, nongkrong, boba, mixue, snack, rokok, vape, top up game, diamond, steam, shopee).
- `src/lib/nlp/confidence.ts`: computes 0.0 - 1.0 confidence based on amount and item validity.
- `src/lib/nlp/indonesian-expense-parser.ts`: composes all stages and returns `ParsedVoiceItem[]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/nlp/indonesian-expense-parser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/nlp/ src/lib/categorization/ tests/nlp/
git commit -m "feat(nlp): complete pure TypeScript Indonesian voice expense parser pipeline"
```

---

### Task 6: Web Speech Recognition Hook

**Files:**
- Create: `src/hooks/use-speech-recognition.ts`
- Test: `tests/hooks/use-speech-recognition.test.ts`

**Interfaces:**
- Consumes: Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- Produces: `useSpeechRecognition(): { isListening, transcript, interimTranscript, error, isSupported, startListening, stopListening, resetTranscript }`

- [ ] **Step 1: Write test for hook interface & state management**

```ts
// tests/hooks/use-speech-recognition.test.ts
import { describe, it, expect } from "vitest";

describe("useSpeechRecognition Hook Specification", () => {
  it("exports expected interface and defaults", async () => {
    const { useSpeechRecognition } = await import("@/hooks/use-speech-recognition");
    expect(typeof useSpeechRecognition).toBe("function");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/hooks/use-speech-recognition.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/hooks/use-speech-recognition.ts`**

Implement:
- Check for `window.SpeechRecognition || window.webkitSpeechRecognition`.
- Set `lang = "id-ID"`, `continuous = true`, `interimResults = true`.
- Implement 2000ms inactivity timer on incoming `result` event that triggers `stopListening()`.
- Error mapping (`not-allowed`, `no-speech`, `network`, `audio-capture`).
- Safe cleanup on unmount to avoid duplicate listeners.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/hooks/use-speech-recognition.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-speech-recognition.ts tests/hooks/use-speech-recognition.test.ts
git commit -m "feat(speech): implement native Indonesian Web Speech API hook with silence auto-stop"
```

---

### Task 7: Local-First IndexedDB Storage & Sync Queue

**Files:**
- Create: `src/lib/storage/indexed-db.ts`
- Create: `src/lib/storage/sync-queue.ts`
- Create: `src/lib/storage/expense-storage.ts`
- Test: `tests/storage/expense-storage.test.ts`

**Interfaces:**
- Consumes: `idb` library, `Expense`, `SyncQueueItem`
- Produces: `ExpenseStorage` class with `saveExpense`, `saveExpenses`, `getExpenses`, `updateExpense`, `deleteExpense`, `claimGuestExpenses`

- [ ] **Step 1: Write storage CRUD and guest migration tests**

```ts
// tests/storage/expense-storage.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncQueue } from "@/lib/storage/sync-queue";

describe("Expense Storage & Sync Queue", () => {
  beforeEach(async () => {
    await expenseStorage.clearAll();
  });

  it("saves, retrieves, and updates local expenses", async () => {
    const expense = await expenseStorage.saveExpense({
      itemName: "Nasi Padang",
      amount: 18000,
      category: "primer",
      userId: "guest",
    });

    expect(expense.id).toBeDefined();
    expect(expense.syncStatus).toBe("pending");

    const all = await expenseStorage.getExpenses("guest");
    expect(all).toHaveLength(1);
    expect(all[0].itemName).toBe("Nasi Padang");

    // Check sync queue item was created
    const queue = await syncQueue.getPendingItems();
    expect(queue).toHaveLength(1);
    expect(queue[0].action).toBe("create");
  });

  it("migrates guest expenses to authenticated user", async () => {
    await expenseStorage.saveExpense({
      itemName: "Kopi Susu",
      amount: 15000,
      category: "bocor_halus",
      userId: "guest",
    });

    await expenseStorage.claimGuestExpenses("user-123");

    const guestItems = await expenseStorage.getExpenses("guest");
    expect(guestItems).toHaveLength(0);

    const userItems = await expenseStorage.getExpenses("user-123");
    expect(userItems).toHaveLength(1);
    expect(userItems[0].userId).toBe("user-123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm install -D fake-indexeddb`
Run: `npx vitest run tests/storage/expense-storage.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement IndexedDB schema, SyncQueue, and ExpenseStorage**

Implement:
- `src/lib/storage/indexed-db.ts`: opens `voicash_db` v1 with `expenses`, `sync_queue`, `metadata` stores.
- `src/lib/storage/sync-queue.ts`: enqueue, dequeue, peek, markFailed, clear.
- `src/lib/storage/expense-storage.ts`: full CRUD, soft-delete with `isDeleted: true`, and `claimGuestExpenses`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/storage/expense-storage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage/ tests/storage/
git commit -m "feat(storage): implement local-first IndexedDB layer with sync queue and guest migration"
```

---

### Task 8: Prisma Database Schema & Singleton Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `docker-compose.yml` (for local PostgreSQL development)

**Interfaces:**
- Consumes: PostgreSQL connection URL
- Produces: Generated Prisma Client with `User` and `Expense` models

- [ ] **Step 1: Create `prisma/schema.prisma`**

Define `User` and `Expense` models with indices on `[userId, updatedAt]` and cascade relations as per design specification.

- [ ] **Step 2: Create local `docker-compose.yml` and `.env.example`**

Provide `docker-compose.yml` with a standard `postgres:16-alpine` container configuration on port 5432 and update `.env.example` with `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/voicash?schema=public"`.

- [ ] **Step 3: Create Prisma singleton in `src/lib/prisma.ts`**

Export global singleton Prisma client to prevent multiple connection pools during Next.js hot module reloading.

- [ ] **Step 4: Generate Prisma client**

Run: `npx prisma generate`
Expected: Generated Prisma Client successfully.

- [ ] **Step 5: Commit**

```bash
git add prisma/ docker-compose.yml src/lib/prisma.ts .env.example
git commit -m "feat(db): configure Prisma schema, PostgreSQL compose, and client singleton"
```

---

### Task 9: Backend Authentication & Security Route Handlers

**Files:**
- Create: `src/lib/auth/jwt.ts`
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Test: `tests/api/auth-jwt.test.ts`

**Interfaces:**
- Consumes: User credentials (`email`, `password`, `name`)
- Produces: `voicash_session` httpOnly secure cookie containing signed JWT `{ userId, email, name }`

- [ ] **Step 1: Write test for JWT generation and verification**

```ts
// tests/api/auth-jwt.test.ts
import { describe, it, expect } from "vitest";
import { signSessionToken, verifySessionToken } from "@/lib/auth/jwt";

describe("Auth JWT Service", () => {
  it("signs and verifies session token correctly", async () => {
    const payload = { userId: "user-1", email: "student@kampus.id", name: "Budi" };
    const token = await signSessionToken(payload);
    expect(typeof token).toBe("string");

    const verified = await verifySessionToken(token);
    expect(verified?.userId).toBe("user-1");
    expect(verified?.email).toBe("student@kampus.id");
  });

  it("returns null for invalid or expired token", async () => {
    const verified = await verifySessionToken("invalid.token.here");
    expect(verified).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api/auth-jwt.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement JWT helper and Next.js route handlers**

Implement `src/lib/auth/jwt.ts` using `jose` with fallback secret for dev. Implement registration with bcrypt password hash, login verification, session retrieval (`/api/auth/me`), and logout.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api/auth-jwt.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/jwt.ts src/app/api/auth/ tests/api/auth-jwt.test.ts
git commit -m "feat(auth): implement secure JWT httpOnly session handlers"
```

---

### Task 10: Backend Batch Sync & Multi-Tenant Route Handlers

**Files:**
- Create: `src/app/api/sync/route.ts`
- Create: `src/app/api/expenses/route.ts`
- Create: `src/lib/sync/sync-manager.ts`
- Test: `tests/api/sync-reconciliation.test.ts`

**Interfaces:**
- Consumes: `POST /api/sync` payload with `clientChanges` and `lastSyncTimestamp`
- Produces: Reconciled cloud state, applied IDs, and server changes newer than timestamp

- [ ] **Step 1: Write sync reconciliation logic test**

```ts
// tests/api/sync-reconciliation.test.ts
import { describe, it, expect } from "vitest";
import { reconcileChanges } from "@/lib/sync/sync-manager";
import type { Expense } from "@/lib/types/expense";

describe("Sync Conflict Reconciliation", () => {
  it("resolves conflicts using Last-Write-Wins based on updatedAt", () => {
    const local: Expense = {
      id: "e-1",
      userId: "u-1",
      itemName: "Nasi Goreng Spesial",
      amount: 20000,
      category: "primer",
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-01T10:05:00.000Z",
    };

    const server: Expense = {
      id: "e-1",
      userId: "u-1",
      itemName: "Nasi Goreng Biasa",
      amount: 15000,
      category: "primer",
      createdAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-10-01T10:02:00.000Z",
    };

    const winner = reconcileChanges(local, server);
    expect(winner.itemName).toBe("Nasi Goreng Spesial");
    expect(winner.amount).toBe(20000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api/sync-reconciliation.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement batch sync route and sync manager**

Implement `POST /api/sync` requiring user auth, executing transactional upserts and soft deletions with `where: { userId: session.userId }`. Implement `src/lib/sync/sync-manager.ts` to coordinate client-to-server syncing on network status change and periodic intervals.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api/sync-reconciliation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/sync/ src/app/api/expenses/ src/lib/sync/ tests/api/sync-reconciliation.test.ts
git commit -m "feat(sync): implement batch transactional sync endpoint and client sync manager"
```

---

### Task 11: Voice Expense UI & Review Confirmation Flow

**Files:**
- Create: `src/components/expense/voice-expense-sheet.tsx`
- Create: `src/components/expense/voice-recorder.tsx`
- Create: `src/components/expense/transcript-preview.tsx`
- Create: `src/components/expense/parsed-expense-list.tsx`
- Create: `src/components/expense/expense-editor.tsx`
- Create: `src/components/expense/manual-expense-input.tsx`
- Test: `tests/ui/voice-flow-states.test.ts`

**Interfaces:**
- Consumes: `useSpeechRecognition`, `parseIndonesianExpense`, `ExpenseStorage`
- Produces: Interactive mobile bottom sheet guiding student from mic tap → speech transcript → card review & edit → explicit save confirmation

- [ ] **Step 1: Write test for voice recording UI states**

```ts
// tests/ui/voice-flow-states.test.ts
import { describe, it, expect } from "vitest";

describe("Voice Flow Component Definitions", () => {
  it("exports required voice expense components", async () => {
    const sheet = await import("@/components/expense/voice-expense-sheet");
    expect(sheet.VoiceExpenseSheet).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ui/voice-flow-states.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement voice sheet and subcomponents**

Implement:
- `voice-recorder.tsx`: Prominent mic button with animated pulse ring for `LISTENING` and spinner for `PROCESSING`.
- `transcript-preview.tsx`: Live display of interim and final Indonesian transcript.
- `parsed-expense-list.tsx`: Cards showing Item Name, formatted Rupiah (`Rp15.000`), Category Badge toggle (`Primer` vs `Bocor Halus`), and Edit / Delete buttons.
- `expense-editor.tsx`: Modal to fine-tune amount, item name, or category before saving.
- `manual-expense-input.tsx`: Fallback text box running the identical pure TS parser.
- `voice-expense-sheet.tsx`: Main bottom sheet coordinating state machine (Idle → Listening → Processing → Review → Saved → Error).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ui/voice-flow-states.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/expense/ tests/ui/voice-flow-states.test.ts
git commit -m "feat(ui): implement voice recording sheet and review confirmation components"
```

---

### Task 12: Student Dashboard & Spending Analytics UI

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/dashboard/metric-cards.tsx`
- Create: `src/components/dashboard/category-breakdown.tsx`
- Create: `src/components/dashboard/sync-indicator.tsx`
- Create: `src/components/expense/expense-list-item.tsx`
- Create: `src/components/layout/bottom-nav.tsx`
- Create: `src/components/layout/privacy-dialog.tsx`
- Create: `src/hooks/use-expenses.ts`

**Interfaces:**
- Consumes: `useExpenses` hook, `useAuth` hook
- Produces: Complete student dashboard displaying monthly/weekly totals, Primer vs Bocor Halus ratio, recent expense feed, and privacy dialog

- [ ] **Step 1: Write test for dashboard metrics calculation**

```ts
// tests/ui/dashboard-metrics.test.ts
import { describe, it, expect } from "vitest";
import { calculateMetrics } from "@/components/dashboard/metric-cards";
import type { Expense } from "@/lib/types/expense";

describe("Dashboard Analytics Calculation", () => {
  it("calculates total, primer, and bocor_halus ratios correctly", () => {
    const expenses: Expense[] = [
      { id: "1", userId: "u", itemName: "Warteg", amount: 15000, category: "primer", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: "2", userId: "u", itemName: "Kopi", amount: 15000, category: "bocor_halus", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
    const metrics = calculateMetrics(expenses);
    expect(metrics.totalMonth).toBe(30000);
    expect(metrics.primerTotal).toBe(15000);
    expect(metrics.bocorHalusTotal).toBe(15000);
    expect(metrics.primerPercentage).toBe(50);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ui/dashboard-metrics.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement dashboard components and main page**

Implement:
- `src/components/dashboard/metric-cards.tsx`: Total Month, Today, This Week.
- `src/components/dashboard/category-breakdown.tsx`: Visual progress bar showing Primer vs Bocor Halus percentage.
- `src/components/dashboard/sync-indicator.tsx`: Cloud icon indicator (Synced, Pending, Offline).
- `src/components/layout/bottom-nav.tsx`: Floating action bar with center microphone shortcut.
- `src/components/layout/privacy-dialog.tsx`: Clear, friendly Indonesian privacy policy modal.
- `src/app/page.tsx`: Connects dashboard, bottom bar, and voice expense sheet.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ui/dashboard-metrics.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/components/dashboard/ src/components/layout/ src/hooks/use-expenses.ts tests/ui/dashboard-metrics.test.ts
git commit -m "feat(dashboard): implement student financial dashboard and spending analytics"
```

---

### Task 13: Progressive Web App (PWA) Manifest & Service Worker

**Files:**
- Create: `public/manifest.json`
- Create: `src/app/manifest.ts`
- Create: `public/sw.js`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`
- Modify: `src/app/layout.tsx` (register service worker and PWA meta tags)
- Test: `tests/pwa/manifest.test.ts`

**Interfaces:**
- Consumes: Web App standards
- Produces: Installable PWA with offline shell caching and home screen installability

- [ ] **Step 1: Write test for PWA manifest content**

```ts
// tests/pwa/manifest.test.ts
import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("PWA Web App Manifest", () => {
  it("provides valid PWA metadata for Indonesian students", () => {
    const config = manifest();
    expect(config.name).toBe("VoiCash - Catat Pengeluaran Suara");
    expect(config.short_name).toBe("VoiCash");
    expect(config.display).toBe("standalone");
    expect(config.icons?.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/pwa/manifest.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Manifest, Service Worker, and App Shell Layout**

Create `src/app/manifest.ts`, `public/manifest.json`, `public/sw.js` with Cache-First strategy for static assets and Network-First for HTML navigation. Register SW in `src/app/layout.tsx`. Generate crisp SVG/PNG icons in `public/icons/`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/pwa/manifest.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add public/ src/app/manifest.ts src/app/layout.tsx tests/pwa/manifest.test.ts
git commit -m "feat(pwa): implement PWA manifest, icons, and offline service worker"
```

---

### Task 14: Authentication UI Screens & Verification

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/hooks/use-auth.ts`
- Test: `tests/ui/auth-pages.test.ts`

**Interfaces:**
- Consumes: `/api/auth/*` endpoints, `ExpenseStorage.claimGuestExpenses`
- Produces: Student login and registration screens that automatically migrate local guest records upon sign-in

- [ ] **Step 1: Write test for auth hooks & migration**

```ts
// tests/ui/auth-pages.test.ts
import { describe, it, expect } from "vitest";

describe("Auth UI Screens", () => {
  it("exports Login and Register pages", async () => {
    const login = await import("@/app/login/page");
    const register = await import("@/app/register/page");
    expect(login.default).toBeDefined();
    expect(register.default).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ui/auth-pages.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement Login, Register, and useAuth hook**

Implement clean, accessible forms for login and registration with friendly Indonesian error messages. Connect `claimGuestExpenses` on login success so local expenses seamlessly upload to the cloud account.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ui/auth-pages.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/login/ src/app/register/ src/hooks/use-auth.ts tests/ui/auth-pages.test.ts
git commit -m "feat(auth-ui): implement student login, register pages, and guest data migration"
```

---

### Task 15: Full System Verification, Linting, & Production Build

**Files:**
- Modify: `package.json` (verify scripts: `test`, `typecheck`, `lint`, `build`)

**Interfaces:**
- Consumes: All project modules
- Produces: Green test suite, clean lint, zero type errors, successful `next build` artifact

- [ ] **Step 1: Run complete test suite**

Run: `npx vitest run`
Expected: ALL test suites PASS.

- [ ] **Step 2: Run TypeScript compiler check**

Run: `npx tsc --noEmit`
Expected: Zero TypeScript errors.

- [ ] **Step 3: Run Next.js production build**

Run: `npm run build`
Expected: Production build successfully generated in `.next/`.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore(release): verify all test suites, typechecks, and production build"
```
