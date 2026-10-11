<div align="center">

  <img src="public/finoch-logo.svg" alt="Finoch.id Logo" width="340" />

  <p><strong>Sistem Operasi Finansial Cerdas, Voice-Native & Local-First Khusus Mahasiswa dan Anak Kost Indonesia</strong></p>

  <p>
    <a href="https://github.com/Sohibbal/finoch/actions"><img src="https://img.shields.io/badge/Build-Passing-10B981?style=for-the-badge&logo=githubactions&logoColor=white" alt="Build Status" /></a>
    <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-539%20Passed-2563EB?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest 539 Passed" /></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js%2015-App%20Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React%2019-Strict%20Mode-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript%205.8-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5.8" /></a>
    <a href="https://web.dev/progressive-web-apps/"><img src="https://img.shields.io/badge/PWA-Offline%20Ready-F59E0B?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" /></a>
  </p>

  <p>
    <a href="#-kenapa-finoch-hadir-the-problem">Latar Belakang</a> •
    <a href="#-10-senjata-finansial-anak-kost">10 Fitur Unggulan</a> •
    <a href="#-arsitektur-sistem--diagram">Arsitektur</a> •
    <a href="#-teknologi-dan-stack">Tech Stack</a> •
    <a href="#-panduan-instalasi--menjalankan">Instalasi</a> •
    <a href="#-cakupan-pengujian-539-tests">Pengujian</a> •
    <a href="#-privasi--keamanan">Privasi</a>
  </p>

</div>

---

## 🎯 Kenapa Finoch Hadir? (The Problem)

Mahasiswa dan anak kost di Indonesia sering mengalami fenomena **"krisis tanggal tua"** atau uang saku habis sebelum waktunya. Masalah ini hampir tidak pernah disebabkan oleh pembelian barang mewah, melainkan oleh dinamika harian khas kehidupan kampus:

1. **Bocor Halus (Micro-Expense Leaks)**  
   Biaya admin transfer antar-bank (Rp2.500), biaya parkir harian (Rp2.000 × 3), es teh jumbo (Rp5.000), dan biaya *top-up* e-wallet yang tidak pernah dicatat. Dalam sebulan, kebocoran mikro ini mencapai **Rp400.000 – Rp800.000** tanpa disadari.
2. **Friksi Pencatatan Manual yang Melelahkan**  
   Aplikasi keuangan konvensional meminta pengguna mengetik manual, memilih dropdown kategori rumit, dan mengisi form bertingkat saat tangan sedang memegang belanjaan atau baru turun dari motor. Akibatnya, pencatatan ditinggalkan setelah 3 hari.
3. **Kekacauan Uang Kuliah Tunggal (UKT) & Biaya Kost**  
   Uang kiriman semesteran dari orang tua sering tercampur dalam satu rekening operasional harian. Ketika tagihan sewa kost atau jadwal pembayaran UKT tiba, uang tersebut sudah tergerus tanpa rencana cadangan (*sinking fund*).
4. **Talangan Makan Bareng & Sungkan Menagih (Split Bill Awkwardness)**  
   Makan bersama teman sekelas atau nongkrong sering ditalangi oleh satu orang. Menghitung pembagian porsi manual beserta pajak/service resto memakan waktu, dan rasa sungkan menagih teman sendiri berujung pada uang yang menguap menjadi utang macet.
5. **Belanja Impulsif Akibat Flash Sale & FOMO**  
   Godaan checkout barang diskon tengah malam yang sebenarnya tidak dibutuhkan dan mengorbankan anggaran makan berminggu-minggu.

**Finoch (Financial Operations for Campus Habitat)** hadir sebagai solusi *all-in-one*: aplikasi keuangan bertenaga suara lokal (*voice-first*), bekerja tanpa sinyal (*local-first offline PWA*), memahami bahasa gaul tongkrongan Indonesia, dan dirancang khusus dengan perangkat bertahan hidup anak kost.

---

## 🌟 10 Senjata Finansial Anak Kost

