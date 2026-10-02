# FINRA: AI Financial Digital Twin & Planner
## Architecture & Technical Design Specification

**Document Version:** 1.0  
**Date:** 2026-10-02  
**Status:** Approved for Implementation Planning  
**Target Platform:** Progressive Web Application (PWA) / Responsive Web App (Desktop, Tablet, Mobile)  
**Primary Language:** Indonesian  
**Currency:** Indonesian Rupiah (IDR)  
**Tagline:** *"See Your Financial Future Before You Live It."*

---

## 1. Executive Summary & Vision

FINRA bertransformasi dari sekadar pencatat pengeluaran menjadi **AI Financial Digital Twin & Planner**. FINRA membantu pengguna memahami kondisi finansial saat ini, memproyeksikan masa depan, dan melakukan simulasi atas setiap keputusan finansial sebelum mengambil tindakan nyata.

### Core Value Proposition:
1. **Understand**: *"Ke mana uang saya pergi?"* (Visualisasi Digital Twin: Needs 50%, Wants 30%, Savings 20%).
2. **Predict**: *"Kalau pola ini berlanjut, apa yang akan terjadi?"* (Proyeksi pencapaian target finansial).
3. **Simulate**: *"Kalau saya mengubah keputusan anggaran, apa dampaknya?"* (What-If Simulator interaktif).

### Core Experience Loop:
```text
CAPTURE (Manual / OCR Struk / Voice Hybrid)
   ↓
UNDERSTAND (Ekstraksi & Kategorisasi)
   ↓
ANALYZE (Digital Twin: Needs vs Wants vs Savings)
   ↓
SIMULATE (What-If Scenarios)
   ↓
PLAN (Target Finansial & Tabungan Wajib)
   ↓
ACHIEVE (AI Copilot & Actionable Insights)
```

---

## 2. High-Level System Architecture

FINRA dibangun dengan arsitektur **Full-stack Next.js 15 Monolith (App Router + API Routes + Prisma PostgreSQL)** dalam satu repositori terintegrasi:

```text
[ Klien PWA / Web Browser ]
    │
    ├── 1. Manual Form ──────────┐
    │                            │
    ├── 2. OCR Struk ────────────┼─► [ Unified Candidate Pipeline ]
    │      Online: PaddleOCR+LLM │           │
    │      Offline: Tesseract+Rgx│           ▼
    │                            │   [ AI Validation & Confidence ]
    └── 3. Hybrid Voice ─────────┘           │
           Online: Web Speech API            ▼
           Offline: Whisper Worker   [ Unified Confirmation Modal ]
           + Local NLP Parser        (Review, Edit, Toggle Needs/Wants)
                                             │ (User Klik Konfirmasi)
                                             ▼
                                     [ PostgreSQL via Prisma ]
                                             │
                                             ▼
                                     [ Financial Engine ]
                                     (Deterministic Math & Logic)
                                             │
                         ┌───────────────────┼───────────────────┐
                         ▼                   ▼                   ▼
                  [ Digital Twin ]    [ Goal Tracking ]   [ What-If Sim ]
                  (Needs, Wants,      (Proyeksi Tanggal   (Simulasi Budget
                   Savings 50/30/20)   Target Tercapai)    vs Dampak Masa Depan)
                         │                   │                   │
                         └───────────────────┼───────────────────┘
                                             ▼
                                    [ Financial Facts ]
                                             │
                                             ▼
                                    [ OpenAI-Compatible LLM ]
                                             │
                                ┌────────────┴────────────┐
                                ▼                         ▼
                        [ AI Insights ]           [ AI Copilot ]
                        (Evidence, Impact,        (Chat Tanya Jawab
                         Actionable Plan)          Kondisi Finansial)
```

