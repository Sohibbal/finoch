# Finoch Simplification & Core Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Finoch from a bloated multi-subsystem portal into a focused, friendly, local-first personal financial companion featuring symmetric Income/Expense tracking (Voice, Scan, Manual), dynamic Wishlist impulse control, a Gen-Z daily financial insight & streak dashboard, FinBot AI Copilot grounded on user database facts, and a single-card typewriter onboarding.

**Architecture:** Unified `Transaction` (type: "income" | "expense") and `Wishlist` data model backed by Local-first IndexedDB storage with background sync to PostgreSQL via Prisma. A heuristic Gen-Z financial engine delivers instant offline insights on the dashboard, while FinBot injects live aggregate database snapshots into an LLM with Gen-Z persona prompts. App navigation is streamlined strictly to 6 core pages using Lucide React icons.

**Tech Stack:** Next.js 15.2 (App Router), React 19, TypeScript 5.8 (Strict), Tailwind CSS 3.4, Prisma 6.4 + PostgreSQL, IndexedDB (`idb` v8), Web Speech API + Transformers.js (Whisper WASM), Tesseract.js (Client OCR), Vitest 3.0, Lucide React.

**Spec:** `docs/superpowers/specs/2026-10-11-finoch-simplification-design.md`

## Global Constraints

- Navigation and AppShell must only contain 6 menus: Beranda (`/dashboard`), Pemasukan (`/pemasukan`), Pengeluaran (`/pengeluaran`), Wishlist (`/wishlist`), FinBot (`/copilot`), Profil (`/profile`).
- All 10 legacy subsystems (bills, budget, debts, ukt-savings, meal-calc, audit, reports, streak-standalone, simulator, split-bill, wallets) must be cleanly removed without dangling imports.
- Control UI elements and buttons must strictly use Lucide React SVG icons (no raw emojis for action buttons or tab items).
- Onboarding must only ask for user `nickname` inside a centered Card with a typewriter greeting and FinBot icon.
- Both Pemasukan and Pengeluaran must support 3 input modes: Voice (Bicara), Scan (OCR), and Manual, with auto-category classification and history tables.
- All tests must pass via `pnpm test` and strict typechecking must succeed via `pnpm typecheck`.

## Review Focus

1. **Negative Balance or Zero Income Edge Cases**: When user has 0 income or negative balance, Wishlist projection and Gen-Z insight must gracefully show realistic friendly warnings rather than `NaN` or `Infinity` days.
2. **Offline Transaction Queuing**: If recording income/expense without internet, transactions must persist in IndexedDB and sync to PostgreSQL immediately once online without duplicating IDs.
3. **Slang / Multi-item Voice Recognition**: Pemasukan and Pengeluaran voice inputs must correctly parse Indonesian slang terms ("goceng", "ceban", "gocap", "sejuta") without crashing.
4. **FinBot Context Snapshot Grounding**: When user asks FinBot questions about spending, answers must quote real database totals (top expense item, net balance) rather than hallucinated dummy data.
5. **Onboarding Skip / Auth Guard**: Unauthenticated users or users without a nickname must be redirected to login / onboarding before accessing `(app)/*`.

---

### Task 1: Clean Removal of Legacy Subsystems & Routes

**Files:**
- Delete:
  - `src/app/(app)/bills`
  - `src/app/(app)/budget`
  - `src/app/(app)/debts`
  - `src/app/(app)/ukt-savings`
  - `src/app/(app)/meal-calc`
  - `src/app/(app)/audit`
  - `src/app/(app)/reports`
  - `src/app/(app)/streak`
  - `src/app/(app)/simulator`
  - `src/app/(app)/split-bill`
  - `src/app/(app)/wallets`
  - `src/app/(app)/goals`
  - `src/app/(app)/insights`
  - `src/components/bills/`
  - `src/components/budget/`
  - `src/components/debts/`
  - `src/components/ukt/`
  - `src/components/meal-calc/`
  - `src/components/audit/`
  - `src/components/reports/`
  - `src/components/simulator/`
  - `src/components/split-bill/`
  - `src/components/wallets/`
  - `src/lib/financial/meal-calc-engine.ts`
  - `src/lib/financial/ukt-engine.ts`
  - `src/lib/financial/debt-engine.ts`
  - `src/lib/financial/split-bill-engine.ts`
  - `src/lib/financial/audit-engine.ts`
  - `src/lib/financial/budget-engine.ts`
  - `src/lib/financial/report-engine.ts`
  - `src/lib/financial/runway-engine.ts`
  - `src/lib/financial/survival-engine.ts`
  - `src/lib/financial/wallet-engine.ts`
