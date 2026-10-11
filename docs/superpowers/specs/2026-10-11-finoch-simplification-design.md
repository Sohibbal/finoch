# Finoch Simplification & Core Redesign Specification

**Date:** 2026-10-11  
**Status:** Approved  
**Author:** Pair Programming (User & Antigravity)  
**Topic:** Domain Simplification, 6 Core Pages, Symmetric Income & Expense (Voice, Scan, Manual), Wishlist Delay Engine, Dashboard Gen Z Insight & Streak, FinBot Copilot, and Minimalist Onboarding.

---

## 1. Executive Summary & Vision

Aplikasi **Finoch** disederhanakan secara terfokus dari platform yang sebelumnya sarat modul (*bills, budget, debts, ukt, meal-calc, audit, reports, streak, simulator, split-bill*) menjadi aplikasi pendamping finansial cerdas, cepat, dan personal khusus mahasiswa dan anak muda.

Aplikasi berfokus pada **3 pilar utama**:
1. **Next-Step Logging (Symmetric Income & Expense)**: Pencatatan Pemasukan dan Pengeluaran dengan 3 metode terpadu: **Bicara (Voice)**, **Scan (OCR Struk & Bukti Transfer)**, dan **Catat Manual**.
2. **Impulse Control via Wishlist**: Mengaitkan perilaku belanja harian secara langsung dengan waktu pencapaian barang impian di Wishlist (boros $\rightarrow$ target mundur, hemat $\rightarrow$ target maju).
3. **Teman Finansial Gen Z (FinBot & Daily Insight)**: Antarmuka yang menyapa pengguna dengan nama panggilan (*nickname*), Card Insight harian berbahasa santai Gen Z, widget Streak disiplin hemat di Beranda, serta **FinBot AI Copilot** yang menjawab pertanyaan seputar data keuangan user secara cepat, valid, dan akrab.

---

## 2. Navigasi & Struktur Rute (Hanya 6 Menu Utama)

Sidebar desktop dan mobile navigation bar hanya memuat 6 menu terpusat:

| Menu | Rute | Ikon (Lucide React) | Deskripsi |
| :--- | :--- | :--- | :--- |
| **Beranda** | `/dashboard` | `LayoutDashboard` | Ringkasan saldo, arus kas, Card Insight Gen Z, dan Widget Streak Hemat |
| **Pemasukan** | `/pemasukan` | `ArrowDownLeft` | Pencatatan uang masuk (Bicara, Scan, Manual) & riwayat pemasukan |
| **Pengeluaran**| `/pengeluaran` | `ArrowUpRight` | Pencatatan uang keluar (Bicara, Scan, Manual) & riwayat pengeluaran |
| **Wishlist** | `/wishlist` | `Sparkles` / `Gift` | Daftar impian, estimasi tanggal tercapai, dan input via suara/manual |
| **FinBot** | `/copilot` | `Bot` | Asisten AI tanya jawab cepat berbasis data riil keuangan pengguna di database |
| **Profil** | `/profile` | `User` | Pengaturan nickname, email, kata sandi, dan preferensi tema aplikasi |

### Modul yang Dihapus Total:
Seluruh kode, rute, dan komponen dari modul berikut akan dihapus bersih:
- `bills` (Tagihan Kost Shield)
- `budget` (Amplop Pos Anggaran)
- `debts` (Buku Kasbon & Talangan)
- `ukt-savings` (Sinking Fund UKT)
- `meal-calc` (Kalkulator Masak vs Warteg)
- `audit` (Audit Bocor Halus)
- `reports` (Laporan & Ekspor Ortu)
- `streak` (Rute mandiri dihapus; logikanya dipindahkan ke Beranda)
- `simulator` (What-If Simulator)
- `split-bill` (Split Bill Resto)
- `wallets` (Multi-dompet dihapus untuk menyederhanakan perhitungan saldo)
- `goals` & `insights` (Rute mandiri dihapus)

---

## 3. Desain Onboarding Baru: *FinBot First Meeting*

Alur onboarding dirombak total dari kuesioner profil finansial bertingkat menjadi sesi perkenalan 1 langkah yang hangat:

* **Visual & Layout**:
  - Halaman `/onboarding`.
  - Satu kartu terpusat (*Centered Card*) dengan efek border modern.
  - Avatar FinBot di bagian atas dengan animasi *glow pulse*.
* **Animasi Teks Diketik (Typewriter Animation)**:
  - FinBot menyapa otomatis:
    > *"Hai! Kenalin, gue FinBot 🤖 Teman finansial lo. Biar kita makin akrab, nama panggilan lo siapa nih?"*
* **Input Tunggal**:
  - Kolom input: **Nickname** (Nama Panggilan).
  - Placeholder: *"Contoh: Alex, Daffa, Salsa..."*
* **Aksi Transisi**:
  - Tombol aksi berikon Lucide `ArrowRight`: *"Mulai Berteman"*.
  - Menyimpan nickname ke profil user dan langsung mengarahkan ke `/dashboard`.
  - Nickname ini disimpan permanen dan dipakai oleh FinBot serta header aplikasi untuk menyapa user ("Halo, [Nickname]!").

