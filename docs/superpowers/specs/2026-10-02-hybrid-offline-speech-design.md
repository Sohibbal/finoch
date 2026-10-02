# Spesifikasi Desain: Hybrid Offline Speech-to-Text VoiCash PWA

## 1. Ringkasan Eksekutif
Fitur ini mengintegrasikan arsitektur **Hybrid Speech-to-Text (STT)** ke dalam aplikasi VoiCash PWA. Pengguna dapat melakukan pencatatan pengeluaran dengan suara baik saat online maupun 100% offline tanpa sambungan internet.
- **Mode Online**: Menggunakan Web Speech API bawaan peramban (0 MB unduhan, instan, hemat baterai).
- **Mode Offline**: Menggunakan model kecerdasan buatan lokal **OpenAI Whisper-Tiny Quantized (~39 MB)** yang dijalankan langsung di peramban via **Transformers.js** dan dieksekusi di dalam **Web Worker** terisolasi.
- **Mekanisme Unduh Model (Opt-in)**: Pengguna memiliki kendali penuh untuk mengunduh model offline melalui tombol persetujuan manual, menjaga efisiensi kuota internet mahasiswa.

---

## 2. Masalah yang Diselesaikan
Sebelumnya, Web Speech API pada peramban berbasis Chromium (Google Chrome, Microsoft Edge) secara internal mengirimkan audio ke server Google untuk transkripsi Bahasa Indonesia. Ketika perangkat tidak memiliki koneksi internet, peramban memunculkan eror `network`, sehingga perekaman suara gagal berfungsi. 

Dengan arsitektur Hybrid ini, VoiCash menjamin kemampuan pencatatan suara tetap dapat berjalan kapan saja dan di mana saja, bahkan saat kuota habis atau di ruangan tanpa sinyal seluler.

---

## 3. Arsitektur Teknis

### 3.1 Diagram Alur Komponen

```
                         [Pengguna Menekan Tombol Mic]
                                      │
                                      ▼
                        [Pemeriksaan navigator.onLine]
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
          [ONLINE]                                       [OFFLINE]
               │                                             │
               ▼                                             ▼
     [Web Speech API]                            [Cek Cache Model Whisper]
(webkitSpeechRecognition)                                    │
               │                              ┌──────────────┴──────────────┐
               │                              ▼                             ▼
               │                        [MODEL SIAP]                 [BELUM DIUNDUH]
               │                              │                             │
               │                              ▼                             ▼
               │                    [Perekaman MediaRecorder]     [Tampilkan Opsi Unduh]
               │                    [AudioContext 16kHz Mono]     [Atau Catat Manual]
               │                              │
               │                              ▼
               │                     [Kirim ke Web Worker]
               │                   [Transformers.js Pipeline]
               │                              │
               └──────────────────────┬───────┘
                                      │
                                      ▼
                          [Transkrip Teks Mentah]
                                      │
                                      ▼
                      [Mesin Pengurai NLP Lokal VoiCash]
                         (Deteksi Item & Nominal)
                         (Kategori Primer vs Bocor Halus)
                                      │
                                      ▼
                      [Penyimpanan IndexedDB Lokal]
```

### 3.2 Modul dan Komponen Baru

1. **`src/workers/whisper.worker.ts`**:
   - Web Worker terisolasi yang mengimpor `@xenova/transformers`.
   - Menginisialisasi pipeline `automatic-speech-recognition` dengan model `Xenova/whisper-tiny` (quantized).
   - Mengatur parameter bahasa ke `indonesian` dan tugas ke `transcribe`.
   - Mengirimkan event progres unduhan (`progress`, `status`) dan hasil inferensi teks ke *main thread*.

2. **`src/lib/audio/audio-recorder.ts`**:
   - Utilitas penangkap audio peramban via `navigator.mediaDevices.getUserMedia`.
   - Mengubah buffer audio menjadi format Float32Array 16.000 Hz Mono (standar input Whisper).

3. **`src/hooks/use-offline-whisper.ts`**:
   - Mengelola komunikasi pesan dengan `whisper.worker.ts`.
   - Menyediakan status: `isModelDownloaded`, `isDownloading`, `downloadProgress`, `isTranscribing`.
   - Menyediakan aksi: `downloadModel()`, `deleteModel()`, `transcribeAudio(audioData)`.