### Prinsip Utama Rekayasa:
1. **Backend Owns Financial Logic**: Semua perhitungan matematika dikelola oleh fungsi deterministik di backend ([`src/lib/financial-engine`](file:///D:/Project/VoiCash/src/lib)).
2. **AI Is Not Calculator**: LLM tidak boleh menghitung angka finansial kritis; LLM bertugas menganalisis pola, membedah teks struk, dan menjelaskan wawasan (*insights/copilot*).
3. **Human Confirmation Mandatory**: Seluruh masukan dari OCR maupun Suara wajib melalui konfirmasi pengguna sebelum tersimpan ke database.
4. **Local-First & Offline Resilience**: Voice input 100% jalan offline, OCR memiliki fallback offline di browser, dan transaksi offline disimpan di IndexedDB sebelum disinkronkan ke PostgreSQL.

---

## 3. Database Schema (Prisma PostgreSQL)

Skema database dirancang untuk mendukung sinkronisasi offline (UUID sisi klien), audit jejak AI (*evidence*), dan pemisahan alokasi Digital Twin:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String             @id @default(uuid())
  email             String             @unique
  password          String             // bcrypt hash
  name              String
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  profile           FinancialProfile?
  transactions      Transaction[]
  goals             FinancialGoal[]
  recurringExpenses RecurringExpense[]
  insights          AiInsight[]
  simulations       Simulation[]

  @@map("users")
}

model FinancialProfile {
  id                   String   @id @default(uuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  monthlyIncome        Int      // Dalam IDR
  incomeType           String   // "salary" | "freelance" | "business" | "allowance" | "other"
  currentSavings       Int      // Total tabungan saat ini
  monthlyFixedExpenses Int      // Pengeluaran tetap primer (sewa kos, tagihan wajib)
  financialPriority    String   // "saving" | "emergency_fund" | "buy_item" | "education" | "travel" | "debt_repayment" | "other"
  currency             String   @default("IDR")
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@map("financial_profiles")
}

model Transaction {
  id              String   @id // Client UUID (mendukung local-first & offline sync)
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            String   // "income" | "expense"
  amount          Int      // Nominal dalam Rupiah
  category        String   // "Food", "Groceries", "Transportation", "Housing", "Bills", "Health", "Education", "Entertainment", "Shopping", "Subscription", "Family", "Other"
  spendingType    String   @default("needs") // "needs" (50%) | "wants" (30%) | "savings" (20%)
  merchant        String?  // Contoh: "Mie Gacoan", "Indomaret"
  description     String?
  transactionDate DateTime @default(now())
  paymentMethod   String   @default("Cash") // "Cash", "Bank Transfer", "Debit Card", "Credit Card", "E-Wallet", "Other"
  source          String   // "manual" | "ocr" | "voice"
  metadata        Json?    // Menyimpan OCR confidence, item breakdown, atau raw transcript suara
  isDeleted       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId, transactionDate])
  @@index([userId, category])
  @@map("transactions")
}

model FinancialGoal {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String   // Contoh: "Beli Laptop Kerja"
  targetAmount  Int      // Target nominal Rupiah
  currentAmount Int      @default(0) // Tabungan teralokasi
  targetDate    DateTime // Tenggat target
  category      String   // "gadget", "emergency_fund", "vehicle", "travel", "education", "other"
  status        String   @default("on_track") // "on_track" | "at_risk" | "behind_target" | "achieved"
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId, status])
  @@map("financial_goals")
}

model RecurringExpense {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String    // Contoh: "Netflix", "Kost Bulanan", "Spotify"
  amount    Int
  category  String
  frequency String    @default("monthly") // "monthly" | "weekly" | "yearly"
  nextDate  DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([userId])
  @@map("recurring_expenses")
}

model AiInsight {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type           String   // "spending_increase" | "spending_decrease" | "recurring" | "unusual_spending" | "goal_projection"
  title          String
  description    String
  evidence       Json     // Bukti angka: { "current": 920000, "previous": 720000, "changePercent": 27.78 }
  impact         String   // Dampak finansial
  recommendation String   // Rekomendasi tindakan nyata
  confidence     Float?   @default(0.95)
  createdAt      DateTime @default(now())

  @@index([userId, createdAt])
  @@map("ai_insights")
}