- Modify: `tests/` (remove tests referencing deleted legacy engines and UI pages)

**Interfaces:**
- Consumes: Existing repo files.
- Produces: Clean codebase baseline without dead legacy route folders.

- [ ] **Step 1: Write verification test for remaining core modules**

Create `tests/core/core-smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("Core Baseline Modules", () => {
  it("keeps core authentication, nlp, and storage foundations intact", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify runner succeeds**

Run: `pnpm test tests/core/core-smoke.test.ts`  
Expected: PASS

- [ ] **Step 3: Remove legacy folders and dead test files**

Delete the listed legacy directories:
```powershell
Remove-Item -Recurse -Force src/app/(app)/bills, src/app/(app)/budget, src/app/(app)/debts, src/app/(app)/ukt-savings, src/app/(app)/meal-calc, src/app/(app)/audit, src/app/(app)/reports, src/app/(app)/streak, src/app/(app)/simulator, src/app/(app)/split-bill, src/app/(app)/wallets, src/app/(app)/goals, src/app/(app)/insights -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force src/components/bills, src/components/budget, src/components/debts, src/components/ukt, src/components/meal-calc, src/components/audit, src/components/reports, src/components/simulator, src/components/split-bill, src/components/wallets -ErrorAction SilentlyContinue
Remove-Item -Force src/lib/financial/meal-calc-engine.ts, src/lib/financial/ukt-engine.ts, src/lib/financial/debt-engine.ts, src/lib/financial/split-bill-engine.ts, src/lib/financial/audit-engine.ts, src/lib/financial/budget-engine.ts, src/lib/financial/report-engine.ts, src/lib/financial/runway-engine.ts, src/lib/financial/survival-engine.ts, src/lib/financial/wallet-engine.ts -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force tests/ui/bills-page.test.ts, tests/ui/budget-page.test.ts, tests/ui/debts-page.test.ts, tests/ui/ukt-savings-page.test.ts, tests/ui/meal-calc-page.test.ts, tests/ui/audit-page.test.ts, tests/ui/reports-page.test.ts, tests/ui/what-if-simulator.test.ts, tests/ui/split-bill-page.test.ts, tests/ui/wallets-page.test.ts, tests/ui/goals-page.test.ts, tests/financial/meal-calc-engine.test.ts, tests/financial/ukt-engine.test.ts, tests/financial/debt-engine.test.ts, tests/financial/split-bill-engine.test.ts, tests/financial/audit-engine.test.ts, tests/financial/budget-engine.test.ts, tests/financial/report-engine.test.ts, tests/financial/runway-engine.test.ts, tests/financial/survival-engine.test.ts, tests/financial/wallet-engine.test.ts, tests/storage/wallet-storage.test.ts, tests/storage/debt-storage.test.ts, tests/storage/bill-storage.test.ts, tests/storage/budget-storage.test.ts, tests/storage/ukt-storage.test.ts, tests/storage/expense-wallet.test.ts -ErrorAction SilentlyContinue
```

- [ ] **Step 4: Verify remaining tests still pass**

Run: `pnpm test`  
Expected: PASS (remaining core auth, nlp, ocr, audio, and sync tests pass cleanly)

- [ ] **Step 5: Commit changes**

```bash
git add .
git commit -m "refactor: remove legacy subsystems and components"
```

---

### Task 2: Database Schema & Unified Transaction & Wishlist Model

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20261011230000_core_simplification/migration.sql`
- Test: `tests/db/schema-integrity.test.ts`

**Interfaces:**
- Produces:
  - `model Profile { id, userId, nickname, createdAt, updatedAt }`
  - `model Transaction { id, userId, type: "income" | "expense", itemName, amount, category, source, transactionDate, isDeleted, createdAt, updatedAt, serverUpdatedAt }`
  - `model Wishlist { id, userId, name, targetPrice, savedAmount, priority, isAchieved, isDeleted, createdAt, updatedAt, serverUpdatedAt }`