### 1. 🎙️ Hybrid Voice-First Fast Logging
Catat transaksi cukup dengan berbicara dalam bahasa santai Indonesia sehari-hari.
- **Zero-Latency Recognition**: Menggunakan native browser Web Speech API untuk konversi suara instan (<50ms).
- **On-Device Whisper Fallback**: Didukung model AI Whisper WASM on-device via `@xenova/transformers` saat offline atau tanpa koneksi internet.
- **Indonesian Slang & Number Normalizer**:
  - *"Beli nasi padang ayam gulai goceng sama es teh duaribu"* &rarr; Makanan & Minuman: Rp7.000
  - *"Top up gopay lima puluh rebu bayar sewa bensin ceban cash"* &rarr; Memisahkan transaksi majemuk (*transaction splitter*) secara akurat.
  - Mengenal terminologi gaul: `goceng` (5.000), `ceban` (10.000), `gocap` (50.000), `seceng` (1.000), `nopek` (200.000), dll.

### 2. 🧾 Client-Side OCR Struk Belanja (Tesseract.js)
Foto atau unggah struk belanja dari Indomaret, Alfamart, minimarket kampus, atau warung makan.
- Pemrosesan gambar 100% dilakukan secara lokal di perangkat pengguna melalui *Web Workers* Tesseract.js.
- Ekstraksi otomatis nama merchant, daftar item belanjaan, subtotal, dan tanggal transaksi tanpa mengirim gambar pribadi ke server cloud luar.

### 3. 💳 Multi-Account Dompet Mahasiswa (Student Wallets)
Kelola alokasi saldo fisik dan digital secara terpisah:
- **Kategori Akun**: Uang Tunai (Cash di Dompet), Rekening Bank (BCA, Mandiri, BRI, Bank Jago), dan E-Wallet (GoPay, ShopeePay, DANA, OVO).
- **Saldo Terhubung ke Pengeluaran**: Setiap pengeluaran (suara, struk, manual) dibebankan ke dompet default atau dompet pilihan, sehingga saldo otomatis berkurang. Saldo dihitung dari saldo awal ± transfer − pengeluaran, jadi edit/hapus transaksi langsung terkoreksi.
- **Transfer Antar-Akun**: Catat mutasi pemindahan dana (misal: tarik tunai ATM atau *top-up* e-wallet) dengan perhitungan saldo riil otomatis.
- **Tampilan Fleksibel**: Tampilan kartu ringkas untuk mobile dan *Bento Grid 3-kolom* untuk layar desktop.

### 4. ✉️ Amplop Pos Anggaran (Envelope Budgeting)
Metode pembagian uang saku ke dalam pos-pos amplop terisolasi:
- **Alokasi Pos Kunci**: Makan & Minum, Uang Kost & Utilitas, Transportasi, Kuliah & Fotokopi, Hiburan/Nongkrong, dan Dana Cadangan.
- **Threshold Health Indicator**: Peringatan visual warna bertingkat:
  - 🟢 **Sehat**: Pengeluaran < 75% dari anggaran.
  - 🟡 **Waspada**: Pengeluaran 75% – 90%.
  - 🔴 **Kritis (Overspent)**: Melebihi plafon amplop dengan saran realokasi saldo dari pos lain.

### 5. 🛡️ Tagihan Kost Shield & Kalender Jatuh Tempo
Perisai perlindungan pengeluaran wajib bulanan agar uang sewa kamar tidak terpakai:
- **Pengingat Jatuh Tempo**: Sewa kamar kost, iuran WiFi bersama, token listrik prabayar, dan kuota internet.
- **Status Perlindungan**: Memastikan porsi uang sewa kost terkunci dalam perhitungan saldo bebas (*safe-to-spend*).
- **Matriks Kalender Bulanan**: Visualisasi tanggal kritis pembayaran tagihan dalam sebulan.