model Simulation {
  id              String   @id @default(uuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name            String
  inputParameters Json
  result          Json
  createdAt       DateTime @default(now())

  @@index([userId])
  @@map("simulations")
}
```

---

## 4. Unified Capture Layer: Voice, OCR, and Manual

### 4.1 Hybrid Speech-to-Text (Tanpa LLM, 100% Offline Ready)
- **Online**: Web Speech API (`webkitSpeechRecognition`) untuk transkripsi instan 0 MB.
- **Offline**: Web Worker Whisper Base (~77 MB) atau Whisper Small (~242 MB) via WebAssembly lokal `/wasm/` di memori perangkat.
- **Parser**: Teks diproses oleh rule-based NLP parser ([`src/lib/nlp/indonesian-expense-parser.ts`](file:///D:/Project/VoiCash/src/lib/nlp/indonesian-expense-parser.ts)) dan normalisasi angka ([`number-normalizer.ts`](file:///D:/Project/VoiCash/src/lib/nlp/number-normalizer.ts)).
- **Zero Token Cost**: Tidak memerlukan pemanggilan LLM eksternal.

### 4.2 Hybrid OCR Receipt Scanner
- **Mode Online**:
  1. Pengguna memotret / mengunggah struk ke `/api/transactions/ocr`.
  2. Next.js API mengeksekusi script Python `scripts/paddle_ocr.py` via `child_process.spawn`.
  3. Hasil deteksi kotak teks PaddleOCR dikirim ke API OpenAI-compatible dengan schema JSON:
     ```json
     {
       "merchant": "Mie Gacoan",
       "amount": 38000,
       "category": "Food",
       "type": "expense",
       "date": "2026-10-02",
       "items": [
         { "name": "Mie Hompimpa", "amount": 18000 },
         { "name": "Es Teh", "amount": 5000 }
       ],
       "confidence": { "merchant": 0.98, "amount": 0.99, "category": 0.92 }
     }
     ```
- **Mode Offline**:
  1. Jika perangkat tidak memiliki internet (`!navigator.onLine`), browser otomatis beralih memproses struk di client via Web Worker Tesseract.js WebAssembly (`ocr.worker.ts`).
  2. Preprocessing gambar dilakukan pada Canvas (auto-contrast, grayscale, thresholding).
  3. Teks diekstrak oleh **Local Receipt Regex Parser** ([`src/lib/ocr/receipt-parser.ts`](file:///D:/Project/VoiCash/src/lib)) mencari kata kunci `TOTAL`, `JUMLAH`, `Rp`, tanggal, dan baris nama toko.

### 4.3 Unified Confirmation Modal
Format kandidat transaksi standar:
```typescript
export interface TransactionCandidate {
  merchant: string;
  amount: number;
  category: string;
  spendingType: "needs" | "wants" | "savings";
  date: string;
  source: "manual" | "ocr" | "voice";
  confidence?: number;
  items?: Array<{ name: string; amount: number }>;
  paymentMethod?: string;
  description?: string;
}
```
Pengguna dapat memeriksa nominal, memilih apakah pengeluaran termasuk **Needs (50%)** atau **Wants (30%)**, mengubah kategori, dan menekan tombol **Konfirmasi & Simpan**.

---

## 5. Financial Calculation Engine & Digital Twin

### 5.1 Financial Engine Deterministik ([`src/lib/financial-engine.ts`](file:///D:/Project/VoiCash/src/lib))
Fungsi inti yang mengelola data matematika:
- `calculateMonthlyIncome(userId, month, year)`: Menghitung total pemasukan bulan berjalan.
- `calculateMonthlyExpense(userId, month, year)`: Menghitung total pengeluaran bulan berjalan.
- `calculateDigitalTwinSplit(userId, month, year)`:
  - `needsTotal`: Pengeluaran dengan `spendingType = "needs"`.
  - `wantsTotal`: Pengeluaran dengan `spendingType = "wants"`.
  - `savingsTotal`: Net savings `Income - Expense`.
  - `needsRatio`, `wantsRatio`, `savingsRatio` (dibandingkan dengan standar 50/30/20).
- `calculateCategoryBreakdown(userId, month, year)`: Agregasi per kategori untuk diagram donat Recharts.
- `calculateGoalProgress(goal, monthlySavings)`:
  - `remainingAmount = targetAmount - currentAmount`
  - `monthsRemaining = targetDate - now`
  - `requiredMonthlySaving = remainingAmount / monthsRemaining`
  - `projectedCompletionDate = now + (remainingAmount / monthlySavings)`
  - Status: `on_track` | `at_risk` | `behind_target` | `achieved`.

### 5.2 What-If & Scenario Simulator Engine
Fungsi murni:
```typescript
export function simulateScenario(params: {
  currentIncome: number;
  currentExpense: number;
  incomeAdjustment: number;
  expenseAdjustments: Record<string, number>;
  newRecurringExpenses: number;
  goals: FinancialGoal[];
}): SimulationResult;
```
Menghasilkan selisih tabungan bulanan baru dan dampak pergeseran tanggal target finansial secara real-time.

---

## 6. AI Insights & Financial Copilot Architecture

### 6.1 Detektor Pola & AI Insights
Sistem analitik backend mengevaluasi transaksi dan menghasilkan kartu wawasan berstruktur:
- **Pola Kenaikan Pengeluaran**: Kategori naik > 20% dibanding bulan lalu.
- **Pola Langganan Berulang**: Identifikasi subscription berkala (Spotify, Netflix, sewa kos).
- **Pengeluaran Tidak Wajar (*Unusual Spending*)**: Transaksi > 2.5x deviasi standar kategori.

Format output kartu insight:
```json
{
  "title": "Pengeluaran Food Delivery Meningkat",
  "type": "spending_pattern",
  "evidence": {
    "current": 920000,
    "previous": 720000,
    "changePercent": 27.78
  },
  "impact": "Potensi tabungan bulanan berkurang Rp200.000.",
  "recommendation": "Pertimbangkan untuk membatasi delivery makanan maksimal 2x seminggu.",
  "confidence": 0.94
}
```

### 6.2 AI Financial Copilot
Endpoint: `POST /api/copilot`
1. Menerima pesan pertanyaan dari pengguna (misal: *"Apakah aman jika saya membeli sepatu Rp800.000 sekarang?"*).
2. Backend mengumpulkan fakta finansial pengguna (*Financial Facts*): Income, Expense, Sisa Anggaran Wants, Tabungan, Status Goals.
3. Menginjeksi fakta ke dalam prompt sistem OpenAI-compatible LLM:
   ```text
   Anda adalah FINRA Copilot. Gunakan fakta finansial berikut untuk menjawab pertanyaan pengguna.
   Dilarang mengarang angka dan dilarang menjamin keuntungan investasi.
   [FAKTA FINANSIAL PENGGUNA]
   Income: Rp3.000.000
   Expense Bulan Ini: Rp2.150.000 (Needs: Rp1.500.000, Wants: Rp650.000)
   Sisa Tabungan: Rp850.000
   Target: Beli Laptop Rp12.000.000 (Kurang Rp9.500.000, Target: Des 2027)
   ```
4. LLM memberikan jawaban berbasis data konkret tanpa halusinasi matematika.

---

## 7. Desain Antarmuka & Halaman Utama

Menggunakan sistem desain modern dengan palet warna Midnight Navy (`#080c16`, `#0e1526`, `#2563eb`), font Plus Jakarta Sans, dan dukungan Dark/Light mode:

1. **Landing Page (`/`)**:
   - Hero Section: *"See Your Financial Future Before You Live It."*
   - Interaktif Showcase: Digital Twin visualizer, demo OCR receipt scanner, demo What-If simulator.
   - CTA: *"Build My Financial Twin"*.
2. **Onboarding Wizard (`/onboarding`)**:
   - Pengisian profil awal: Nama, Penghasilan Bulanan, Jenis Penghasilan, Tabungan Saat Ini, Pengeluaran Wajib, dan Prioritas Finansial.
3. **Dashboard Utama (`/dashboard`)**:
   - Metric Cards: Income, Expense, Net Savings, Savings Rate.
   - Financial Digital Twin: Kartu interaktif perbandingan rasio 50/30/20.
   - Spending Trend & Category Breakdown (Recharts).
   - Kartu Target Finansial Cepat.
   - Floating Action Button (+ Tambah Transaksi: Manual, Scan Struk, Bicara).
4. **Halaman Transaksi (`/transactions`)**:
   - Filter lengkap: Tanggal, Kategori, Sumber (Manual, OCR, Suara), Tipe (Needs/Wants).
   - Pencarian real-time dan ekspor data.
5. **Halaman What-If Simulator (`/simulator`)**:
   - Slider interaktif anggaran per kategori.
   - 4 Template skenario cepat.
   - Grafik proyeksi masa depan sebelum vs sesudah simulasi.
6. **Halaman Goals (`/goals`)**:
   - Kartu target dengan progress bar dan lencana status (*On Track*, *At Risk*, *Behind Target*).
   - Kalkulator simulasi alokasi tabungan.
7. **Halaman AI Copilot (`/copilot`)**:
   - Antarmuka chat responsif dengan chip saran pertanyaan cepat.

---

## 8. Dekomposisi Rencana Implementasi Bertahap

Pembangunan FINRA dibagi menjadi 5 fase bertahap:

- **Fase 1 (Foundation, Schema, & Onboarding)**:
  - Migrasi skema Prisma PostgreSQL.
  - Implementasi modul Financial Engine kalkulasi deterministik.
  - Wizard onboarding profil finansial.
- **Fase 2 (Unified Capture: Hybrid OCR + Hybrid Voice + Manual)**:
  - Python subprocess PaddleOCR & OpenAI-compatible LLM extraction.
  - Client-side Tesseract.js fallback offline worker.
  - Integrasi Voice STT hybrid yang sudah ada.
  - Unified Confirmation Modal.
- **Fase 3 (Financial Digital Twin & What-If Simulator)**:
  - Komponen visualisasi 50/30/20 Digital Twin.
  - Halaman What-If Simulator dengan slider real-time dan 4 skenario cepat.
- **Fase 4 (Financial Goals & AI Insights)**:
  - Halaman dan logika pelacakan Target Finansial (*On Track / At Risk*).
  - Generator kartu AI Insights berstruktur (*Evidence, Impact, Action*).
- **Fase 5 (AI Financial Copilot & FINRA Landing Page)**:
  - Chat Copilot berbasis data fakta finansial pengguna.
  - Redesain landing page FINRA berstandar tinggi.
  - Verifikasi seluruh alur PWA offline dan pengujian kualitas 100%.

---

## 9. Kriteria Keberhasilan (Acceptance Criteria)

1. **Capture**: Pengguna dapat mencatat transaksi via Manual, OCR Scan Struk, dan Rekam Suara. Ketiganya melewati modal konfirmasi dengan opsi toggle Needs vs Wants.
2. **Digital Twin**: Dashboard menampilkan rasio aktual 50/30/20 Needs, Wants, dan Savings berdasarkan database nyata.
3. **What-If Simulation**: Penggeseran slider simulator langsung mengubah angka proyeksi tabungan dan tanggal pencapaian target tanpa mengubah data riil database.
4. **Accuracy & Guardrails**: Tidak ada angka kalkulasi finansial yang dikarang oleh LLM; semua perhitungan bersumber dari Financial Engine backend.
5. **Offline PWA Readiness**: Voice input berjalan 100% offline, OCR memiliki fallback lokal di browser, dan transaksi offline disimpan di IndexedDB.
6. **Code Quality**: 100% tes unit/integrasi lulus, 0 error TypeScript, 0 warning ESLint, dan build produksi Next.js 15 sukses.