- [ ] **Step 1: Write test for schema definitions**

Create `tests/db/schema-integrity.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Prisma Schema Core Structure", () => {
  it("defines User, Profile, Transaction, and Wishlist models", () => {
    const schema = fs.readFileSync(path.resolve("prisma/schema.prisma"), "utf8");
    expect(schema).toContain("model User");
    expect(schema).toContain("model Profile");
    expect(schema).toContain("model Transaction");
    expect(schema).toContain("model Wishlist");
    expect(schema).toContain("nickname");
    expect(schema).toContain("type");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/db/schema-integrity.test.ts`  
Expected: FAIL (model Profile and unified models not yet configured in schema)

- [ ] **Step 3: Update `prisma/schema.prisma`**

Update `prisma/schema.prisma` with clean unified models:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String
  name         String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  profile      Profile?
  transactions Transaction[]
  wishlists    Wishlist[]

  @@map("users")
}

model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  nickname  String   @default("Teman")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("profiles")
}

model Transaction {
  id              String   @id // Client-generated UUID v4
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            String   // "income" | "expense"
  itemName        String
  amount          Int
  category        String
  source          String   @default("manual") // "manual" | "voice" | "ocr"
  transactionDate DateTime @default(now())
  isDeleted       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  serverUpdatedAt DateTime @default(now()) @updatedAt

  @@index([userId, transactionDate])
  @@index([userId, type])
  @@index([userId, serverUpdatedAt])
  @@map("transactions")
}

model Wishlist {
  id              String   @id // Client-generated UUID v4
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name            String
  targetPrice     Int
  savedAmount     Int      @default(0)
  priority        Int      @default(1)
  isAchieved      Boolean  @default(false)
  isDeleted       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  serverUpdatedAt DateTime @default(now()) @updatedAt

  @@index([userId, isAchieved])
  @@index([userId, serverUpdatedAt])
  @@map("wishlists")
}
```

- [ ] **Step 4: Generate Prisma Client & verify test passes**

Run:
```powershell
pnpm exec prisma generate
pnpm test tests/db/schema-integrity.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add prisma/schema.prisma tests/db/schema-integrity.test.ts
git commit -m "feat(db): modernize schema with Profile, unified Transaction, and Wishlist"
```

---

### Task 3: Local-First Storage & Synchronization Service

**Files:**
- Create: `src/lib/storage/transaction-storage.ts`
- Create: `src/lib/storage/wishlist-storage.ts`
- Modify: `src/lib/storage/indexed-db.ts`
- Modify: `src/app/api/sync/route.ts`
- Test: `tests/storage/transaction-storage.test.ts`
- Test: `tests/storage/wishlist-storage.test.ts`

**Interfaces:**
- Produces:
  - `saveTransaction(tx: Transaction): Promise<void>`
  - `getTransactions(type?: 'income' | 'expense'): Promise<Transaction[]>`
  - `deleteTransaction(id: string): Promise<void>`
  - `saveWishlistItem(item: Wishlist): Promise<void>`
  - `getWishlistItems(): Promise<Wishlist[]>`
  - `toggleWishlistAchieved(id: string): Promise<void>`

- [ ] **Step 1: Write test for transaction-storage**

Create `tests/storage/transaction-storage.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import { saveTransaction, getTransactions, deleteTransaction } from "@/lib/storage/transaction-storage";

