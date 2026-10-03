# Dashboard Minimalist Redesign, Sidebar, Natural Categories & Profile Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the FINRA dashboard into a minimalist, professional interface featuring a left sidebar, a unified light/dark mode toggle, natural spending categories (replacing the 50/30/20 split), and a profile management page to view and update onboarding financial data.

**Architecture:** 
1. Replace 50/30/20 ratio logic with 9 natural spending categories across financial types, LLM system prompts, and charts.
2. Build a dedicated `DashboardSidebar` component for desktop navigation and clean mobile bottom navigation.
3. Introduce a standalone `/profile` page communicating with `/api/profile` to edit onboarding metrics.
4. Align `/login` and `/register` with the FINRA navy and white palette and embed the theme toggle.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Vitest, Prisma.

**Spec:** Conversational design approved in chat on 2026-10-03.

## Global Constraints
- Zero em-dash character across all code, tests, docs, and strings.
- Color palette strictly adheres to FINRA deep navy (#080c16, #0e1526, #0f274a) and clean white/slate.
- Local-first offline capability preserved.

## Review Focus
1. User with no prior transactions sees a clean, calm empty state without visual clutter.
2. Saving changes on `/profile` immediately updates database and persists to session.
3. Toggling theme instantly updates `document.documentElement` and persists to `localStorage`.
4. LLM OCR and Copilot categorize into the 9 natural categories without falling back to 50/30/20 tags.
5. Mobile view remains responsive with no horizontal scroll or colliding buttons.

---

### Task 1: Update Expense Categories & LLM Prompts (Retiring 50/30/20)

**Files:**
- Modify: `src/types/financial-types.ts`
- Modify: `src/app/api/transactions/ocr/route.ts`
- Modify: `src/app/api/copilot/route.ts`
- Modify: `src/app/api/copilot/prompt-builder.ts`
- Test: `tests/nlp/category-taxonomy.test.ts`

**Interfaces:**
- Produces: `SPENDING_CATEGORIES` list and `SpendingCategory` type containing:
  - "Food & Drinks", "Transportation", "Housing & Bills", "Shopping & Clothing", "Entertainment & Leisure", "Education & Career", "Health & Personal Care", "Social & Family", "Other"

- [ ] **Step 1: Write the category taxonomy test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Update financial types and LLM prompt builder**
- [ ] **Step 4: Update OCR parser prompt to categorize into 9 natural categories**
- [ ] **Step 5: Run tests and ensure all pass**
- [ ] **Step 6: Commit**

---

### Task 2: Build Reusable Theme Toggle Component

**Files:**
- Create: `src/components/layout/theme-toggle.tsx`
- Test: `tests/ui/theme-toggle.test.ts`

**Interfaces:**
- Produces: `ThemeToggle` component with accessible button and smooth icon transition between Sun and Moon.

- [ ] **Step 1: Write the theme toggle test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement ThemeToggle component with localStorage persistence**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

---

### Task 3: Build Professional Left Sidebar Navigation Component

**Files:**
- Create: `src/components/layout/dashboard-sidebar.tsx`
- Test: `tests/ui/dashboard-sidebar.test.ts`

**Interfaces:**
- Produces: `DashboardSidebar` component supporting:
  - Links: Dashboard (`/dashboard`), Simulator (`/simulator`), Goals (`/goals`), Copilot (`/copilot`), Profil (`/profile`)
  - Active state styling, compact collapse, user badge, and logout action.

- [ ] **Step 1: Write the sidebar test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement DashboardSidebar component**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

---

### Task 4: Refactor Dashboard UI to Minimalist Sidebar Layout & Category Breakdown

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/components/dashboard/category-donut-chart.tsx`
- Test: `tests/ui/digital-twin-dashboard.test.ts`

**Interfaces:**
- Consumes: `DashboardSidebar`, `ThemeToggle`, `SPENDING_CATEGORIES`
- Produces: Streamlined dashboard layout without badge clutter or 50/30/20 pill badges.

- [ ] **Step 1: Update dashboard tests for sidebar and category chart**
- [ ] **Step 2: Refactor category chart to display natural category breakdown**
- [ ] **Step 3: Refactor dashboard page with left sidebar layout and clean header**
- [ ] **Step 4: Verify test suite passes**
- [ ] **Step 5: Commit**

---

### Task 5: Build Profile Management Page (`/profile`)

**Files:**
- Create: `src/app/profile/page.tsx`
- Test: `tests/ui/profile-page.test.ts`

**Interfaces:**
- Consumes: `/api/profile` (GET, POST), `DashboardSidebar`, `ThemeToggle`
- Produces: Complete profile management view allowing editing of monthly income, income type, current savings, fixed expenses, and financial priority.

- [ ] **Step 1: Write profile page test**
- [ ] **Step 2: Run test to verify failure**
- [ ] **Step 3: Implement ProfilePage component with interactive form and toast/alert feedback**
- [ ] **Step 4: Run test to verify pass**
- [ ] **Step 5: Commit**

---

### Task 6: Harmonize Login and Register Styling with Finra Navy Palette & Theme Toggle

**Files:**
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`
- Test: `tests/ui/auth-pages.test.ts`

**Interfaces:**
- Consumes: `ThemeToggle`
- Produces: Clean, modern auth cards in deep navy/crisp white with minimal shadows and integrated theme switch.

- [ ] **Step 1: Update auth pages tests**
- [ ] **Step 2: Refactor Login and Register cards with minimalist styling and ThemeToggle**
- [ ] **Step 3: Run tests to verify pass**
- [ ] **Step 4: Commit**

---

### Task 7: Full Verification & Zero Em-Dash Audit

**Files:**
- Audit all touched files

- [ ] **Step 1: Run full test suite (npm test)**
- [ ] **Step 2: Run typecheck (npx tsc --noEmit)**
- [ ] **Step 3: Run linter (npm run lint)**
- [ ] **Step 4: Check for zero em-dash characters**
- [ ] **Step 5: Final commit**