### 6. 🤝 Buku Kasbon & Split Bill Resto (Kalkulator Talangan)
Solusi tuntas masalah patungan makan bareng tanpa rasa canggung:
- **Kalkulator Resto Proporsional**: Masukkan harga makanan masing-masing teman, diskon promo, pajak restoran (PB1 10%), dan *service charge*.
- **Pencatat Piutang Otomatis**: Bagian teman dari split bill langsung masuk ke **Buku Kasbon** sebagai piutang (satu buku utang-piutang, bukan dua).
- **Generator Pesan WhatsApp Instan**: Buat draf pesan rincian tagihan yang rapi, transparan, dan sopan dalam sekali klik untuk dikirim ke grup WhatsApp.

### 7. ⏳ Wishlist Tunda (Anti-Impulsive 7-Day Cooling Off)
Rem darurat psikologis untuk menghentikan kebiasaan *checkout impulsif*:
- **Cooling-Off Period**: Setiap barang keinginan dikunci dalam masa tunggu 7 hari sebelum tombol beli diaktifkan.
- **Impulse Score Evaluation**: Kuesioner mini 3 pertanyaan untuk menguji apakah barang tersebut merupakan kebutuhan esensial atau sekadar gengsi sesaat.
- **Trophy Tabungan**: Menampilkan total uang yang berhasil diselamatkan ketika pengguna membatalkan barang impian.

### 8. 🎓 Tabungan Sinking Fund UKT (Tuition Target)
Sistem tabungan terisolasi untuk biaya kuliah semesteran:
- **Velocity Tracker**: Menghitung kecepatan menabung harian/mingguan yang dibutuhkan berdasarkan sisa hari menuju jadwal pembayaran UKT kampus.
- **Proyeksi Realistis**: Rekomendasi nominal yang harus disisihkan dari setiap kiriman orang tua agar target tercapai tepat waktu tanpa membebani biaya makan harian.

### 9. 🍲 Kalkulator Masak Sendiri vs Warteg
Optimalisasi bujet konsumsi anak kost berbasis data riil:
- **Simulasi Biaya Bahan Baku**: Bandingkan harga belanja sayur, beras, dan lauk mentah di pasar tradisional vs harga makan di warteg/angkringan per porsi.
- **Rekomendasi Pola Hibrida**: Analisis otomatis kapan memasak sendiri paling menghemat uang (misal: sarapan & makan malam) dan kapan beli di luar lebih efisien.

### 10. 🔍 Audit Bocor Halus & Laporan Transparansi Ortu
- **Deteksi Kebocoran Mikro**: Algoritma cerdas yang mendeteksi transaksi nominal kecil (< Rp15.000) yang terjadi berulang kali (biaya admin, parkir liar, jajan minuman manis) dan memproyeksikan akumulasi kerugian dalam 1 tahun.
- **Laporan Transparansi Orang Tua**: Susun laporan ringkasan pemasukan dan pengeluaran bulanan dalam format pesan WhatsApp yang santun atau cetak dokumen PDF resmi sebagai bukti pertanggungjawaban dana beasiswa/kiriman keluarga.

---

## ⚡ Mode Krisis & Kelangsungan Finansial

### ⏱️ Financial Runway (Berapa Hari Saldo Bertahan?)
Menghitung daya tahan saldo kas aktif berdasarkan kecepatan pengeluaran harian (*burn rate*). Memberikan perkiraan konkret dalam format:
> *"Dengan saldo Rp210.000 dan rata-rata belanja Rp30.000/hari, kamu aman hingga 7 hari ke depan (13 Oktober)."*

### 🚨 Mode Bertahan Hidup (Survival Mode)
Saat saldo menipis di akhir bulan atau berada di bawah ambang batas darurat:
- Mengaktifkan antarmuka darurat dengan pembatasan alokasi ketat: **Maksimal Rp10.000 – Rp15.000 per hari**.
- Membekukan seluruh pos anggaran non-primer (nongkrong, hiburan, belanja).
- Menyediakan rekomendasi menu hemat darurat anak kost (nasi telur, tempe orek warteg, oatmeal) hingga hari kiriman berikutnya.