---

## 4. Spesifikasi Halaman Transaksi: Pemasukan & Pengeluaran

### 4.1 Halaman Pemasukan (`/pemasukan`)
* **3 Metode Pencatatan**:
  1. **Bicara (Voice Input)**:
     - Voice recognition hybrid (Web Speech API dengan fallback Whisper on-device).
     - Slang NLP parser mendeteksi konteks pemasukan (cth: *"Dapet transferan ortu sejuta"*, *"Uang saku dari bapak gocap rebu"*, *"Project website dibayar lima ratus ribu"*).
     - Auto-kategori otomatis (*Uang Saku, Gaji, Freelance, Hadiah/Bonus, Penjualan, Lainnya*).
  2. **Scan Bukti Transfer / Struk (OCR)**:
     - Menggunakan Tesseract.js client-side.
     - Mengekstrak nominal, tanggal, dan pengirim dari screenshot m-banking/e-wallet.
  3. **Catat Manual**:
     - Form input cepat: Nominal (Rp), Nama/Sumber, Kategori, Tanggal.
* **Tabel Riwayat Pemasukan**:
  - Filter rentang waktu dan pencarian.
  - Badge metode input menggunakan ikon Lucide konsisten (`Mic`, `ScanLine`, `PencilLine`).
  - Fitur edit dan hapus.

### 4.2 Halaman Pengeluaran (`/pengeluaran`)
* **3 Metode Pencatatan**:
  1. **Bicara (Voice Input)**:
     - NLP normalizer mengenali slang Indonesia (*goceng*, *ceban*, *gocap*, *nopek*, dsb).
     - Multi-item splitter (*"Beli batagor sepuluh ribu sama jus alpukat ceban"*).
     - Auto-kategori pengeluaran (*Makanan & Minuman, Transportasi, Kebutuhan Kost, Hiburan, Belanja, Pendidikan, Kesehatan, Lainnya*).
  2. **Scan Struk Belanja (OCR)**:
     - Scan foto struk minimarket/supermarket/restoran via kamera/upload.
     - Auto-ekstraksi total belanjaan.
  3. **Catat Manual**:
     - Form input cepat: Nominal (Rp), Nama Item, Kategori, Tanggal.
* **Tabel Riwayat Pengeluaran**:
  - Filter kategori dan pencarian.
  - Opsi edit dan hapus.

---

## 5. Spesifikasi Wishlist (`/wishlist`)

Sistem pengingat target barang impian sekaligus penahan belanja impulsif:
* **Input Item**:
  - **Bicara**: *"Pengen beli keyboard mekanik harganya tujuh ratus ribu"* $\rightarrow$ otomatis mengisi form wishlist.
  - **Manual**: Nama barang, target harga, dan prioritas (1–5).
* **Integrasi Finansial Dinamis**:
  - **Kalkulasi Tabungan Tersedia**: Menghitung surplus tabungan (Total Pemasukan − Total Pengeluaran).
  - **Estimasi Tanggal Tercapai**: Dihitung dari `targetPrice / rata-rata surplus harian`.
  - **Dynamic Delay Feedback**: Jika pengeluaran hari ini melebihi jatah harian, tanggal estimasi tercapai bertambah mundur secara transparan.
* **Aksi**: Tombol *"Tandai Tercapai"* (ikon Lucide `CheckCircle2`) untuk merayakan impian yang terpenuhi.

---

## 6. Spesifikasi Beranda / Dashboard (`/dashboard`)

* **Header**:
  - Sapaan hangat: *"Halo, [Nickname]! 👋"* dengan indikator sinkronisasi offline/online.
* **Metrik Finansial Utama**:
  - **Total Saldo Aktif**: Akumulasi seluruh pemasukan dikurangi pengeluaran.
  - **Pemasukan Bulan Ini vs Pengeluaran Bulan Ini**.
  - **Sisa Jatah Belanja Hari Ini**: Menghitung batas aman belanja harian berdasarkan sisa hari dalam bulan berjalan.
* **Card Insight Gen Z Dinamis (Fitur Utama)**:
  - Gaya bahasa: Sangat santai, alami, bernada Gen Z anak muda / anak kost (bukan bahasa kaku korporat).
  - **Evaluasi Harian Otomatis**:
    - Mengecek rasio pengeluaran hari ini terhadap jatah.
    - Menghubungkan dampaknya ke item teratas di Wishlist.
    - *Contoh jika boros*:  
      > *"Bro [Nickname], jajan lo hari ini agak brutal nih lewat jatah Rp25.000 gara-gara nongkrong. Efeknya, estimasi lo dapet **Sepatu Vans** di wishlist mundur 2 hari ya. Besok rem dulu dikit biar aman!"*
    - *Contoh jika hemat*:  
      > *"Gokil [Nickname], hari ini pengeluaran lo adem ayem jauh di bawah jatah! Pertahanin begini, target **AirPods** lo bisa kekejar 4 hari lebih cepet!"*
  - Berjalan 100% offline via *Heuristic Insight Engine* lokal, dengan opsi narasi AI saat online.
