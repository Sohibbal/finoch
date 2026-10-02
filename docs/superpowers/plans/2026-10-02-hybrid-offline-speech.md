# Hybrid Offline Speech-to-Text Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengimplementasikan arsitektur hybrid speech-to-text pada VoiCash PWA yang otomatis beralih antara Web Speech API bawaan (saat online) dan model OpenAI Whisper-Tiny quantized lokal via Transformers.js di Web Worker (saat offline), lengkap dengan kontrol pengunduhan model opt-in 39 MB dan audio processor 16kHz mono.

**Architecture:** Perekaman audio dipisahkan berdasarkan konektivitas `navigator.onLine`. Saat online, sistem menggunakan Web Speech API instan. Saat offline dan model telah diunduh, audio ditangkap via `MediaRecorder`, dikonversi ke Float32Array 16kHz mono, dan ditranskripsikan secara lokal di Web Worker menggunakan `@xenova/transformers`. Controller `useHybridSpeech` mengorkestrasi transisi status, progress bar unduhan, dan error handling secara terpadu.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, `@xenova/transformers`, Web Workers, Web Audio API (`AudioContext`), `MediaRecorder`, Vitest.

**Spec:** [`docs/superpowers/specs/2026-10-02-hybrid-offline-speech-design.md`](file:///D:/Project/VoiCash/docs/superpowers/specs/2026-10-02-hybrid-offline-speech-design.md)

## Global Constraints

- Tipografi harus menggunakan Plus Jakarta Sans (`font-sans`).
- Warna harus mengikuti tema biru (`blue-600` / `#2563eb`, `blue-500`, `indigo-600`) dan midnight navy (`#0e1526`, `#080c16`).
- Wajib bebas dari karakter em-dash (`—`).
- Model AI offline hanya boleh diunduh jika pengguna secara eksplisit menekan tombol izin (opt-in) demi menghemat kuota mahasiswa.
- Seluruh 52 pengujian Vitest yang sudah ada harus tetap lulus 100%.

## Review Focus

1. Penanganan saat koneksi internet terputus di tengah pengunduhan model 39 MB (harus memunculkan pesan gagal ramah dan tombol coba ulang tanpa mengorup memori).
2. Perangkat berpindah dari online ke offline saat modal suara sedang terbuka (state `engineMode` harus langsung reaktif memperbarui tampilan badge dan alur rekam).
3. Penanganan saat izin mikrofon belum diberikan atau ditolak di peramban seluler.
4. Kompatibilitas format perekam audio `MediaRecorder` lintas platform (dukungan `audio/webm` dan fallback audio container).
5. Kinerja Web Worker agar inferensi Whisper tidak memblokir render UI utama (menjaga animasi gelombang suara tetap 60 FPS).

---

### Task 1: Instalasi `@xenova/transformers` & Utilitas Pemrosesan Audio 16kHz

**Files:**
- Modify: `package.json`
- Create: `src/lib/audio/audio-processor.ts`
- Create: `tests/audio/audio-processor.test.ts`

- [ ] **Step 1: Install `@xenova/transformers`**
  Jalankan `npm install @xenova/transformers`.

- [ ] **Step 2: Tulis unit test untuk audio processor**
  Buat file `tests/audio/audio-processor.test.ts` untuk menguji:
  - Konversi AudioBuffer / Float32Array ke 16.000 Hz Mono Float32.
  - Normalisasi amplitudo audio jika diperlukan.
  - Penanganan audio kosong atau durasi terlalu pendek.

- [ ] **Step 3: Jalankan test untuk memastikan test gagal (TDD)**
  Jalankan `npx vitest run tests/audio/audio-processor.test.ts` dan pastikan gagal karena implementasi belum dibuat.

- [ ] **Step 4: Buat implementasi `src/lib/audio/audio-processor.ts`**
  Implementasikan fungsi:
  - `resampleTo16kHz(audioBuffer: AudioBuffer): Float32Array`
  - `blobToAudioData(blob: Blob): Promise<Float32Array>`
  - `checkAudioSupport(): { supported: boolean; mimeType: string }`

- [ ] **Step 5: Jalankan test audio processor dan pastikan lulus**
  Jalankan `npx vitest run tests/audio/audio-processor.test.ts`.

- [ ] **Step 6: Commit Task 1**
  Jalankan `git add package.json package-lock.json src/lib/audio/ tests/audio/; git commit -m "feat(audio): add audio-processor for 16kHz mono sampling and install transformers.js"`.

---

### Task 2: Implementasi Web Worker Whisper & Hook `useOfflineWhisper`

**Files:**
- Create: `src/workers/whisper.worker.ts`
- Create: `src/hooks/use-offline-whisper.ts`
- Create: `tests/hooks/use-offline-whisper.test.ts`

- [ ] **Step 1: Tulis unit test untuk `useOfflineWhisper`**
  Buat file `tests/hooks/use-offline-whisper.test.ts` yang memverifikasi:
  - Inisialisasi state awal (`isModelDownloaded: false`, `isDownloading: false`, `downloadProgress: 0`).
  - Pembaruan progress saat menerima pesan progress dari worker.
  - Pemanggilan fungsi `downloadModel` dan `deleteModel`.

- [ ] **Step 2: Jalankan test untuk memastikan test gagal**
  Jalankan `npx vitest run tests/hooks/use-offline-whisper.test.ts`.

- [ ] **Step 3: Buat implementasi `src/workers/whisper.worker.ts`**
  Implementasikan Web Worker yang:
  - Mengimpor `pipeline, env` dari `@xenova/transformers`.
  - Mengonfigurasi `env.allowLocalModels = false`.
  - Mendengarkan pesan `load`, `transcribe`, `check_status`, dan `delete`.
  - Memuat pipeline `automatic-speech-recognition` dengan model `Xenova/whisper-tiny` (quantized).
  - Mengirimkan event callback progress download (0-100%).
  - Mentranskripsikan audio Float32Array dengan bahasa `indonesian` dan task `transcribe`.

- [ ] **Step 4: Buat implementasi `src/hooks/use-offline-whisper.ts`**
  Implementasikan hook React yang:
  - Menginisialisasi instance Worker di client-side.
  - Mengatur listener pesan dari worker.
  - Menyimpan status persistensi model (apakah sudah pernah diunduh) di `localStorage` / `CacheStorage`.
  - Menyediakan fungsi `downloadModel()`, `deleteModel()`, `transcribe(audioData: Float32Array)`.

- [ ] **Step 5: Jalankan test `useOfflineWhisper` dan pastikan lulus**
  Jalankan `npx vitest run tests/hooks/use-offline-whisper.test.ts`.

- [ ] **Step 6: Commit Task 2**
  Jalankan `git add src/workers/ src/hooks/use-offline-whisper.ts tests/hooks/use-offline-whisper.test.ts; git commit -m "feat(speech): implement whisper web worker and offline whisper hook"`.

---

### Task 3: Implementasi Controller Terpadu `useHybridSpeech`

**Files:**
- Create: `src/hooks/use-hybrid-speech.ts`
- Create: `tests/hooks/use-hybrid-speech.test.ts`

- [ ] **Step 1: Tulis unit test untuk `useHybridSpeech`**
  Buat file `tests/hooks/use-hybrid-speech.test.ts` yang menguji:
  - Menentukan `engineMode = "online"` jika `navigator.onLine === true`.
  - Menentukan `engineMode = "offline-whisper"` jika `navigator.onLine === false` dan `isModelDownloaded === true`.
  - Menentukan `engineMode = "offline-unready"` jika `navigator.onLine === false` dan `isModelDownloaded === false`.
  - Mendelegasikan `startListening` dan `stopListening` ke engine yang aktif secara transparan.

- [ ] **Step 2: Jalankan test untuk memastikan test gagal**
  Jalankan `npx vitest run tests/hooks/use-hybrid-speech.test.ts`.

- [ ] **Step 3: Buat implementasi `src/hooks/use-hybrid-speech.ts`**
  Integrasikan:
  - `useSpeechRecognition` (mesin online).
  - `useOfflineWhisper` (mesin offline).
  - Perekaman audio browser via `MediaRecorder` saat mode offline.
  - Listener event `online` dan `offline` pada `window`.

- [ ] **Step 4: Jalankan test `useHybridSpeech` dan pastikan lulus**
  Jalankan `npx vitest run tests/hooks/use-hybrid-speech.test.ts`.

- [ ] **Step 5: Commit Task 3**
  Jalankan `git add src/hooks/use-hybrid-speech.ts tests/hooks/use-hybrid-speech.test.ts; git commit -m "feat(speech): implement unified useHybridSpeech orchestrator hook"`.

---

### Task 4: Integrasi UI Lembar Suara & Komponen Pengelola Model Offline

**Files:**
- Create: `src/components/expense/offline-model-card.tsx`
- Modify: `src/components/expense/voice-expense-sheet.tsx`
- Modify: `src/components/expense/voice-recorder.tsx`
- Modify: `tests/ui/voice-flow-states.test.ts`

- [ ] **Step 1: Buat komponen `src/components/expense/offline-model-card.tsx`**
  Komponen UI yang menampilkan:
  - Judul *"Model Suara Offline (39 MB)"*.
  - Status ketersediaan (Belum Diunduh / Sedang Mengunduh / Siap Offline).
  - Tombol *"Unduh Paket Suara Offline"* dengan konfirmasi kuota.
  - Progress bar biru animasi saat mengunduh.
  - Tombol *"Hapus Model"* saat model sudah terpasang.

- [ ] **Step 2: Integrasikan `useHybridSpeech` ke `VoiceExpenseSheet`**
  Perbarui `src/components/expense/voice-expense-sheet.tsx`:
  - Ganti `useSpeechRecognition` dengan `useHybridSpeech`.
  - Tampilkan badge status mesin di header (*Online Web Speech* vs *Offline Whisper AI* vs *Offline Model Belum Siap*).
  - Tampilkan `OfflineModelCard` di dalam lembar suara jika perangkat sedang offline atau jika pengguna ingin mengelola paket suara offline.
  - Tampilkan indikator proses saat Whisper AI lokal sedang menerjemahkan audio rekaman.

- [ ] **Step 3: Perbarui `VoiceRecorder` dengan status transkripsi offline**
  Perbarui `src/components/expense/voice-recorder.tsx` agar status `isProcessing` menampilkan label *"Menerjemahkan dengan AI lokal..."* saat mode offline whisper aktif.

- [ ] **Step 4: Perbarui pengujian UI di `tests/ui/voice-flow-states.test.ts`**
  Pastikan pengujian memvalidasi render status online dan offline pada lembar suara.

- [ ] **Step 5: Jalankan pengujian UI**
  Jalankan `npx vitest run tests/ui/voice-flow-states.test.ts`.

- [ ] **Step 6: Commit Task 4**
  Jalankan `git add src/components/expense/ tests/ui/; git commit -m "feat(ui): integrate hybrid speech controls and offline model card in voice expense sheet"`.

---

### Task 5: Verifikasi Komprehensif & Uji Kualitas Produksi

**Files:**
- Check: Seluruh file di `src/` dan `tests/`

- [ ] **Step 1: Jalankan typecheck TypeScript**
  Jalankan `npm run typecheck` (`tsc --noEmit`) dan pastikan 0 error.

- [ ] **Step 2: Jalankan seluruh test suite Vitest**
  Jalankan `npx vitest run` dan pastikan seluruh test (termasuk 52 test sebelumnya + test baru) lulus 100%.

- [ ] **Step 3: Jalankan linter ESLint**
  Jalankan `npm run lint` dan pastikan bersih tanpa warning/error.

- [ ] **Step 4: Jalankan Next.js Production Build**
  Jalankan `npm run build` dan pastikan seluruh rute terkompilasi sukses.

- [ ] **Step 5: Verifikasi kepatuhan aturan em-dash**
  Jalankan `git grep "—" src/` dan pastikan 0 kecocokan.

- [ ] **Step 6: Commit Task 5**
  Jalankan `git add .; git commit -m "chore: verify hybrid offline speech recognition passing all quality gates"`.
