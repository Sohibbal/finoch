# Desain Subsistem: Kalkulator Split Bill Resto & Talangan Teman (`/split-bill`)

> **Target:** Finoch Web Application (`finoch.id`)  
> **Segmentasi:** Mahasiswa & Anak Kost  
> **Konteks:** Fitur adaptasi unggulan dari audit MoneyTracker.ID dengan diferensiasi spesifik untuk mahasiswa.

---

## 1. Latar Belakang & Masalah Pengguna

Kebiasaan makan dan nongkrong bersama di warteg, cafe, maupun restoran adalah rutinitas utama mahasiswa. Masalah yang sering terjadi:
1. **Struk Gabungan**: Kasir hanya mengeluarkan 1 lembar struk dengan tambahan Pajak Restoran (PB1 10-11%) dan Service Charge (3-7%).
2. **Kalkulasi Rumit**: Menghitung secara proporsional siapa bayar apa plus pajaknya memakan waktu dan sering dihitung asal-asalan.
3. **Uang Ludes Ditalangi**: Seseorang harus membayar penuh di kasir dengan janji *"Ntar gue transfer ya"*. Akhirnya lupa ditagih dan uang penjamin ludes di akhir bulan.

---

## 2. Arsitektur & Logika Perhitungan

### 2.1 Model Data (`src/types/split-bill-types.ts`)
```typescript
export interface Participant {
  id: string;
  name: string;
  isUser: boolean; // Menandai porsi pengguna aplikasi ("Saya")
  phoneNumber?: string;
}

export interface SplitItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedParticipantIds: string[]; // Siapa saja yang makan/share item ini
}

export interface SplitBillConfig {
  restaurantName: string;
  date: string;
  mode: "itemized" | "equal"; // Bagi per menu vs Bagi rata
  taxPercentage: number; // e.g. 10% atau 11% (PB1)
  servicePercentage: number; // e.g. 5%
  discountAmount: number; // Potongan voucher / promo
  rounding: number; // Pembulatan (0, 100, 500, 1000)
}

export interface ParticipantShare {
  participantId: string;
  name: string;
  isUser: boolean;
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  discountDeduction: number;
  finalAmount: number;
  items: { name: string; sharePrice: number }[];
}

export interface SplitBillResult {
  subtotal: number;
  totalTax: number;
  totalService: number;
  totalDiscount: number;
  grandTotal: number;
  shares: ParticipantShare[];
}
```

### 2.2 Formula Perhitungan Proporsional
1. **Subtotal per Item**:
   $$\text{Price per person} = \frac{\text{Item Price} \times \text{Quantity}}{\text{Count(Assigned Participants)}}$$
2. **Distribusi Pajak & Service Charge**:
   Untuk pembagian per menu yang adil, pajak dan service dialokasikan berdasarkan proporsi konsumsi:
   $$\text{Tax Ratio} = \frac{\text{Participant Subtotal}}{\text{Total Subtotal}}$$
   $$\text{Participant Tax} = \text{Tax Ratio} \times \text{Total PB1}$$
   $$\text{Participant Service} = \text{Tax Ratio} \times \text{Total Service}$$
3. **Pembulatan (Rounding)**:
   Untuk mempermudah transfer (menghindari angka ganjil seperti Rp27.342):
   $$\text{Final Amount} = \text{Math.ceil}(\text{Raw Amount} / \text{Rounding}) \times \text{Rounding}$$

---

## 3. Fitur Utama & Integrasi Finoch

### 3.1 WhatsApp Message Formatter
Menghasilkan template teks rapi yang langsung bisa disalin atau dibuka via `https://wa.me/?text=...`:
```text
🧾 Rincian Patungan Makan di [Resto]
Total: Rp[GrandTotal] (Termasuk PB1 & Service)

👥 Rincian per Orang:
1. Budi: Rp28.500
   • Ayam Geprek (1x) + Es Teh (1x)
2. Siti: Rp34.000
   • Nasi Goreng Spesial (1x) + Jus Alpukat (1x)
3. Saya: Rp25.500

💳 Rekening / E-Wallet Pembayaran:
BCA: 1234-5678-90 a.n Diki
GoPay/ShopeePay: 0812-3456-7890

Dihitung via finoch.id 🚀
```

### 3.2 Integrasi Otomatis ke Finoch Storage
- **Porsi Pengguna ("Saya")**: Tombol satu-klik untuk menyimpan porsi pengguna sebagai transaksi pengeluaran (`Kategori: Makanan & Minuman`) di IndexedDB/Server Finoch.
- **Porsi Teman (Talangan)**: Disimpan ke modul `talangan_storage` lokal dengan status `belum_lunas` dan tanggal jatuh tempo agar pengguna dapat melacak siapa saja yang belum melunasi patungan makan.

### 3.3 Scan Struk Kamera / OCR
Pengguna dapat mengunggah struk foto kasir. Engine OCR yang sudah ada di Finoch membaca teks struk dan otomatis mengisi:
- Nama item
- Harga item
- Subtotal
- Pajak terdeteksi (jika ada)

---

## 4. Rute & Navigasi
- Rute: `/split-bill`
- Ditambahkan ke `DashboardSidebar` di bawah Simulator Arus Kas.
- Shortcut Banner / Card di `/dashboard` dan `/simulator`.
