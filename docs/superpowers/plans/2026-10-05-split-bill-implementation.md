# Rencana Implementasi: Kalkulator Split Bill Resto & Talangan Teman

> **Target:** Finoch Web App (`/split-bill`)  
> **Status:** Direncanakan  
> **Pendekatan:** Test-Driven Development (TDD) & Modular Components

---

## Tahap 1: Tipe & Engine Perhitungan (TDD)
- [ ] Buat file tipe `src/types/split-bill-types.ts`
- [ ] Buat test suite unit `tests/financial/split-bill-engine.test.ts`
  - Test pembagian bagi rata (equal split) dengan pajak PB1 10% dan service charge 5%
  - Test pembagian per item (itemized split) dengan pembagian menu bersama (shared items)
  - Test alokasi proporsional diskon dan pembulatan ratusan rupiah
  - Test generator format pesan WhatsApp
- [ ] Implementasikan kalkulator di `src/lib/financial/split-bill-engine.ts`

## Tahap 2: Manajemen Storage Talangan Teman
- [ ] Buat module helper `src/lib/storage/talangan-storage.ts` untuk menyimpan riwayat tagihan patungan & status pelunasan teman di local storage/IndexedDB
- [ ] Buat test unit di `tests/storage/talangan-storage.test.ts`

## Tahap 3: Komponen Antarmuka Split Bill (`src/components/split-bill/*`)
- [ ] Buat komponen `ParticipantSelector.tsx` (tambah/hapus teman, avatar inisial)
- [ ] Buat komponen `BillItemEditor.tsx` (nama menu, harga, jumlah, centang pemesan)
- [ ] Buat komponen `TaxDiscountConfig.tsx` (preset PB1 10%/11%, service 0%/5%, diskon, pembulatan)
- [ ] Buat komponen `SplitSummaryCard.tsx` (rincian kartu per orang, grand total, tombol WA & simpan)
- [ ] Buat komponen `ReceiptOcrButton.tsx` (upload/scan struk untuk auto-fill menu)

## Tahap 4: Halaman Utama `/split-bill` & Integrasi Navigasi
- [ ] Buat halaman `src/app/split-bill/page.tsx` dengan responsive desktop & mobile layout
- [ ] Tambahkan navigasi `/split-bill` di `DashboardSidebar.tsx`
- [ ] Tambahkan shortcut card di `/dashboard/page.tsx`
- [ ] Buat test integrasi UI di `tests/ui/split-bill-page.test.ts`

## Tahap 5: Verifikasi Penuh & Git Push Bertahap
- [ ] Jalankan `pnpm test` (semua unit test harus 100% lulus)
- [ ] Jalankan `pnpm typecheck` (0 error)
- [ ] Jalankan `pnpm lint` (0 error)
- [ ] Jalankan `pnpm build` (build produksi Next.js harus sukses)
- [ ] Commit dan push sedikit demi sedikit ke GitHub sesuai arahan pengguna.