---

## 🏗️ Arsitektur Sistem & Diagram

Finoch dibangun di atas paradigma **Local-First Architecture**. Seluruh data transaksi, mutasi dompet, dan profil anggaran tersimpan terlebih dahulu di IndexedDB lokal browser pengguna menggunakan library `idb`. Sinkronisasi ke database cloud PostgreSQL berjalan di latar belakang (*background reconciliation*) dengan enkripsi stateless JWT.

```mermaid
flowchart TD
    subgraph ClientLayer["Klien PWA (Browser / Mobile / Desktop)"]
        VoiceInput["🎙️ Voice Input\n(Web Speech API / Whisper)"]
        OCRInput["🧾 Struk Belanja\n(Tesseract.js OCR)"]
        ManualInput["⌨️ Fast Form Input"]
        
        Parser["🧠 Indonesian NLP Parser\n(Slang & Number Normalizer)"]
        Splitter["✂️ Transaction Splitter\n(Multi-item detection)"]
        
        VoiceInput --> Parser
        OCRInput --> Parser
        ManualInput --> Parser
        Parser --> Splitter
        
        Engines["⚙️ Core Financial Engines\n- Wallet Engine\n- Budget Engine\n- Debt & Split Bill\n- Runway & Survival\n- UKT Sinking Fund"]
        Splitter --> Engines
        
        IDB[("💾 Local IndexedDB\n(Local-First Cache & Offline State)")]
        Engines <--> IDB
    end

    subgraph SyncLayer["Lapisan Sinkronisasi & API"]
        SyncWorker["🔄 Sync Reconciliation Client\n(Background Reconciler)"]
        IDB --> SyncWorker
        NextAPI["⚡ Next.js 15 Route Handlers\n(/api/sync, /api/auth, /api/copilot)"]
        SyncWorker <-->|JWT Auth Header| NextAPI
    end

    subgraph CloudLayer["Cloud Database & Services"]
        PrismaORM["💎 Prisma ORM v6"]
        PostgresDB[("🐘 PostgreSQL 16 DB\n(Persistent Cloud Storage)")]
        LLM["🤖 Optional LLM Fallback\n(OpenAI Compatible)"]
        
        NextAPI --> PrismaORM
        PrismaORM --> PostgresDB
        NextAPI -.->|Optional Copilot| LLM
    end
```

---

## 🛠️ Teknologi dan Stack

| Kategori | Teknologi | Deskripsi / Peran |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15.2 (App Router)** | Fullstack React framework dengan server components & route handlers |
| **Frontend Runtime**| **React 19** | Antarmuka reaktif dengan performa rendering modern |
| **Bahasa** | **TypeScript 5.8** | Static typing menyeluruh dengan konfigurasi mode ketat (`strict: true`) |
| **Styling & UI** | **Tailwind CSS 3.4** | Desain utility-first dengan sistem tema kustom Dark Mode & Light Cream |
| **Ikonografi** | **Lucide React** | Koleksi ikon SVG modern dan konsisten |
| **Data Visual** | **Recharts 3.10** | Grafik interaktif tren pengeluaran, komposisi kategori, dan bento stats |
| **Suara / ASR** | **Web Speech API + Transformers.js** | Hybrid voice recognition (Native latency rendah + Offline Whisper WASM) |
| **OCR Struk** | **Tesseract.js 7.0** | Pengenalan karakter teks optik pada struk belanja di sisi klien |
| **Penyimpanan Lokal**| **IndexedDB (`idb` v8)** | Penyimpanan basis data local-first untuk akses offline instan |
| **Database & ORM** | **Prisma 6.4 + PostgreSQL 16** | Schema modeling relasional dan migrasi basis data aman |
| **Autentikasi** | **Jose & BCrypt.js** | Stateless JSON Web Token (JWT) dengan enkripsi password standar industri |
| **Testing** | **Vitest 3.0 + Fake IndexedDB** | Suite pengujian unit dan integrasi ultra-cepat berbasis ESM |

