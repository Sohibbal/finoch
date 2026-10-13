<div align="center">

  <h1>Finoch</h1>
  <p><strong>Sistem Manajemen Finansial Cerdas, Voice-First, dan Local-First untuk Mahasiswa</strong></p>

  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js%2015-App%20Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React%2019-Strict%20Mode-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript%205.8-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.8" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS%203.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
    <a href="https://web.dev/progressive-web-apps/"><img src="https://img.shields.io/badge/PWA-Offline%20Ready-F59E0B?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" /></a>
  </p>

</div>

---

## Identitas Developer

- Akhlaqul Muhammad Fadwa | 2307112834 | Teknik Informatika | Universitas Riau
- M. Sohibbal | 2307135312 | Teknik Informatika | Universitas Riau
- Rizkillah Ramanda Sinyo | 2307126144 | Teknik Informatika | Universitas Riau

---

## Ringkasan Proyek

Finoch (Financial orchestration) adalah aplikasi pencatatan dan pengelolaan keuangan pribadi yang dirancang untuk mengatasi persoalan kebocoran pengeluaran harian mahasiswa. Aplikasi mengusung konsep **Voice-First** dan **Local-First**, memungkinkan pencatatan transaksi dilakukan secara instan melalui suara percakapan santai maupun foto struk belanja, serta tetap berfungsi penuh secara offline tanpa ketergantungan koneksi internet.

---

## Fitur Utama

### 1. Pencatatan Transaksi Berbasis Suara (Voice-First Logging)
- Konversi ucapan ke teks secara real-time menggunakan Web Speech API bawaan browser dengan latensi rendah.
- Fallback on-device menggunakan model Whisper ONNX/WASM untuk pemrosesan suara secara offline tanpa mengirim rekaman ke server eksternal.
- Normalisasi bahasa percakapan Indonesia dan istilah slang (seperti *goceng*, *ceban*, *gocap*, *seceng*) serta ekstraksi nominal transaksi secara otomatis.

### 2. Pemindaian Struk dan Bukti Transaksi (Client-Side OCR)
- Ekstraksi teks dari foto struk belanja fisik atau bukti transaksi digital langsung di browser menggunakan Tesseract.js.
- Otomatisasi pengisian nominal, nama item belanjaan, dan tanggal transaksi tanpa biaya server pihak ketiga.

### 3. Manajemen Pemasukan dan Pengeluaran Simetris
- Halaman terdedikasi untuk pencatatan pemasukan (`/pemasukan`) dan pengeluaran (`/pengeluaran`).
- Opsi input fleksibel: Suara (Voice), Scan (OCR), dan Formulir Manual Cepat.
- Kategorisasi otomatis berdasarkan jenis kebutuhan mahasiswa (Makanan & Minuman, Transportasi, Kebutuhan Kost, Pendidikan, Hiburan, dan lainnya).

### 4. Kalkulator Jatah Harian dan Pemantau Runway Finansial
- Perhitungan sisa jatah belanja harian secara otomatis berdasarkan sisa anggaran dan sisa hari dalam bulan berjalan.
- Indikator peringatan dini agar pengeluaran harian tidak melampaui batas aman (*anti-boncos*).

### 5. Asisten Finansial Cerdas (FinBot Copilot)
- Asisten konsultasi keuangan pribadi dengan persona santai dan kontekstual.
- Menggunakan analisis berbasis aturan lokal dan dukungan fallback model bahasa (LLM) yang kompatibel dengan OpenAI.

### 6. Wishlist Tunda (Anti-Impulsive Buying)
- Mekanisme penundaan pembelian barang keinginan untuk meredam belanja impulsif.
- Pelacak target tabungan dengan indikator progres akumulasi dana menuju harga barang yang diinginkan.

### 7. Arsitektur Local-First dan PWA Offline-Ready
- Penyimpanan lokal di perangkat menggunakan IndexedDB (`idb`), memastikan kecepatan respons instan dan kapabilitas offline penuh.
- Sinkronisasi latar belakang (*background sync*) ke database PostgreSQL ketika perangkat kembali terhubung ke jaringan internet.
- Standar Progressive Web App (PWA) yang dapat dipasang di layar utama Android, iOS, maupun desktop.

---

## Tech Stack

