# FINRA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform VoiCash into FINRA, an AI Financial Digital Twin & Planner with hybrid voice input, hybrid receipt OCR, deterministic 50/30/20 Digital Twin modeling, interactive What-If simulation, goal tracking, and AI Copilot.

**Architecture:** Full-stack Next.js 15 App Router monolith with TypeScript, Tailwind CSS, Prisma PostgreSQL, client-side Web Workers for offline Voice (Whisper) & OCR (Tesseract), deterministic backend Financial Calculation Engine, and OpenAI-compatible LLM for Copilot & Insights.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS, Prisma 6 (PostgreSQL), Recharts, @xenova/transformers (Whisper), PaddleOCR (Python subprocess) & Tesseract.js, OpenAI-compatible REST API.

**Spec:** `docs/superpowers/specs/2026-10-02-finra-architecture-design.md`

## Global Constraints

- No em-dash characters anywhere in code, markdown, or user strings.
- Backend owns all financial calculations; LLM is never used as a mathematical calculator.
- Voice Speech-to-Text runs purely client-side without external LLM calls or API token costs.
- OCR Scan Struk must support Hybrid execution: PaddleOCR + LLM when online, Tesseract.js Web Worker + Regex parser when offline.
- Every transaction extracted from Voice or OCR must pass through the Unified Confirmation Modal before persisting to database.
- Database IDs for transactions use client-generated UUIDs to support offline IndexedDB and local-first PWA synchronization.

## Review Focus

1. Division by zero in financial engine: when monthly income is 0 or no transactions exist, savings rate must gracefully return 0% without NaN or crashes.
2. Negative savings in What-If Simulator: when expenses exceed income, simulator must display negative deficit and flag goal completion as infinite/impossible.
3. Offline OCR image failure: when image is blurry or unsupported, local parser must report structured error with confidence 0 instead of throwing an unhandled exception.
4. Voice transcript with multiple items: sentences like "beli kopi sepuluh ribu dan nasi padang lima belas ribu" must split into distinct item candidates in confirmation modal.
5. Large image upload size: receipt uploads over 10 MB must be rejected with a user-friendly error before spawning the OCR subprocess.

---

### Task 1: Domain Types & Prisma Schema Migration

**Files:**
- Create: `src/types/financial-types.ts`
- Modify: `prisma/schema.prisma`
- Test: `tests/types/financial-types.test.ts`

**Interfaces:**
- Consumes: Prisma Client, existing `User` model
- Produces: `FinancialProfile`, `TransactionCandidate`, `FinancialGoal`, `DigitalTwinMetrics`, `SimulationResult`, `AiInsightCard`

- [ ] **Step 1: Write failing test for financial domain types**

Create `tests/types/financial-types.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  SPENDING_CATEGORIES,
  DEFAULT_50_30_20_TARGETS,
  validateTransactionCandidate,
} from "@/types/financial-types";

describe("Financial Domain Types & Validation", () => {
  it("defines standard spending categories and 50/30/20 targets", () => {
    expect(SPENDING_CATEGORIES).toContain("Food");
    expect(SPENDING_CATEGORIES).toContain("Transportation");
    expect(SPENDING_CATEGORIES).toContain("Housing");
    expect(DEFAULT_50_30_20_TARGETS.needsRatio).toBe(0.5);
    expect(DEFAULT_50_30_20_TARGETS.wantsRatio).toBe(0.3);
    expect(DEFAULT_50_30_20_TARGETS.savingsRatio).toBe(0.2);
  });

  it("validates transaction candidate data", () => {
    const valid = validateTransactionCandidate({
      merchant: "Mie Gacoan",
      amount: 38000,
      category: "Food",
      spendingType: "needs",
      date: "2026-10-02",
      source: "ocr",
    });
    expect(valid.isValid).toBe(true);

    const invalid = validateTransactionCandidate({
      merchant: "",
      amount: -5000,
      category: "Unknown",
      spendingType: "needs",
      date: "invalid-date",
      source: "manual",
    });
    expect(invalid.isValid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/types/financial-types.test.ts`  
Expected: FAIL (module `@/types/financial-types` not found)

- [ ] **Step 3: Implement domain types & update Prisma schema**

