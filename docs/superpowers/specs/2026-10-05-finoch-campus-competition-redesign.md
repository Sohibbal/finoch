# Spesifikasi Desain & Teknis Finoch (Lomba Web Development Skala Kampus)

## 1. Ringkasan Eksekutif & Sasaran Lomba
- **Nama Produk**: Finoch (`finoch.id`)
- **Tagline**: Finansial Anak Kost Rapi Sekali Bicara
- **Target Segmen**: Mahasiswa & Anak Kost Indonesia
- **Target Capaian**: Juara 1 Lomba Web Development (Skor Maksimal / "Rata Kanan" di seluruh kriteria):
  - Inovasi & Solusi: 20%
  - Fungsionalitas: 20%
  - UI/UX: 15%
  - Kualitas Teknis: 15%
  - Responsivitas & Performa: 10%
  - Presentasi, Demo & Tanya Jawab: 20%

---

## 2. Inovasi & Fitur Spesifik Anak Kost

### 2.1 "Jatah Jajan Aman Hari Ini" (Daily Safe-to-Spend Widget)
Menjawab krisis klasik "tanggal tua" anak kost dengan kalkulasi dinamis:
- Rumus:
  `Jatah Harian = (Sisa Saldo Bulanan - Sisa Tagihan Tetap Kos/Listrik) / Hari Tersisa Sampai Akhir Bulan`
- Tiga Indikator Status:
  - 🟢 **Aman**: Pengeluaran hari ini <= Jatah Harian
  - 🟡 **Waspada**: Pengeluaran hari ini mendekati batas (80% - 100%)
  - 🔴 **Krisis Tanggal Tua**: Melampaui jatah harian (disertai rekomendasi penghematan cerdas)

### 2.2 Eliminasi Artefak AI-Slop
- Menghapus section paket harga berbayar SaaS (Pro/Enterprise) dari Landing Page.
- Menggantinya dengan komitmen: **"100% Gratis untuk Seluruh Mahasiswa, Bebas Iklan, Berjalan Tanpa Kuota"**.
- Menyediakan showcase interaktif kalimat pengeluaran khas mahasiswa:
  - *"Makan siang warteg es teh 18 ribu"*
  - *"Beli bensin pertalite 20 ribu sekalian parkir 2 ribu"*
  - *"Patungan WiFi kos 45 ribu"*

### 2.3 Kurasi Kategori & Preset Skenario
- Kategori transaksi disesuaikan dengan realitas anak kost: Makanan & Minuman, Transportasi/Bensin/Ojol, Sewa Kos & Tagihan Listrik/WiFi, Belanja/Kebutuhan Kuliah, serta Hiburan/Nongkrong.
- Simulator What-If disesuaikan untuk skenario realistis: Pangkas jajan kopi, uang kiriman terlambat, dan pendapatan tambahan magang/freelance.

---

## 3. UI/UX & Mobile PWA Architecture

### 3.1 Navigasi Bawah Mobile (BottomNav) 5-Tab
Memastikan seluruh menu utama dapat dijangkau oleh jempol pengguna pada layar smartphone:
1. **Beranda (`/dashboard`)**: Ringkasan saldo, widget Safe-to-Spend, dan riwayat transaksi.
2. **Jatah & Simulasi (`/simulator`)**: Kalkulator Safe-to-Spend & simulasi skenario keuangan.
3. **Tombol Suara Tengah (Floating Mic)**: Tombol utama dengan efek visual pulse untuk input suara instan.
4. **AI Copilot (`/copilot`)**: Asisten konsultasi keuangan cerdas berbasis LLM.
5. **Target & Profil (`/goals` & `/profile`)**: Target tabungan dan konfigurasi profil keuangan.

### 3.2 Desain Visual Anti-Slop (Double-Bezel & High Contrast)
- **Tipografi**: Plus Jakarta Sans dengan skala tipografi kontras tinggi.
- **Palet Warna**:
  - Light: Warm Cream (`#FAF8F5`), Deep Navy (`#0B192C`), Emerald (`#10B981`), Electric Blue (`#3B82F6`).
  - Dark: Deep OLED Slate (`#060B14`), ramah baterai smartphone AMOLED.
- **Indikator Status Jaringan Real-Time**:
  - Badge floating: "🟢 Online · Sinkron Cloud" / "🟠 Mode Offline · Tersimpan di HP (IndexedDB)".

---

## 4. Arsitektur Teknis, Backend & Offline PWA

### 4.1 Backend LLM 9router & Normalisasi Endpoint
- Mengonfigurasi `OPENAI_BASE_URL="https://ai.botku.id/v1"` dan `OPENAI_MODEL="9router"` di `.env`.
- Memperbarui `src/lib/llm/llm-client.ts` untuk menormalisasi URL (mencegah double slash dan menjamin path `/v1/chat/completions` valid).
- Mengintegrasikan model `9router` pada:
  - `/api/copilot`: Menjawab konsultasi berbasis fakta finansial pengguna.
  - `/api/transactions/parse-voice`: Ekstraksi multi-transaksi dengan akurasi tinggi.
  - `/api/transactions/ocr`: Ekstraksi struk belanja kasir.

### 4.2 Bulletproof Offline PWA (Zero-Crash Tanpa Internet)
- **Service Worker (`public/sw.js`)**:
  - Mengganti `cache.addAll` yang kaku dengan caching selektif dan *stale-while-revalidate*.
  - Menyediakan fallback navigasi offline yang andal.
- **Dual-Engine Voice Input**:
  - Online: Web Speech API + Parser LLM `9router`.
  - Offline: Native Speech Recognition + Indonesian Expense Regex Parser (`indonesian-expense-parser.ts`) tanpa ketergantungan koneksi jaringan.
- **Penyimpanan IndexedDB & Background Sync**:
  - Transaksi offline langsung tersimpan ke IndexedDB lokal.
  - Saat koneksi online kembali aktif, antrean transaksi otomatis disinkronkan ke PostgreSQL melalui Prisma.

---

## 5. Rencana Verifikasi & Uji Kualitas
1. **Unit & Integration Tests**: 97+ tests vitest harus 100% PASS.
2. **Type Safety**: `tsc --noEmit` wajib 0 error.
3. **Code Quality**: `eslint src/` wajib 0 warning & 0 error.
4. **Production Build**: `next build` selesai tanpa peringatan kritis.
5. **Pengujian Offline**: Simulasi navigator.onLine = false; verifikasi input suara dan pencatatan transaksi tetap berhasil tersimpan di IndexedDB.