---

## 📁 Struktur Repositori

```text
finoch/
├── prisma/                   # Skema basis data Prisma & migrasi PostgreSQL
│   ├── schema.prisma         # Model User, Expense, FinancialProfile, UserDocument, dll.
│   └── migrations/           # Migrasi SQL (jalankan `prisma migrate deploy`)
├── public/                   # Aset publik, favicon, manifest PWA, dan ikon
│   ├── finoch-logo.svg       # Master SVG Logo resmi Finoch
│   ├── finoch-symbol.svg     # Master SVG Symbol resmi
│   └── sw.js                 # Service worker cache offline
├── logo-design/              # Spesifikasi vektor brand identity & tipografi
├── scripts/                  # Skrip utilitas (copy WebAssembly, dev:lan HTTPS untuk tes di HP)
├── src/
│   ├── app/                  # Rute Halaman Next.js App Router
│   │   ├── (app)/            # Halaman aplikasi (wajib login) dengan satu layout & AppShell bersama
│   │   ├── api/              # Route handler: auth, expenses, sync (+ sync/documents), copilot, OCR
│   │   ├── audit/            # Halaman Audit Bocor Halus
│   │   ├── bills/            # Halaman Tagihan Kost Shield
│   │   ├── budget/           # Halaman Amplop Pos Anggaran
│   │   ├── copilot/          # Halaman AI Financial Copilot
│   │   ├── dashboard/        # Halaman Dashboard Utama Mahasiswa
│   │   ├── debts/            # Halaman Buku Kasbon & Talangan
│   │   ├── goals/            # Halaman Target Tabungan
│   │   ├── insights/         # Halaman Wawasan & Analisis AI
│   │   ├── meal-calc/        # Halaman Kalkulator Masak vs Warteg
│   │   ├── profile/          # Halaman Profil & Preferensi Pengguna
│   │   ├── reports/          # Halaman Laporan & Ekspor Ortu
│   │   ├── simulator/        # Halaman What-If Simulator
│   │   ├── split-bill/       # Halaman Split Bill Resto Interaktif
│   │   ├── streak/           # Halaman Streak Hemat & Tantangan
│   │   ├── ukt-savings/      # Halaman Tabungan Sinking Fund UKT
│   │   ├── wallets/          # Halaman Dompet Multi-Akun
│   │   ├── wishlist/         # Halaman Wishlist Tunda (Anti-Impulsif)
│   │   ├── manifest.ts       # Web app manifest PWA (dihasilkan Next.js)
│   │   ├── layout.tsx        # Layout root aplikasi (PWA provider & brand)
│   │   └── page.tsx          # Landing page publik interaktif
│   ├── components/           # Komponen UI Modular
│   │   ├── brand/            # Komponen Logo Finoch adaptive tema
│   │   ├── layout/           # Sidebar, Breadcrumbs, BottomNav, PWA Button
│   │   ├── wallets/          # Komponen UI Dompet & Modal Transfer
│   │   ├── budget/           # Komponen UI Amplop Anggaran
│   │   ├── bills/            # Komponen UI Tagihan & Matriks Kalender
│   │   ├── debts/            # Komponen UI Buku Kasbon & Pembayaran
│   │   ├── wishlist/         # Komponen UI Wishlist & Trophy Card
│   │   ├── ukt/              # Komponen UI Tabungan UKT & Modal Setor
│   │   ├── meal-calc/        # Komponen UI Kalkulator Makanan
│   │   ├── audit/            # Komponen UI Audit Kebocoran
│   │   ├── reports/          # Komponen UI Laporan & Cetak PDF/WA
│   │   ├── streak/           # Komponen UI Kalender Streak & Badge Api
│   │   └── dashboard/        # Runway Card, Survival Mode Card, Bento Stats
│   ├── lib/                  # Logika Bisnis & Mesin Perhitungan
│   │   ├── financial/        # Engine Perhitungan Matematika Finansial
│   │   ├── storage/          # IndexedDB (pengeluaran) & localStorage per-user (fitur lain)
│   │   ├── sync/             # Sinkronisasi pengeluaran & dokumen fitur ke server
│   │   ├── nlp/              # Indonesian Slang Parser & Number Normalizer
│   │   └── ocr/              # Tesseract Struk Parser
│   └── types/                # Kontrak Tipe Data TypeScript
├── src/middleware.ts         # Proteksi rute aplikasi (verifikasi JWT)
└── tests/                    # 94 File Test Suite (539 Vitest Unit, API & UI Tests)
```