4. **`src/hooks/use-hybrid-speech.ts`**:
   - Bertindak sebagai pengontrol terpadu (*unified orchestrator*) yang menggabungkan `useSpeechRecognition` (online) dan `useOfflineWhisper` (offline).
   - Otomatis beralih mode saat event jaringan `online` dan `offline` terjadi.

5. **Pembaruan `src/components/expense/voice-expense-sheet.tsx` & `src/components/expense/voice-recorder.tsx`**:
   - Badge mode mesin suara (*Online Web Speech* vs *Offline AI Lokal*).
   - Kartu kelola model offline dengan progress bar persentase unduhan.
   - Status visual saat transkripsi AI lokal sedang berjalan.

---

## 4. Rincian Antarmuka dan State Management

### 4.1 Interface `useHybridSpeech`

```typescript
export type SpeechEngineMode = "online" | "offline-whisper" | "offline-unready";

export interface UseHybridSpeechReturn {
  // Status Perekaman
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  
  // Status Mesin Suara
  engineMode: SpeechEngineMode;
  isOnline: boolean;
  isTranscribing: boolean;
  
  // Status Model Offline
  isModelDownloaded: boolean;
  isDownloadingModel: boolean;
  modelDownloadProgress: number; // 0 - 100
  
  // Aksi
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  downloadOfflineModel: () => Promise<void>;
  deleteOfflineModel: () => Promise<void>;
}
```

### 4.2 Alur Pengunduhan Model Opt-in
1. Pengguna melihat kartu *"Model Suara Offline (39 MB)"* pada lembar suara.
2. Pengguna menekan tombol *"Unduh Paket Suara Offline"*.
3. Worker mulai mengambil berkas `onnx` dari cache / CDN HuggingFace.
4. Tampilan kartu memperlihatkan progress bar berwarna biru dengan persentase real-time (contoh: *Mengunduh model suara: 48%*).
5. Setelah tuntas, status berubah menjadi *"Model AI Siap Offline"*, disimpan di `CacheStorage`, dan muncul opsi *"Hapus Model"* jika ingin membersihkan memori.

---

## 5. Penanganan Kasus Khusus (Edge Cases)

| Skenario | Penanganan |
| :--- | :--- |
| **Koneksi terputus saat mengunduh model 39 MB** | Tangkap error, batalkan proses worker, hapus sisa unduhan yang korup, dan tampilkan pesan *"Koneksi terputus saat mengunduh. Silakan coba lagi"* dengan tombol coba ulang. |
| **Izin mikrofon belum diberikan saat offline** | Tampilkan dialog izin mikrofon yang jelas. Jika ditolak, tampilkan panduan membuka setelan browser. |
| **Perangkat berpindah dari online ke offline saat modal terbuka** | Listener `window.onoffline` langsung mengubah `engineMode` ke `offline-whisper` (jika model ada) atau `offline-unready` secara reaktif tanpa reload. |
| **Penyimpanan browser penuh** | Periksa kuota via `navigator.storage.estimate()` sebelum mengunduh. Jika kuota tidak mencukupi, beri peringatan ramah. |

---

## 6. Rencana Pengujian (Verification Strategy)

1. **Unit Tests (`vitest`)**:
   - `tests/hooks/use-hybrid-speech.test.ts`: Uji transisi state online/offline, delegasi ke engine yang sesuai, dan handling error.
   - `tests/audio/audio-processor.test.ts`: Uji konversi Float32 16kHz mono.
2. **Komponen Tests**:
   - `tests/ui/voice-flow-states.test.ts`: Verifikasi rendering badge status, progress bar, dan tombol unduh model.
3. **Regresi**:
   - Memastikan seluruh **52 unit tests** yang ada saat ini tetap 100% lulus.
   - Memastikan `npm run build` dan `npm run lint` selesai dengan exit code 0.

---

## 7. Batasan & Standar Kualitas
- Desain visual mengikuti tema warna biru dan midnight navy yang telah disepakati.
- Menggunakan tipografi **Plus Jakarta Sans**.
- Bersih dari karakter em-dash (`—`).
