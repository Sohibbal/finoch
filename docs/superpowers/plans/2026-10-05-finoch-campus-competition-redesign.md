# Finoch Campus Competition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the application into **Finoch**, an elite, anti-slop, bulletproof offline PWA personal finance tracker specifically tailored for Indonesian college students and anak kost, maximizing scores across all 8 criteria for Juara 1 in the campus Web Development competition.

**Architecture:** Local-first Next.js 15 PWA with an offline-resilient Service Worker and IndexedDB storage, seamlessly synchronized with PostgreSQL via Prisma when online. AI voice parsing and financial copilot powered by the configured `9router` LLM with instant local regex NLP fallback when offline.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS, TypeScript, IndexedDB (`idb`), Prisma, Web Speech API, OpenAI SDK / Fetch, Lucide Icons, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-05-finoch-campus-competition-redesign.md`

## Global Constraints
- Target Name: Finoch (`finoch.id`), Tagline: "Finansial Anak Kost Rapi Sekali Bicara"
- Target Persona: Mahasiswa & Anak Kost Indonesia
- Anti-Slop: Zero SaaS pricing tables, no corporate jargon, authentic Indonesian student copywriting
- Offline Guarantee: App shell & recording must operate with `navigator.onLine = false` without crashing
- Zero Regression: All 33 test files (97+ tests), TypeScript compilation, and `next build` must pass cleanly

---

### Task 1: Environment & LLM Backend Normalization

**Files:**
- Modify: `.env`
- Modify: `src/lib/llm/llm-client.ts`
- Test: `tests/llm/llm-client.test.ts`

**Interfaces:**
- Consumes: Environment variables `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`
- Produces: `getLlmConfig(): LlmConfig | null` with properly normalized `baseUrl` (always ending with `/v1` and no trailing slashes)

- [ ] **Step 1: Write the failing unit test for base URL normalization**

Add a test case in `tests/llm/llm-client.test.ts` verifying that `OPENAI_BASE_URL="https://ai.botku.id/"` or `"https://ai.botku.id"` is correctly normalized to `"https://ai.botku.id/v1"` without double slashes.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/llm/llm-client.test.ts`
Expected: FAIL due to lack of normalization on custom base URLs.

- [ ] **Step 3: Update .env and implement URL normalization in llm-client.ts**

In `.env`:
```env
OPENAI_API_KEY="sk-0633ef3c6b7ae46f-1bem5s-a911b865"
OPENAI_BASE_URL="https://ai.botku.id/v1"
OPENAI_MODEL="9router"
```