---

## 🚀 Panduan Instalasi & Menjalankan

### Prasyarat
- **Node.js**: Versi `18.18.0` atau yang lebih baru (disarankan Node.js 20 LTS atau 22).
- **pnpm** (lockfile proyek adalah `pnpm-lock.yaml`).
- **PostgreSQL** lokal, atau **Docker** untuk menjalankannya secara instan.

### 1. Kloning Repositori
```bash
git clone https://github.com/Sohibbal/finoch.git
cd finoch
```

### 2. Instal Dependensi
```bash
pnpm install
```
> *Catatan:* Perintah `postinstall` akan secara otomatis menjalankan skrip `copy-wasm.mjs` untuk menyalin modul WebAssembly Whisper ke direktori `public/wasm/`.

### 3. Konfigurasi Environment Variables
Salin berkas template environment:
```bash
cp .env.example .env
```
Sesuaikan variabel di dalam `.env`:
```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/voicash?schema=public"

# Secret key untuk JWT Session — WAJIB, minimal 32 karakter (server menolak jalan tanpa ini)
# Buat acak, misalnya: openssl rand -hex 32
JWT_SECRET="ganti-dengan-kunci-rahasia-jwt-kamu-yang-panjang-dan-aman"

# Environment
NODE_ENV="development"

# LLM Opsional (opsional untuk asisten cloud tambahan)
OPENAI_API_KEY=""
```

### 4. Menjalankan Database PostgreSQL (Docker)
Jika ingin menggunakan basis data lokal via Docker:
```bash
docker-compose up -d
```
Lalu terapkan migrasi ke basis data:
```bash
npx prisma migrate deploy
```
> *Basis data lama yang dulu dibuat dengan `prisma db push`:* tandai dulu migrasi baseline sebagai sudah diterapkan, lalu deploy:
> `npx prisma migrate resolve --applied 20261011000000_baseline && npx prisma migrate deploy`

### 5. Jalankan Server Pengembangan
```bash
pnpm dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000). Semua halaman aplikasi wajib login; daftar akun, isi onboarding, lalu mulai mencatat.

### 6. Tes Langsung di HP (Wi-Fi yang sama)
```bash
pnpm dev:lan
```
Terminal menampilkan alamat seperti `https://192.168.x.x:3100`. Buka di HP, lalu pilih **Lanjutan → Lanjutkan** pada peringatan sertifikat (sertifikat self-signed dibuat otomatis di `.certs/`). HTTPS diperlukan karena mikrofon & kamera (Bicara, Scan Struk) hanya aktif di origin aman.

### 7. Mode Demo (untuk presentasi)
Aktifkan **Mode Demo (data contoh)** di halaman **Profil**. Aplikasi terisi dompet, kasbon, tagihan, UKT, wishlist, target, dan ±70 pengeluaran contoh selama 2 bulan. Data demo disimpan terpisah: data asli tetap aman, tidak tercampur, dan data demo tidak pernah disinkron ke server. Tombol **Reset data demo** mengembalikan data contoh ke awal.

---

## 🧪 Cakupan Pengujian (539 Tests)

Finoch mengutamakan keandalan matematika finansial dan integritas data pengguna. Seluruh modul diuji secara ketat menggunakan **Vitest** dengan mock IndexedDB (`fake-indexeddb`):