| Lapisan | Teknologi | Peran |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15.2 (App Router) & React 19 | Server and Client Components, Routing, dan Layouting |
| **Bahasa Pemrograman** | TypeScript 5.8 | Pengetikan statis ketat (Strict Mode) di seluruh codebase |
| **Styling** | Tailwind CSS 3.4 | Utilitas styling modern dengan dukungan tema Light dan Dark |
| **Penyimpanan Lokal** | IndexedDB via `idb` | Penyimpanan data lokal di sisi browser untuk kapabilitas offline |
| **Database & ORM** | PostgreSQL 16 & Prisma ORM 6.4 | Manajemen data relasional dan migrasi skema basis data |
| **Pemrosesan Suara & Teks** | Web Speech API & Transformers.js | Pengenalan suara instan dan model Whisper on-device |
| **OCR** | Tesseract.js 7.0 | Optical Character Recognition struk di browser pengguna |
| **Autentikasi** | Jose & BCrypt.js | Stateless JSON Web Token (JWT) berbasis cookie HTTP-only |
| **Pengujian** | Vitest 3.0 & Fake IndexedDB | Pengujian unit, integrasi, dan logika finansial |

---

## Struktur Direktori

```text
finoch/
├── prisma/               # Skema Prisma dan berkas migrasi PostgreSQL
│   ├── schema.prisma     # Definisi model User, Profile, Transaction, Wishlist
│   └── migrations/       # Riwayat migrasi SQL
├── public/               # Aset statis, ikon PWA, dan WebAssembly Whisper
├── scripts/              # Skrip pemeliharaan, copy-wasm, dan utilitas development
├── src/
│   ├── app/              # Halaman Next.js App Router
│   │   ├── (app)/        # Rute utama yang diproteksi (Dashboard, Pemasukan, Pengeluaran, Copilot, Wishlist, Profile)
│   │   ├── api/          # Route Handler (Auth, Profile, Transactions, Copilot, Sync)
│   │   ├── login/        # Halaman autentikasi masuk
│   │   ├── register/     # Halaman registrasi akun baru
│   │   ├── onboarding/   # Alur onboarding pengguna baru
│   │   └── page.tsx      # Landing page publik
│   ├── components/       # Komponen UI modular
│   ├── hooks/            # Custom hooks React
│   ├── lib/              # Modul logika bisnis (NLP, OCR, storage, sync, audio, LLM)
│   ├── types/            # Definisi kontrak tipe TypeScript
│   └── workers/          # Web Workers untuk pemrosesan AI lokal
├── tests/                # Test suite Vitest
└── package.json          # Manajemen dependensi dan skrip proyek
```

---

## Panduan Instalasi dan Menjalankan Proyek

### Prasyarat
- Node.js versi 18.18.0 atau lebih baru (disarankan Node.js 20 LTS atau 22).
- Package manager `pnpm` (versi 9.x).
- PostgreSQL lokal atau instance database di cloud (seperti Railway).

### 1. Kloning Repositori
```bash
git clone https://github.com/Sohibbal/finoch.git
cd finoch
```

### 2. Instalasi Dependensi
```bash
pnpm install
```

### 3. Konfigurasi Environment Variables
Salin berkas template environment:
```bash
cp .env.example .env
```

Konfigurasikan variabel lingkungan di berkas `.env`:
```env
# Koneksi Database PostgreSQL
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/voicash?schema=public"

# Kunci Rahasia JWT (Wajib minimal 32 karakter)
JWT_SECRET="masukkan_string_acak_rahasia_minimal_32_karakter"

# Mode Lingkungan
NODE_ENV="development"

# Konfigurasi LLM Opsional (Kosongkan jika hanya memakai fallback lokal)
OPENAI_API_KEY=""
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"
```

### 4. Migrasi Basis Data
Terapkan skema ke database PostgreSQL:
```bash
pnpm prisma migrate deploy
```

*(Opsional)* Mengisi data demo untuk pengujian awal:
```bash
pnpm seed:demo
```

### 5. Menjalankan Server Pengembangan
```bash
pnpm dev
```
Akses aplikasi melalui peramban di `http://localhost:3000`.

### 6. Menjalankan Pengujian
```bash
pnpm test
```

---

## Lisensi

Proyek ini didistribusikan di bawah lisensi MIT License.