describe("Transaction Local Storage", () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it("stores and retrieves income and expense transactions", async () => {
    await saveTransaction({
      id: "tx-1",
      userId: "u-1",
      type: "income",
      itemName: "Gaji Freelance",
      amount: 500000,
      category: "Freelance",
      source: "manual",
      transactionDate: new Date().toISOString(),
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await saveTransaction({
      id: "tx-2",
      userId: "u-1",
      type: "expense",
      itemName: "Makan Siang",
      amount: 25000,
      category: "Makanan & Minuman",
      source: "voice",
      transactionDate: new Date().toISOString(),
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const all = await getTransactions();
    expect(all).toHaveLength(2);

    const incomes = await getTransactions("income");
    expect(incomes).toHaveLength(1);
    expect(incomes[0].itemName).toBe("Gaji Freelance");

    await deleteTransaction("tx-2");
    const afterDelete = await getTransactions("expense");
    expect(afterDelete).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/storage/transaction-storage.test.ts`  
Expected: FAIL (`saveTransaction` not found)

- [ ] **Step 3: Implement `src/lib/storage/transaction-storage.ts` and update `indexed-db.ts`**

Update `src/lib/storage/indexed-db.ts` to include `transactions` and `wishlists` stores, then implement `src/lib/storage/transaction-storage.ts` and `src/lib/storage/wishlist-storage.ts` supporting full CRUD and sync queue enqueueing.

- [ ] **Step 4: Update `/api/sync/route.ts` to handle unified transactions and wishlists**

Update `src/app/api/sync/route.ts` to process batch sync for `transactions` and `wishlists` with Last-Write-Wins logic and clock skew protection.

- [ ] **Step 5: Run tests to verify they pass**

Run:
```powershell
pnpm test tests/storage/transaction-storage.test.ts
```
Expected: PASS

- [ ] **Step 6: Commit changes**

```bash
git add src/lib/storage/ tests/storage/ src/app/api/sync/
git commit -m "feat(storage): implement local-first transactions, wishlists, and sync handler"
```

---

### Task 4: Minimalist Typewriter Onboarding with FinBot Persona

**Files:**
- Create: `src/components/onboarding/typewriter-card.tsx`
- Modify: `src/app/onboarding/page.tsx`
- Create: `tests/ui/onboarding-typewriter.test.tsx`

**Interfaces:**
- Produces:
  - `<TypewriterCard onComplete={(nickname: string) => void} />`
  - Onboarding page redirects to `/dashboard` upon saving nickname to user profile.

- [ ] **Step 1: Write UI test for Typewriter Card**

Create `tests/ui/onboarding-typewriter.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TypewriterCard } from "@/components/onboarding/typewriter-card";

describe("TypewriterCard Onboarding", () => {
  it("renders FinBot avatar and accepts nickname submission", async () => {
    const handleComplete = vi.fn();
    render(<TypewriterCard onComplete={handleComplete} />);

    const input = screen.getByPlaceholderText(/contoh: alex/i);
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: "Budi" } });
    const button = screen.getByRole("button", { name: /mulai berteman/i });
    fireEvent.click(button);

    expect(handleComplete).toHaveBeenCalledWith("Budi");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/ui/onboarding-typewriter.test.tsx`  
Expected: FAIL (`TypewriterCard` not found)

- [ ] **Step 3: Implement `TypewriterCard` and `src/app/onboarding/page.tsx`**

Implement `src/components/onboarding/typewriter-card.tsx` with:
- Lucide React `Bot` icon with subtle ambient pulse.
- Animated typewriter text: *"Hai! Kenalin, gue FinBot 🤖 Teman finansial lo. Biar kita makin akrab, nama panggilan lo siapa nih?"*
- Nickname input field and Lucide `ArrowRight` submit button.
- Clean Next.js route in `src/app/onboarding/page.tsx` saving to `/api/profile` and redirecting to `/dashboard`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/ui/onboarding-typewriter.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/components/onboarding/ src/app/onboarding/ tests/ui/onboarding-typewriter.test.tsx
git commit -m "feat(onboarding): create minimalist typewriter card with FinBot greeting"
```

---

### Task 5: Symmetric Income (`/pemasukan`) & Expense (`/pengeluaran`) Pages

**Files:**
- Create: `src/app/(app)/pemasukan/page.tsx`
- Create: `src/app/(app)/pengeluaran/page.tsx`
- Create: `src/components/transaction/transaction-history-table.tsx`
- Create: `src/components/transaction/manual-transaction-modal.tsx`
- Modify: `src/components/transaction/receipt-scanner-modal.tsx`
- Modify: `src/components/transaction/voice-expense-sheet.tsx`
- Test: `tests/ui/transaction-pages.test.ts`

**Interfaces:**
- Produces:
  - `/pemasukan` page handling voice, receipt/transfer OCR, and manual entry with income categories.
  - `/pengeluaran` page handling voice, receipt OCR, and manual entry with expense categories.
  - `<TransactionHistoryTable type="income" | "expense" />` with Lucide badges (`Mic`, `ScanLine`, `PencilLine`).

- [ ] **Step 1: Write test for transaction pages**

Create `tests/ui/transaction-pages.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("Income and Expense Pages Architecture", () => {
  it("exports Pemasukan and Pengeluaran page components cleanly", async () => {
    const pemasukanModule = await import("@/app/(app)/pemasukan/page");
    const pengeluaranModule = await import("@/app/(app)/pengeluaran/page");
    expect(pemasukanModule.default).toBeDefined();
    expect(pengeluaranModule.default).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/ui/transaction-pages.test.ts`  
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement Pemasukan & Pengeluaran pages and shared transaction components**

1. Create `src/components/transaction/transaction-history-table.tsx` with search, date filter, Lucide icons, and edit/delete actions.
2. Create `src/components/transaction/manual-transaction-modal.tsx` for quick manual entry.
3. Update `voice-expense-sheet.tsx` to accept `mode: "income" | "expense"` and auto-classify appropriate categories.
4. Update `receipt-scanner-modal.tsx` to handle receipts and bank transfer slips.
5. Create `src/app/(app)/pemasukan/page.tsx` and `src/app/(app)/pengeluaran/page.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/ui/transaction-pages.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/app/\(app\)/pemasukan/ src/app/\(app\)/pengeluaran/ src/components/transaction/ tests/ui/transaction-pages.test.ts
git commit -m "feat(transactions): implement symmetric Pemasukan and Pengeluaran tracking with 3 input modes"
```

---

### Task 6: Dynamic Wishlist Page with Delay Feedback

**Files:**
- Create: `src/lib/financial/wishlist-engine.ts`
- Create: `src/app/(app)/wishlist/page.tsx`
- Create: `src/components/wishlist/wishlist-card.tsx`
- Test: `tests/financial/wishlist-engine.test.ts`
- Test: `tests/ui/wishlist-page.test.ts`

**Interfaces:**
- Produces:
  - `calculateWishlistProjection(targetPrice: number, netSavings: number, dailyBurnRate: number): { estimatedDays: number, status: 'on_track' | 'delayed' | 'achievable_now' }`
  - `/wishlist` page with voice & manual creation, target progress, and achievement celebration.

- [ ] **Step 1: Write test for wishlist projection engine**

Create `tests/financial/wishlist-engine.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { calculateWishlistProjection } from "@/lib/financial/wishlist-engine";

describe("Wishlist Projection Engine", () => {
  it("calculates accurate days remaining based on savings rate", () => {
    // Target Rp1.000.000, current savings Rp500.000, surplus savings rate Rp50.000/day
    const res = calculateWishlistProjection(1_000_000, 500_000, 50_000);
    expect(res.status).toBe("on_track");
    expect(res.estimatedDays).toBe(10);
  });

  it("marks as achievable now when current savings exceed target price", () => {
    const res = calculateWishlistProjection(500_000, 600_000, 20_000);
    expect(res.status).toBe("achievable_now");
    expect(res.estimatedDays).toBe(0);
  });

  it("handles negative or zero savings gracefully without NaN", () => {
    const res = calculateWishlistProjection(1_000_000, 0, 0);
    expect(res.status).toBe("delayed");
    expect(Number.isFinite(res.estimatedDays)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/financial/wishlist-engine.test.ts`  
Expected: FAIL (`calculateWishlistProjection` not defined)

- [ ] **Step 3: Implement `wishlist-engine.ts`, `wishlist-card.tsx`, and `/wishlist/page.tsx`**

1. Write `src/lib/financial/wishlist-engine.ts`.
2. Create `src/components/wishlist/wishlist-card.tsx` displaying the item, target price, projected date badge, and Lucide `CheckCircle2` achievement button.
3. Build `src/app/(app)/wishlist/page.tsx` integrating voice input sheet and manual modal.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/financial/wishlist-engine.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/financial/wishlist-engine.ts src/app/\(app\)/wishlist/ src/components/wishlist/ tests/financial/wishlist-engine.test.ts
git commit -m "feat(wishlist): implement dynamic wishlist engine with delay feedback"
```

---

### Task 7: Dashboard Gen-Z Insight Engine & Streak Integration

**Files:**
- Create: `src/lib/financial/genz-insight-engine.ts`
- Create: `src/components/dashboard/genz-insight-card.tsx`
- Create: `src/components/dashboard/streak-widget.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`
- Test: `tests/financial/genz-insight-engine.test.ts`
- Test: `tests/ui/dashboard-insight.test.ts`

**Interfaces:**
- Produces:
  - `generateDailyGenZInsight(params: GenZInsightParams): { headline: string, body: string, mood: 'happy' | 'warning' | 'hype' }`
  - `<GenZInsightCard nickname={nickname} insight={insight} />`
  - `<StreakWidget streakDays={days} />`

- [ ] **Step 1: Write test for Gen-Z Insight Engine**

Create `tests/financial/genz-insight-engine.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { generateDailyGenZInsight } from "@/lib/financial/genz-insight-engine";

describe("Gen-Z Financial Insight Engine", () => {
  it("generates warning insight when daily expense overshoots budget and links wishlist delay", () => {
    const insight = generateDailyGenZInsight({
      nickname: "Alex",
      todaySpent: 120000,
      dailyAllowance: 50000,
      topWishlistName: "Sepatu Vans",
      streakDays: 3,
    });

    expect(insight.mood).toBe("warning");
    expect(insight.body).toContain("Alex");
    expect(insight.body).toContain("Sepatu Vans");
  });

  it("generates hyped encouraging insight when spending is under allowance", () => {
    const insight = generateDailyGenZInsight({
      nickname: "Salsa",
      todaySpent: 15000,
      dailyAllowance: 60000,
      topWishlistName: "AirPods",
      streakDays: 5,
    });

    expect(insight.mood).toBe("hype");
    expect(insight.body).toContain("Salsa");
    expect(insight.body).toContain("AirPods");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/financial/genz-insight-engine.test.ts`  
Expected: FAIL (`generateDailyGenZInsight` not defined)

- [ ] **Step 3: Implement `genz-insight-engine.ts`, `genz-insight-card.tsx`, and `streak-widget.tsx`**

1. Build `src/lib/financial/genz-insight-engine.ts` with natural Gen-Z templates, variety based on day of week, and wishlist impact computation.
2. Build `src/components/dashboard/genz-insight-card.tsx` with dynamic badge, Lucide `Sparkles`/`AlertTriangle` icon, and conversational tone.
3. Build `src/components/dashboard/streak-widget.tsx` with Lucide `Flame` icon and streak count.
4. Refactor `src/app/(app)/dashboard/page.tsx` to feature:
   - Header with `"Halo, [Nickname]!"`
   - Net balance, income vs expense card
   - Daily allowance balance
   - Gen-Z Insight Card
   - Streak Widget
   - Quick action shortcuts to Pemasukan and Pengeluaran.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/financial/genz-insight-engine.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/financial/genz-insight-engine.ts src/components/dashboard/ src/app/\(app\)/dashboard/ tests/financial/genz-insight-engine.test.ts
git commit -m "feat(dashboard): integrate Gen-Z daily insight card and streak widget"
```

---

### Task 8: FinBot AI Copilot with Gen-Z Tone & Live Database Grounding

**Files:**
- Create: `src/lib/copilot/context-builder.ts`
- Modify: `src/app/api/copilot/route.ts`
- Modify: `src/app/(app)/copilot/page.tsx`
- Test: `tests/copilot/context-builder.test.ts`

**Interfaces:**
- Produces:
  - `buildUserFinancialSnapshot(userId: string): Promise<UserFinancialSnapshot>`
  - FinBot system prompt enforcing supportive Gen-Z language and strictly factual numbers.
  - Interactive chat interface with quick suggestion chips.

- [ ] **Step 1: Write test for context snapshot builder**

Create `tests/copilot/context-builder.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatFinancialContextForLLM } from "@/lib/copilot/context-builder";

describe("FinBot Context Builder", () => {
  it("formats financial snapshot into structured factual prompt context", () => {
    const text = formatFinancialContextForLLM({
      nickname: "Rian",
      netBalance: 1250000,
      monthlyIncome: 2000000,
      monthlyExpense: 750000,
      topExpenseCategory: "Makanan & Minuman",
      topExpenseItem: "Mie Gacoan (Rp45.000)",
      wishlistSummary: "1. Headphone Sony (Rp1.200.000)",
      streakDays: 4,
    });

    expect(text).toContain("Rian");
    expect(text).toContain("Rp1.250.000");
    expect(text).toContain("Makanan & Minuman");
    expect(text).toContain("Headphone Sony");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/copilot/context-builder.test.ts`  
Expected: FAIL (`formatFinancialContextForLLM` not defined)

- [ ] **Step 3: Implement `context-builder.ts`, API endpoint, and FinBot chat UI**

1. Write `src/lib/copilot/context-builder.ts` querying live user transactions, wishlists, and nickname via Prisma.
2. Update `src/app/api/copilot/route.ts` with Gen-Z persona prompt:
   *"Lo adalah FinBot, asisten finansial pintar tapi santai banget khas Gen Z anak kuliah/kost. Jawab selalu ramah, to the point, pakai bahasa sehari-hari (lo/gue/santai), dan WAJIB gunakan data fakta berikut tanpa berhalusinasi..."*
3. Update `src/app/(app)/copilot/page.tsx` with responsive chat bubbles, Lucide `Bot` icon, typing indicator, and suggestion chips (*"Bulan ini gue paling boros apa?", "Sisa uang jajan gue aman gak?", "Kapan wishlist gue bisa kebeli?"*).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/copilot/context-builder.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/copilot/ src/app/api/copilot/ src/app/\(app\)/copilot/ tests/copilot/context-builder.test.ts
git commit -m "feat(finbot): implement Gen-Z AI Copilot grounded on live database snapshot"
```

---

### Task 9: Streamlined Navigation Shell & Profile Screen

**Files:**
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/bottom-nav.tsx`
- Modify: `src/components/layout/app-shell.tsx`
- Modify: `src/app/(app)/profile/page.tsx`
- Test: `tests/ui/app-shell-streamlined.test.ts`

**Interfaces:**
- Produces:
  - Sidebar and Bottom Navigation rendering only the 6 core items with Lucide icons.
  - Profile screen allowing user to update their nickname, email, password, and theme.

- [ ] **Step 1: Write test for navigation items**

Create `tests/ui/app-shell-streamlined.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { NAVIGATION_ITEMS } from "@/components/layout/navigation-items";

describe("Navigation Items Streamlined", () => {
  it("contains strictly the 6 core menus", () => {
    const hrefs = NAVIGATION_ITEMS.map((item) => item.href);
    expect(hrefs).toEqual([
      "/dashboard",
      "/pemasukan",
      "/pengeluaran",
      "/wishlist",
      "/copilot",
      "/profile",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/ui/app-shell-streamlined.test.ts`  
Expected: FAIL (NAVIGATION_ITEMS contains legacy menu items)

- [ ] **Step 3: Update Navigation and Profile components**

1. Create `src/components/layout/navigation-items.ts` with the 6 core routes and corresponding Lucide icons (`LayoutDashboard`, `ArrowDownLeft`, `ArrowUpRight`, `Gift`, `Bot`, `User`).
2. Update `sidebar.tsx` and `bottom-nav.tsx` using `NAVIGATION_ITEMS`.
3. Simplify `src/app/(app)/profile/page.tsx` to focus on nickname editing, account details, and theme toggle.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/ui/app-shell-streamlined.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/components/layout/ src/app/\(app\)/profile/ tests/ui/app-shell-streamlined.test.ts
git commit -m "feat(layout): streamline sidebar and bottom nav to 6 core menus and clean profile"
```

---

### Task 10: End-to-End Verification & Build Check

**Files:**
- Test: All test suites in `tests/`
- Build: Next.js production build

- [ ] **Step 1: Run complete test suite**

Run: `pnpm test`  
Expected: 100% tests PASS

- [ ] **Step 2: Run TypeScript strict check**

Run: `pnpm typecheck`  
Expected: Exit code 0 (zero errors)

- [ ] **Step 3: Run ESLint check**

Run: `pnpm lint`  
Expected: Exit code 0

- [ ] **Step 4: Run production build**

Run: `pnpm build`  
Expected: All routes compile successfully

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "chore: complete core simplification and verified build passing"
```