Create `src/types/financial-types.ts`:
```typescript
export type TransactionType = "income" | "expense";
export type SpendingType = "needs" | "wants" | "savings";
export type TransactionSource = "manual" | "ocr" | "voice";
export type GoalStatus = "on_track" | "at_risk" | "behind_target" | "achieved";

export const SPENDING_CATEGORIES = [
  "Food",
  "Groceries",
  "Transportation",
  "Housing",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Shopping",
  "Subscription",
  "Family",
  "Other",
] as const;

export type SpendingCategory = (typeof SPENDING_CATEGORIES)[number];

export const DEFAULT_50_30_20_TARGETS = {
  needsRatio: 0.5,
  wantsRatio: 0.3,
  savingsRatio: 0.2,
};

export interface TransactionCandidate {
  id?: string;
  merchant?: string;
  amount: number;
  category: SpendingCategory | string;
  spendingType: SpendingType;
  date: string;
  source: TransactionSource;
  confidence?: number;
  items?: Array<{ name: string; amount: number }>;
  paymentMethod?: string;
  description?: string;
}

export function validateTransactionCandidate(c: Partial<TransactionCandidate>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!c.amount || typeof c.amount !== "number" || c.amount <= 0) {
    errors.push("Nominal harus berupa angka lebih besar dari 0.");
  }
  if (!c.category) {
    errors.push("Kategori wajib ditentukan.");
  }
  if (!c.spendingType || !["needs", "wants", "savings"].includes(c.spendingType)) {
    errors.push("Tipe alokasi belanja harus needs, wants, atau savings.");
  }
  if (!c.date || isNaN(Date.parse(c.date))) {
    errors.push("Tanggal transaksi tidak valid.");
  }
  return { isValid: errors.length === 0, errors };
}
```

Update `prisma/schema.prisma` with all models (`FinancialProfile`, `Transaction`, `FinancialGoal`, `RecurringExpense`, `AiInsight`, `Simulation`) matching the spec.

Generate Prisma Client:
`npx prisma generate`

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/types/financial-types.test.ts`  
Expected: PASS (2 tests pass)

- [ ] **Step 5: Commit changes**

```bash
git add prisma/schema.prisma src/types/financial-types.ts tests/types/financial-types.test.ts
git commit -m "feat(domain): add FINRA prisma schema and financial domain types"
```

---

### Task 2: Deterministic Financial Calculation Engine

**Files:**
- Create: `src/lib/financial/financial-engine.ts`
- Test: `tests/financial/financial-engine.test.ts`

**Interfaces:**
- Consumes: `TransactionCandidate`, `SpendingType`
- Produces: `calculateCashflowSummary`, `calculateDigitalTwinSplit`, `calculateGoalProjection`, `simulateWhatIfScenario`

- [ ] **Step 1: Write failing test for financial calculation engine**

Create `tests/financial/financial-engine.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  calculateCashflowSummary,
  calculateDigitalTwinSplit,
  calculateGoalProjection,
  simulateWhatIfScenario,
} from "@/lib/financial/financial-engine";