* **Widget Streak Hemat**:
  - Menampilkan jumlah hari berturut-turut pengeluaran $\le$ jatah harian.
  - Ikon: Lucide `Flame`.
  - Teks: *"🔥 [X] Hari Disiplin Hemat"*.
* **Quick Action Buttons**:
  - Akses cepat untuk catat Pemasukan atau Pengeluaran dengan 3 tombol metode input (Bicara, Scan, Manual).

---

## 7. Spesifikasi FinBot AI Copilot (`/copilot`)

* **Identitas & Persona**:
  - Nama: **FinBot**.
  - Ikon: Lucide `Bot` / `Sparkles`.
  - Karakter: Sahabat tongkrongan yang paham uang, santai, ceplas-ceplos positif, suportif, dan 100% menggunakan bahasa gaul Gen Z.
* **Database Grounded (Zero Halusinasi)**:
  - Server route `/api/copilot` mengekstrak **Data Snapshot Finansial Pengguna**:
    1. Nickname user.
    2. Total saldo aktif saat ini.
    3. Total pemasukan bulan ini & sumber terbesarnya.
    4. Total pengeluaran bulan ini & top 3 kategori pengeluaran terboros.
    5. Transaksi 7 hari terakhir.
    6. Daftar Wishlist dan estimasi waktu tercapai.
  - Snapshot ini disuntikkan ke system prompt LLM sehingga jawaban FinBot selalu 100% valid dan presisi dengan angka riil di database.
* **Contoh Tanya Jawab FinBot**:
  - User: *"FinBot, bulan ini gue paling boros beli apa dah?"*  
    FinBot: *"Waduh [Nickname], berdasarkan catatan lo, lo paling banyak boncos di kategori **Makanan & Minuman** totalnya Rp450.000, terutama pas lo jajan Mie Gacoan & Kopi tempo hari. Kurang-kurangin checkout delivery ya!"*
  - User: *"Kira-kira gue bisa checkout wishlist gue kapan?"*  
    FinBot: *"Kalo gaya hidup lo tetep hemat kayak minggu ini, wishlist nomor satu lo (**Sepatu Vans** - Rp800.000) diproyeksiin bisa kebeli sekitar **24 Oktober** nanti. Gass pertahanin streak hemat lo!"*
* **Offline / No API Key Fallback**:
  - Jika offline atau API key LLM belum dikonfigurasi, FinBot memiliki *Local Query Matcher* berbasis pola regex untuk tetap menjawab pertanyaan saldo, pengeluaran terbesar, dan status wishlist secara instan.

---

## 8. Skema Data & Arsitektur Penyimpanan

### 8.1 Model Database Prisma (`prisma/schema.prisma`)
```prisma
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
  nickname  String
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

### 8.2 IndexedDB Schema (Local-First)
- Store `transactions`: Menyimpan pemasukan dan pengeluaran secara lokal.
- Store `wishlists`: Menyimpan item wishlist secara lokal.
- Store `sync_queue`: Menyimpan antrean mutasi offline untuk dikirim ke `/api/sync` ketika online (Last-Write-Wins).

---

## 9. Desain Standar Ikonografi & UI
- **Tanpa Emoji/Emote Mentah**: Seluruh tombol aksi, tab navigasi, dan indikator status menggunakan ikon dari library **Lucide React**.
- **Tema & Tipografi**: Menjaga estetika clean modern Finoch dengan palet Navy / Warm Cream, font Bricolage Grotesque / Inter, dan kartu bergaya teratur.

---

## 10. Strategi Migrasi & Rencana Eksekusi

1. **Pembersihan Modul Legacy**:
   - Menghapus 10 direktori rute dan komponen yang tidak lagi diperlukan.
   - Menghapus skema tabel legacy di Prisma dan membuat migrasi baru.
2. **Implementasi Fondasi Data**:
   - Update model `Transaction`, `Wishlist`, dan `Profile` (nickname).
   - Sinkronisasi antrean IndexedDB dan endpoint `/api/sync`.
3. **Penyusunan Onboarding Baru**:
   - Komponen Card, Typewriter animation, avatar FinBot, dan input nickname.
4. **Implementasi Halaman Transaksi**:
   - `/pemasukan`: Voice, OCR bukti transfer, manual form, riwayat.
   - `/pengeluaran`: Voice, OCR struk belanja, manual form, riwayat.
5. **Implementasi Wishlist**:
   - Form wishlist, integrasi sisa saldo dan dynamic delay calculation.
6. **Implementasi Beranda**:
   - Sapaan nickname, ringkasan saldo, Gen-Z insight engine, dan widget Streak hemat.
7. **Implementasi FinBot**:
   - Persona Gen Z, snapshot generator data database, dan chat interface.
8. **Pengujian & Verifikasi**:
   - Update test suite unit & integrasi untuk seluruh rute dan engine baru.