```bash
# Menjalankan seluruh test suite sekali jalan
pnpm test

# Menjalankan test dalam mode watch interaktif
pnpm test:watch

# Pemeriksaan tipe & lint
pnpm typecheck
pnpm lint
```

### Rangkuman Distribusi Pengujian
```text
Test Files  94 passed (94)
Tests       539 passed (539)
Status      100% Passed
```

- **Financial Engines**: Kalkulasi saldo dompet turunan, amplop, split bill (pembagian pas ke total), tagihan, UKT, runway, streak, audit bocor halus — termasuk tanggal lokal WIB.
- **Storage & Sync**: Isolasi data per user di perangkat bersama, mode demo terpisah, antrean sync dengan batas retry, sinkronisasi dokumen dua perangkat (last-write-wins, perangkat baru tidak menimpa data server).
- **NLP & OCR**: Angka bahasa Indonesia ("seratus lima puluh ribu", "dua setengah juta", "goceng"), pemisah transaksi majemuk, total & desimal struk.
- **API & Security**: Middleware rute, JWT wajib, rate limit login, validasi input, guard open-redirect, OCR & LLM endpoint.
- **UI, PWA & Hooks**: App shell bersama, dashboard, service worker (cache aman), siklus hidup mikrofon & Whisper.

---

## 🎨 Identitas Desain & Brand System

Desain antarmuka Finoch mengadopsi estetika **Editorial Dark-Tech & Tactile Minimalism**:

| Atribut | Spesifikasi |
| :--- | :--- |
| **Tipografi Utama** | `Plus Jakarta Sans` (Teks judul display yang tegas, modern, dan berwibawa) |
| **Tipografi Angka & Data** | `JetBrains Mono` (Angka mata uang, nominal rupiah, metrik, dan badge status) |
| **Warna Latar Gelap** | `#060B14` & `#0B192C` (Deep Nocturne Navy dengan kontras tinggi) |
| **Warna Aksen Utama** | `#2563EB` & `#38BDF8` (Electric Cobalt Blue & Cyan Prism) |
| **Warna Aksen Sukses** | `#10B981` (Emerald Green untuk saldo surplus, streak, dan target tercapai) |
| **Warna Latar Terang** | `#FAF8F5` (Warm Cream Editorial untuk keterbacaan dokumen cetak) |

Logo resmi dan panduan aset vektor lengkap tersimpan di direktori [`logo-design/`](logo-design/).

---

## 🔒 Privasi & Keamanan

- **Zero-Telemetry Tracking**: Finoch tidak melacak data analitik perilaku pengguna dan tidak menyematkan tracker pihak ketiga.
- **On-Device Audio Processing**: Rekaman suara untuk pencatatan diolah di browser pengguna. Suara tidak disimpan atau diperjualbelikan.
- **Offline First**: Catatan keuangan Anda adalah milik Anda. Aplikasi tetap dapat berfungsi penuh mencatat pengeluaran meskipun sedang tidak memiliki kuota internet.
- **Sinkronisasi Akun**: Saat login, pengeluaran dan data fitur (dompet, kasbon, tagihan, amplop, UKT, wishlist, target) disinkron ke server milik Anda agar aman saat ganti HP. Data di satu perangkat dipisah per akun, sehingga perangkat bersama tidak membocorkan data antar pengguna.
- **Keamanan Sesi**: Cookie sesi `httpOnly`, rute aplikasi diproteksi middleware, `JWT_SECRET` wajib, dan percobaan login dibatasi.

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT License**. Lihat berkas `LICENSE` untuk informasi lebih lanjut.

---

<div align="center">
  <p>Dibuat dengan dedikasi untuk seluruh mahasiswa dan anak kost Indonesia 🇮🇩</p>
  <p><strong><a href="https://github.com/Sohibbal/finoch">Finoch.id</a></strong> — <em>Stop bokek akhir bulan, kendalikan uang saku dari sekarang.</em></p>
</div>