describe("Financial Calculation Engine", () => {
  it("calculates cashflow and savings rate correctly", () => {
    const summary = calculateCashflowSummary({
      income: 3000000,
      expenses: 2150000,
    });
    expect(summary.netSavings).toBe(850000);
    expect(summary.savingsRate).toBeCloseTo(28.33, 1);
  });

  it("handles zero income without division by zero crash", () => {
    const summary = calculateCashflowSummary({ income: 0, expenses: 500000 });
    expect(summary.netSavings).toBe(-500000);
    expect(summary.savingsRate).toBe(0);
  });

  it("calculates 50/30/20 Digital Twin split", () => {
    const split = calculateDigitalTwinSplit({
      income: 3000000,
      needs: 1500000,
      wants: 650000,
      netSavings: 850000,
    });
    expect(split.needsPercentage).toBe(50);
    expect(split.wantsPercentage).toBeCloseTo(21.67, 1);
    expect(split.savingsPercentage).toBeCloseTo(28.33, 1);
    expect(split.needsStatus).toBe("optimal");
  });

  it("calculates goal projection accurately", () => {
    const projection = calculateGoalProjection({
      targetAmount: 12000000,
      currentAmount: 2500000,
      monthlySaving: 850000,
      targetMonths: 24,
    });
    expect(projection.remainingAmount).toBe(9500000);
    expect(projection.requiredMonthlySaving).toBeCloseTo(395833, 0);
    expect(projection.status).toBe("on_track");
    expect(projection.estimatedMonthsToAchieve).toBe(12);
  });

  it("simulates what-if scenario adjusting budget", () => {
    const result = simulateWhatIfScenario({
      currentMonthlyIncome: 3000000,
      currentMonthlyExpense: 2150000,
      expenseCuts: 200000, // potong jajan 200rb
      incomeAddition: 0,
      remainingGoalAmount: 9500000,
    });
    expect(result.simulatedNetSavings).toBe(1050000);
    expect(result.deltaMonthlySavings).toBe(200000);
    expect(result.simulatedMonthsToGoal).toBe(10); // 9.5M / 1.05M = 9.04 -> 10 bulan
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/financial/financial-engine.test.ts`  
Expected: FAIL (module `@/lib/financial/financial-engine` not found)

- [ ] **Step 3: Implement calculation functions**

Create `src/lib/financial/financial-engine.ts`:
```typescript
export interface CashflowSummary {
  income: number;
  expenses: number;
  netSavings: number;
  savingsRate: number;
}

export function calculateCashflowSummary(params: {
  income: number;
  expenses: number;
}): CashflowSummary {
  const netSavings = params.income - params.expenses;
  const savingsRate =
    params.income > 0 ? (netSavings / params.income) * 100 : 0;
  return {
    income: params.income,
    expenses: params.expenses,
    netSavings,
    savingsRate: Math.max(-100, Math.min(100, savingsRate)),
  };
}

export interface DigitalTwinSplit {
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  needsStatus: "optimal" | "warning" | "danger";
  wantsStatus: "optimal" | "warning" | "danger";
}

export function calculateDigitalTwinSplit(params: {
  income: number;
  needs: number;
  wants: number;
  netSavings: number;
}): DigitalTwinSplit {
  const total = params.income > 0 ? params.income : params.needs + params.wants;
  const safeTotal = total > 0 ? total : 1;

  const needsPercentage = (params.needs / safeTotal) * 100;
  const wantsPercentage = (params.wants / safeTotal) * 100;
  const savingsPercentage = (params.netSavings / safeTotal) * 100;

  return {
    needsAmount: params.needs,
    wantsAmount: params.wants,
    savingsAmount: params.netSavings,
    needsPercentage,
    wantsPercentage,
    savingsPercentage,
    needsStatus: needsPercentage <= 50 ? "optimal" : needsPercentage <= 65 ? "warning" : "danger",
    wantsStatus: wantsPercentage <= 30 ? "optimal" : wantsPercentage <= 45 ? "warning" : "danger",
  };
}

export interface GoalProjectionResult {
  remainingAmount: number;
  requiredMonthlySaving: number;
  estimatedMonthsToAchieve: number;
  status: "on_track" | "at_risk" | "behind_target" | "achieved";
}

export function calculateGoalProjection(params: {
  targetAmount: number;
  currentAmount: number;
  monthlySaving: number;
  targetMonths: number;
}): GoalProjectionResult {
  const remainingAmount = Math.max(0, params.targetAmount - params.currentAmount);
  if (remainingAmount === 0) {
    return {
      remainingAmount: 0,
      requiredMonthlySaving: 0,
      estimatedMonthsToAchieve: 0,
      status: "achieved",
    };
  }

  const safeMonths = Math.max(1, params.targetMonths);
  const requiredMonthlySaving = remainingAmount / safeMonths;

  if (params.monthlySaving <= 0) {
    return {
      remainingAmount,
      requiredMonthlySaving,
      estimatedMonthsToAchieve: Infinity,
      status: "behind_target",
    };
  }

  const estimatedMonthsToAchieve = Math.ceil(remainingAmount / params.monthlySaving);
  const ratio = params.monthlySaving / requiredMonthlySaving;

  let status: GoalProjectionResult["status"] = "behind_target";
  if (ratio >= 1.0) {
    status = "on_track";
  } else if (ratio >= 0.6) {
    status = "at_risk";
  }

  return {
    remainingAmount,
    requiredMonthlySaving,
    estimatedMonthsToAchieve,
    status,
  };
}

export interface WhatIfSimulationResult {
  simulatedNetSavings: number;
  deltaMonthlySavings: number;
  simulatedMonthsToGoal: number;
}

export function simulateWhatIfScenario(params: {
  currentMonthlyIncome: number;
  currentMonthlyExpense: number;
  expenseCuts: number;
  incomeAddition: number;
  remainingGoalAmount: number;
}): WhatIfSimulationResult {
  const newIncome = params.currentMonthlyIncome + params.incomeAddition;
  const newExpense = Math.max(0, params.currentMonthlyExpense - params.expenseCuts);
  const simulatedNetSavings = newIncome - newExpense;
  const currentNetSavings = params.currentMonthlyIncome - params.currentMonthlyExpense;
  const deltaMonthlySavings = simulatedNetSavings - currentNetSavings;

  const simulatedMonthsToGoal =
    simulatedNetSavings > 0
      ? Math.ceil(params.remainingGoalAmount / simulatedNetSavings)
      : Infinity;

  return {
    simulatedNetSavings,
    deltaMonthlySavings,
    simulatedMonthsToGoal,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/financial/financial-engine.test.ts`  
Expected: PASS (5 tests pass)

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/financial/financial-engine.ts tests/financial/financial-engine.test.ts
git commit -m "feat(financial): implement deterministic financial calculation engine"
```

---

### Task 3: Financial Onboarding & User Profile API

**Files:**
- Create: `src/app/onboarding/page.tsx`
- Create: `src/app/api/profile/route.ts`
- Test: `tests/api/profile-api.test.ts`

**Interfaces:**
- Consumes: Next.js Request, Prisma `FinancialProfile`
- Produces: `POST /api/profile`, `GET /api/profile`

- [ ] **Step 1: Write failing test for profile API endpoint**

Create `tests/api/profile-api.test.ts`:
```typescript
import { describe, it, expect, vi } from "vitest";

describe("Financial Profile API Validation", () => {
  it("validates required onboarding fields", async () => {
    const { validateOnboardingProfile } = await import("@/app/api/profile/validator");
    const valid = validateOnboardingProfile({
      monthlyIncome: 3000000,
      incomeType: "salary",
      currentSavings: 2500000,
      monthlyFixedExpenses: 1200000,
      financialPriority: "saving",
    });
    expect(valid.success).toBe(true);

    const invalid = validateOnboardingProfile({
      monthlyIncome: -100,
      incomeType: "",
    });
    expect(valid.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api/profile-api.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement validator, API route, and Onboarding Wizard UI**

Create `src/app/api/profile/validator.ts`:
```typescript
export function validateOnboardingProfile(data: any): { success: boolean; errors?: string[] } {
  const errors: string[] = [];
  if (typeof data.monthlyIncome !== "number" || data.monthlyIncome <= 0) {
    errors.push("Penghasilan bulanan harus lebih besar dari 0.");
  }
  if (!data.incomeType) {
    errors.push("Tipe penghasilan wajib dipilih.");
  }
  if (typeof data.currentSavings !== "number" || data.currentSavings < 0) {
    errors.push("Tabungan saat ini tidak valid.");
  }
  if (typeof data.monthlyFixedExpenses !== "number" || data.monthlyFixedExpenses < 0) {
    errors.push("Pengeluaran wajib tidak valid.");
  }
  return { success: errors.length === 0, errors };
}
```

Implement `src/app/api/profile/route.ts` and `src/app/onboarding/page.tsx` with a multi-step card wizard (Step 1: Income & Source, Step 2: Tabungan & Pengeluaran Wajib, Step 3: Prioritas Finansial).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api/profile-api.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/app/api/profile/ src/app/onboarding/ tests/api/profile-api.test.ts
git commit -m "feat(onboarding): implement financial profile onboarding and API"
```

---

### Task 4: Hybrid Receipt OCR Scanner & Local Receipt Parser

**Files:**
- Create: `scripts/paddle_ocr.py`
- Create: `src/lib/ocr/receipt-parser.ts`
- Create: `src/app/api/transactions/ocr/route.ts`
- Create: `src/workers/ocr.worker.ts`
- Test: `tests/ocr/receipt-parser.test.ts`

**Interfaces:**
- Consumes: Receipt Image (File/Blob)
- Produces: `POST /api/transactions/ocr` -> `TransactionCandidate`

- [ ] **Step 1: Write failing test for local receipt regex parser**

Create `tests/ocr/receipt-parser.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { parseReceiptText } from "@/lib/ocr/receipt-parser";

describe("Local Receipt Parser (Regex & Pattern Matcher)", () => {
  it("extracts merchant, total, date, and items from Indonesian receipt text", () => {
    const sampleOcrText = `
      MIE GACOAN TEBET
      JL. TEBET RAYA NO. 12
      02/10/2026 14:30
      ------------------------------
      MIE HOMPIMPA LV 1     18.000
      ES TEH MANIS           5.000
      ------------------------------
      SUBTOTAL              23.000
      PAJAK PB1 10%          2.300
      TOTAL                 25.300
      TUNAI                 50.000
      KEMBALI               24.700
    `;

    const candidate = parseReceiptText(sampleOcrText);
    expect(candidate.merchant).toBe("MIE GACOAN TEBET");
    expect(candidate.amount).toBe(25300);
    expect(candidate.date).toBe("2026-10-02");
    expect(candidate.category).toBe("Food");
    expect(candidate.spendingType).toBe("wants");
  });

  it("handles messy receipt text gracefully without throwing", () => {
    const candidate = parseReceiptText("TIDAK JELAS STRUK SOBEK");
    expect(candidate.amount).toBe(0);
    expect(candidate.merchant).toBe("Struk Belanja");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ocr/receipt-parser.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement local receipt parser, Python paddle_ocr.py, and OCR API route**

Create `src/lib/ocr/receipt-parser.ts`:
Parse lines looking for `TOTAL`, `JUMLAH`, `TAGIHAN`, `Rp`, Date regex, and header merchant lines. Map food keywords to `Food`, supermarket/mart to `Groceries`, and determine `spendingType` ("needs" for groceries/medical/bills, "wants" for resto/entertainment).

Create `scripts/paddle_ocr.py`:
Small Python script using `paddleocr` (if installed) or structured JSON mock output, accepting image path as argv[1] and emitting text lines to stdout.

Create `src/app/api/transactions/ocr/route.ts`:
Accepts `formData`, saves temp file, spawns `python scripts/paddle_ocr.py`, receives raw lines, sends to OpenAI-compatible provider with structured JSON prompt, falls back to `parseReceiptText` if LLM fails or is unavailable.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ocr/receipt-parser.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/ocr/receipt-parser.ts scripts/paddle_ocr.py src/app/api/transactions/ocr/ tests/ocr/receipt-parser.test.ts
git commit -m "feat(ocr): implement hybrid receipt ocr with local parser and paddleocr bridge"
```

---

### Task 5: Unified Transaction Capture & Confirmation Modal

**Files:**
- Create: `src/components/transaction/unified-confirmation-modal.tsx`
- Create: `src/components/transaction/receipt-scanner-modal.tsx`
- Modify: `src/components/expense/voice-expense-sheet.tsx`
- Test: `tests/ui/unified-confirmation.test.ts`

**Interfaces:**
- Consumes: `TransactionCandidate` from Voice, OCR, or Manual
- Produces: Saved `Transaction` in IndexedDB + PostgreSQL

- [ ] **Step 1: Write failing test for Unified Confirmation Modal component**

Create `tests/ui/unified-confirmation.test.ts`:
```typescript
import { describe, it, expect } from "vitest";

describe("Unified Confirmation Modal Exports", () => {
  it("exports UnifiedConfirmationModal component", async () => {
    const mod = await import("@/components/transaction/unified-confirmation-modal");
    expect(mod.UnifiedConfirmationModal).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ui/unified-confirmation.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement Unified Confirmation Modal & Receipt Scanner Modal**

Build `UnifiedConfirmationModal`:
- Renders Merchant, Nominal (Rp), Date, Category, and Segmented Control for **Kebutuhan (Needs 50%)** vs **Keinginan (Wants 30%)**.
- Shows item breakdown list if available.
- Edit button opens inline form to change values.
- Confirm button writes to IndexedDB and triggers background sync.

Build `ReceiptScannerModal`:
- Camera viewfinder with video element + capture button.
- File upload drag-and-drop fallback.
- Online mode calls `/api/transactions/ocr`, offline mode runs `ocr.worker.ts`.
- Automatically opens `UnifiedConfirmationModal` on extraction complete.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ui/unified-confirmation.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/components/transaction/ tests/ui/unified-confirmation.test.ts
git commit -m "feat(ui): implement unified confirmation modal and receipt scanner modal"
```

---

### Task 6: Financial Digital Twin Dashboard & Recharts

**Files:**
- Create: `src/components/dashboard/digital-twin-card.tsx`
- Create: `src/components/dashboard/spending-trend-chart.tsx`
- Create: `src/components/dashboard/category-donut-chart.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Test: `tests/ui/digital-twin-dashboard.test.ts`

**Interfaces:**
- Consumes: `CashflowSummary`, `DigitalTwinSplit`, `Transaction[]`
- Produces: Interactive Financial Digital Twin UI on `/dashboard`

- [ ] **Step 1: Write failing test for Digital Twin dashboard components**

Create `tests/ui/digital-twin-dashboard.test.ts`:
```typescript
import { describe, it, expect } from "vitest";

describe("Digital Twin Dashboard Components", () => {
  it("exports DigitalTwinCard component", async () => {
    const mod = await import("@/components/dashboard/digital-twin-card");
    expect(mod.DigitalTwinCard).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ui/digital-twin-dashboard.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement Digital Twin Card & Recharts visualizers**

Build `DigitalTwinCard`:
- Shows 3 progress tracks: Needs (Target 50%), Wants (Target 30%), Savings (Target 20%).
- Displays current state vs ideal benchmarks with status badges (Optimal, Perlu Perhatian, Berisiko).
- Integrates Recharts `BarChart` for monthly spending trends and `PieChart` for category distribution.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ui/digital-twin-dashboard.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/components/dashboard/ tests/ui/digital-twin-dashboard.test.ts src/app/dashboard/
git commit -m "feat(dashboard): implement financial digital twin card and recharts visualizations"
```

---

### Task 7: Interactive What-If & Scenario Simulator

**Files:**
- Create: `src/app/simulator/page.tsx`
- Create: `src/components/simulator/scenario-slider.tsx`
- Create: `src/components/simulator/simulation-result-card.tsx`
- Test: `tests/ui/what-if-simulator.test.ts`

**Interfaces:**
- Consumes: `simulateWhatIfScenario` from `financial-engine.ts`
- Produces: `/simulator` page with 4 instant scenario templates

- [ ] **Step 1: Write failing test for simulator page**

Create `tests/ui/what-if-simulator.test.ts`:
```typescript
import { describe, it, expect } from "vitest";

describe("What-If Simulator Page", () => {
  it("exports Simulator page component", async () => {
    const mod = await import("@/app/simulator/page");
    expect(mod.default).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ui/what-if-simulator.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement What-If Simulator with live reactive sliders**

Build `src/app/simulator/page.tsx`:
- Sliders for Food budget, Wants budget, Income delta, and new fixed expense.
- 4 Quick scenario buttons (Pola Saat Ini, Pangkas Jajan 25%, Income Turun 20%, Tambahan Kos 500rb).
- Real-time calculation showing: Delta Monthly Saving (+Rp200.000), Target Completion Date shift (3 bulan lebih cepat), and visual 50/30/20 Digital Twin shift.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/ui/what-if-simulator.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/app/simulator/ src/components/simulator/ tests/ui/what-if-simulator.test.ts
git commit -m "feat(simulator): implement interactive what-if simulator with live sliders and scenarios"
```

---

### Task 8: Financial Goals Management & AI Insights Generator

**Files:**
- Create: `src/app/goals/page.tsx`
- Create: `src/app/insights/page.tsx`
- Create: `src/lib/insights/pattern-detector.ts`
- Test: `tests/financial/goals-insights.test.ts`

**Interfaces:**
- Consumes: `FinancialGoal[]`, `Transaction[]`
- Produces: Goal status indicators and structured AI Insight cards

- [ ] **Step 1: Write failing test for pattern detector and goals**

Create `tests/financial/goals-insights.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { detectSpendingPatterns } from "@/lib/insights/pattern-detector";

describe("Spending Pattern Detector", () => {
  it("detects spending increase greater than 20%", () => {
    const insights = detectSpendingPatterns({
      currentCategoryTotals: { Food: 920000 },
      previousCategoryTotals: { Food: 720000 },
    });
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0].type).toBe("spending_increase");
    expect(insights[0].evidence.changePercent).toBeCloseTo(27.78, 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/financial/goals-insights.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement pattern detector, Goals page, and Insights page**

Build `pattern-detector.ts`:
- Detects category jump > 20%.
- Detects recurring subscriptions (Netflix, Spotify, Kos).
- Generates structured cards: Title, Evidence, Impact, Suggested Action.

Build `src/app/goals/page.tsx`:
- List of financial goals with progress bars and badges (`On Track`, `At Risk`, `Behind Target`).
- Goal creation form with target amount, current savings, and target date.

Build `src/app/insights/page.tsx`:
- Renders structured cards with evidence facts and actionable recommendation buttons.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/financial/goals-insights.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/lib/insights/ src/app/goals/ src/app/insights/ tests/financial/goals-insights.test.ts
git commit -m "feat(goals-insights): implement financial goals tracking and structured ai insights"
```

---

### Task 9: AI Financial Copilot Chat & FINRA Landing Page

**Files:**
- Create: `src/app/api/copilot/route.ts`
- Create: `src/app/copilot/page.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/api/copilot-api.test.ts`

**Interfaces:**
- Consumes: User message, User financial facts from `financial-engine.ts`
- Produces: Fact-grounded AI conversational response

- [ ] **Step 1: Write failing test for copilot prompt builder**

Create `tests/api/copilot-api.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { buildCopilotSystemPrompt } from "@/app/api/copilot/prompt-builder";

describe("Copilot Prompt Builder", () => {
  it("injects real financial facts into system prompt", () => {
    const prompt = buildCopilotSystemPrompt({
      monthlyIncome: 3000000,
      monthlyExpense: 2150000,
      netSavings: 850000,
      topCategory: "Food (Rp920.000)",
      goalName: "Beli Laptop",
      goalStatus: "on_track",
    });
    expect(prompt).toContain("Rp3.000.000");
    expect(prompt).toContain("Rp2.150.000");
    expect(prompt).toContain("Beli Laptop");
    expect(prompt).toContain("Dilarang mengarang");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api/copilot-api.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement Copilot API, Copilot chat UI, and FINRA landing page**

Build `buildCopilotSystemPrompt` and `src/app/api/copilot/route.ts` using OpenAI-compatible API (`OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`).

Build `src/app/copilot/page.tsx`:
- Chat interface with quick prompt chips ("Kenapa tabungan saya turun?", "Aman tidak beli laptop sekarang?", "Berapa pengeluaran makanan saya?").

Update `src/app/page.tsx`:
- FINRA branding: *"See Your Financial Future Before You Live It."*
- Interactive showcase of Digital Twin, What-If simulation preview, and OCR demo.
- CTA: *"Build My Financial Twin"*.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api/copilot-api.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add src/app/api/copilot/ src/app/copilot/ src/app/page.tsx tests/api/copilot-api.test.ts
git commit -m "feat(copilot-landing): implement ai financial copilot and finra landing page"
```

---

### Task 10: Full Verification & PWA Offline Integrity

**Files:**
- Modify: `public/sw.js`
- Test: All test suites (`npm test`)

**Interfaces:**
- Consumes: All 9 prior tasks
- Produces: 100% green test suite, clean linter, production build

- [ ] **Step 1: Run complete Vitest suite**

Run: `npm test`  
Expected: All test suites pass (target: >85 tests across 23 files)

- [ ] **Step 2: Run TypeScript typecheck**

Run: `npx tsc --noEmit`  
Expected: 0 errors

- [ ] **Step 3: Run ESLint**

Run: `npm run lint`  
Expected: 0 errors, 0 warnings

- [ ] **Step 4: Verify zero em-dash across entire codebase**

Run: `Get-ChildItem -Path src,tests,docs -Recurse -Filter "*.ts*" | Select-String -Pattern "—"`  
Expected: 0 occurrences

- [ ] **Step 5: Run Next.js 15 production build**

Run: `npm run build`  
Expected: Exit code 0, all routes compiled successfully

- [ ] **Step 6: Commit and tag completion**

```bash
git add -A
git commit -m "chore: complete FINRA architectural implementation and verification"
```