In `src/lib/llm/llm-client.ts`:
Ensure `baseUrl` trims trailing slashes, appends `/v1` if not present (unless it's Google Generative AI endpoint), and guarantees valid URL concatenation with `/chat/completions`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/llm/llm-client.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add .env src/lib/llm/llm-client.ts tests/llm/llm-client.test.ts
git commit -m "feat(llm): normalize base URL and configure 9router for Finoch"
```

---

### Task 2: "Jatah Jajan Aman Hari Ini" (Daily Safe-to-Spend) Calculation Engine

**Files:**
- Modify: `src/lib/financial/financial-engine.ts`
- Modify: `src/types/financial-types.ts`
- Test: `tests/financial/financial-engine.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface DailySafeToSpendResult {
    dailyBudget: number;
    todaySpent: number;
    remainingToday: number;
    daysRemaining: number;
    status: "safe" | "warning" | "danger";
    headline: string;
    advice: string;
  }
  export function calculateDailySafeToSpend(params: {
    monthlyIncome: number;
    totalExpensesThisMonth: number;
    monthlyFixedExpenses: number;
    todaySpent?: number;
    currentDate?: Date;
  }): DailySafeToSpendResult;
  ```

- [ ] **Step 1: Write unit tests for calculateDailySafeToSpend**

In `tests/financial/financial-engine.test.ts`, add test cases for:
- Safe condition: Income 3.000.000, fixed bills 1.000.000, expenses 500.000, remaining budget divided by remaining days.
- Warning condition: Spending today reaches 85% of daily budget.
- Danger / Tanggal Tua condition: Net remaining budget <= 0.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/financial/financial-engine.test.ts`
Expected: FAIL because `calculateDailySafeToSpend` is not yet exported.

- [ ] **Step 3: Implement calculateDailySafeToSpend**

Add the type definitions to `src/types/financial-types.ts` and implementation in `src/lib/financial/financial-engine.ts`.
Calculate exact days remaining in current month, derive daily safe-to-spend allowance, and provide friendly student advice.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/financial/financial-engine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/financial-types.ts src/lib/financial/financial-engine.ts tests/financial/financial-engine.test.ts
git commit -m "feat(financial): add daily safe-to-spend calculation engine for students"
```

---

### Task 3: Bulletproof PWA Service Worker & Offline Status Banner

**Files:**
- Modify: `public/sw.js`
- Modify: `public/manifest.json`
- Create: `src/components/layout/offline-banner.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/pwa/manifest.test.ts`

**Interfaces:**
- Produces:
  - Resilient Service Worker caching with stale-while-revalidate for static assets, network-first with cache-fallback for navigation.
  - `<OfflineBanner />` floating pill showing live online/offline network indicator.

- [ ] **Step 1: Update PWA manifest test**

Verify manifest has name "Finoch - Catat Keuangan Anak Kost", short_name "Finoch", theme_color, and start_url.

- [ ] **Step 2: Refactor public/sw.js and manifest.json**

- In `public/manifest.json`: update name to "Finoch - Finansial Anak Kost", short_name to "Finoch".
- In `public/sw.js`:
  - Cache name `finoch-shell-v2`.
  - Non-blocking installation (do not reject entire SW if one URL redirects).
  - Network-first navigation fallback.
  - Stale-while-revalidate for static assets.

- [ ] **Step 3: Create OfflineBanner component and attach to layout.tsx**

In `src/components/layout/offline-banner.tsx`:
Listen to `window.addEventListener('online')` and `window.addEventListener('offline')`.
When offline, display:
"🟠 Mode Offline Aktif · Data tersimpan lokal di HP (IndexedDB)" with smooth slide-down animation.
When online, display brief green toast:
"🟢 Terhubung Kembali · Data otomatis sinkron ke server".

Attach `<OfflineBanner />` into `src/app/layout.tsx`.

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run tests/pwa/manifest.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add public/sw.js public/manifest.json src/components/layout/offline-banner.tsx src/app/layout.tsx tests/pwa/manifest.test.ts
git commit -m "feat(pwa): bulletproof offline service worker and real-time offline status banner"
```

---

### Task 4: Mobile 5-Tab BottomNav Overhaul

**Files:**
- Modify: `src/components/layout/bottom-nav.tsx`
- Test: `tests/ui/desktop-layout.test.ts`

**Interfaces:**
- Consumes: `onOpenVoice: () => void`, `userEmail?: string | null`
- Produces: 5 accessible touch tabs on mobile viewports (<768px):
  1. Beranda (`/dashboard` or `/`)
  2. Simulasi & Jatah (`/simulator`)
  3. Mic (Center Floating Trigger)
  4. AI Copilot (`/copilot`)
  5. Target & Profil (`/goals` / `/profile`)

- [ ] **Step 1: Update navigation tests**

In `tests/ui/desktop-layout.test.ts`, update assertions to verify that `BottomNav` renders accessible links for Simulator, Copilot, and Goals/Profile.

- [ ] **Step 2: Implement 5-Tab layout in bottom-nav.tsx**

Style with ergonomic touch targets (min 44px), thumb-friendly spacing, active pill highlighting with modern backdrop blur glass effect, and safe-area padding for mobile.

- [ ] **Step 3: Run test to verify it passes**

Run: `npx vitest run tests/ui/desktop-layout.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/bottom-nav.tsx tests/ui/desktop-layout.test.ts
git commit -m "feat(ui): upgrade mobile bottom navigation to comprehensive 5-tab student bar"
```

---

### Task 5: Landing Page Rebranding & Elimination of SaaS Slop

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: Polished high-conversion student-first landing page for Finoch.
  - Zero SaaS subscription/pricing slop.
  - Replaced with: "100% Gratis untuk Seluruh Mahasiswa Indonesia (Tanpa Iklan, Berjalan Tanpa Kuota)".
  - Voice simulator presets tailored for anak kost ("Makan siang warteg es teh 18rb", "Bensin pertalite 20rb sekalian parkir", "Patungan WiFi kos 45rb").
  - Unified Finoch branding.

- [ ] **Step 1: Remove pricing section and add Student Value Guarantee**

Remove `#harga` section in `src/app/page.tsx`.
Replace with an interactive student guarantee card:
- "Dibuat Khusus untuk Mahasiswa & Anak Kost"
- "100% Free Forever · Zero Ads · Open Source Spirit"
- "Hemat Kuota & Baterai · 100% On-Device Whisper & IndexedDB"

- [ ] **Step 2: Update all branding strings from VoiCash/FINRA to Finoch**

Update page title, logo, navbar labels, meta descriptions in `src/app/page.tsx` and `src/app/layout.tsx`.

- [ ] **Step 3: Verify build and linting**

Run: `npx eslint src/app/page.tsx src/app/layout.tsx`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "refactor(landing): rebrand to Finoch and replace SaaS pricing with student guarantee"
```

---

### Task 6: Dashboard Daily Safe-to-Spend Widget Integration

**Files:**
- Create: `src/components/dashboard/daily-safe-to-spend-card.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Test: `tests/ui/dashboard-metrics.test.ts`

**Interfaces:**
- Produces:
  - `<DailySafeToSpendCard result={safeToSpendResult} onOpenVoice={...} />`
  - Integrated directly at the top of the main Dashboard page.

- [ ] **Step 1: Write test for DailySafeToSpendCard**

Create unit test in `tests/ui/dashboard-metrics.test.ts` verifying rendering of daily budget amount, status badge ("Aman", "Waspada", "Krisis"), and remaining days.

- [ ] **Step 2: Implement DailySafeToSpendCard component**

Design with double-bezel architecture:
- Shows "Jatah Jajan Hari Ini: Rp XX.XXX / hari"
- Progress meter against today's actual spending.
- Status indicator and dynamic advice ("Hari ini aman buat nongkrong santai" / "Tanggal tua! Tahan jajan di luar").

- [ ] **Step 3: Integrate into dashboard/page.tsx**

Compute `calculateDailySafeToSpend` from `profile.monthlyIncome`, `profile.monthlyFixedExpenses`, and `transactions`. Render card prominently above the Digital Twin.

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run tests/ui/dashboard-metrics.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/daily-safe-to-spend-card.tsx src/app/dashboard/page.tsx tests/ui/dashboard-metrics.test.ts
git commit -m "feat(dashboard): integrate daily safe-to-spend card for anak kost"
```

---

### Task 7: AI Copilot & Simulator Student Persona Tuning

**Files:**
- Modify: `src/app/api/copilot/prompt-builder.ts`
- Modify: `src/app/copilot/page.tsx`
- Modify: `src/app/simulator/page.tsx`
- Test: `tests/api/copilot-api.test.ts`

**Interfaces:**
- Produces: Empathetic, smart student financial buddy persona ("Finoch AI Copilot") and student what-if presets (Kopi, Job Magang, Kiriman Ortu).

- [ ] **Step 1: Update copilot test**

Verify prompt builder produces system prompt with Finoch branding and student context.

- [ ] **Step 2: Tune prompt-builder.ts and copilot/page.tsx**

Update system instructions in `src/app/api/copilot/prompt-builder.ts` to advise like a wise senior student: practical budgeting, street-smart savings, understanding anak kost realities.
Update initial welcome message and quick prompt buttons in `src/app/copilot/page.tsx` to student prompts:
- "Jatah jajan hari ini masih aman nggak?"
- "Gimana trik hemat makan biar uang kiriman cukup sebulan?"
- "Boleh nggak beli sepatu baru minggu ini?"

- [ ] **Step 3: Update simulator presets for students**

In `src/app/simulator/page.tsx`:
Presets:
- "Pangkas Kopi & Jajanan Sore (Hemat Rp200rb/bln)"
- "Dapat Gaji Magang / Freelance (+Rp600rb/bln)"
- "Uang Kiriman Terlambat (Survive 1 Minggu)"

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run tests/api/copilot-api.test.ts tests/ui/copilot-page.test.ts tests/ui/what-if-simulator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/copilot/prompt-builder.ts src/app/copilot/page.tsx src/app/simulator/page.tsx tests/api/copilot-api.test.ts
git commit -m "feat(copilot): tune AI persona and simulation presets for Indonesian students"
```

---

### Task 8: End-to-End Verification & Judge Presentation Guide

**Files:**
- Create: `docs/DEMO_JURI.md`
- Run: Full test suite, TypeScript check, linter, production build

- [ ] **Step 1: Run comprehensive TypeScript check**

Run: `npm run typecheck`
Expected: 0 errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: 0 errors

- [ ] **Step 3: Run entire test suite**

Run: `npm run test`
Expected: 33+ test files passed (100% pass rate)

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: Build succeeds with optimized static and dynamic routes.

- [ ] **Step 5: Create docs/DEMO_JURI.md**

Write a cheat sheet for the user to ace the 10% Presentasi, 5% Demo Sistem, and 5% Tanya Jawab:
- 1-minute elevator pitch for judges.
- 3 killer demo moments:
  1. Voice Input "Makan siang warteg 18rb" (instant 0.3s parse).
  2. Matikan WiFi di depan juri -> catat transaksi -> offline banner aktif & IndexedDB tersimpan.
  3. Buka Copilot -> tanya "Jatah jajan hari ini aman nggak?" -> dijawab cerdas oleh 9router.
- Anticipated judge Q&A questions with winning technical answers.

- [ ] **Step 6: Commit**

```bash
git add docs/DEMO_JURI.md
git commit -m "docs: add judge presentation script and competition winning guide"
```
