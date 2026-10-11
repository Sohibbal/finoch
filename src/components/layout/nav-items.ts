import {
  Bot,
  CalendarClock,
  Compass,
  CreditCard,
  FileSpreadsheet,
  Flame,
  GraduationCap,
  Handshake,
  Hourglass,
  LayoutDashboard,
  Lightbulb,
  Receipt,
  Target,
  User,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** One name per feature, used everywhere in navigation. */
  label: string;
  /** One line of what it does, in anak-kost words. */
  desc: string;
  icon: LucideIcon;
  keywords: string[];
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** Every app destination (all 17), grouped. Sidebar and the mobile menu both read this. */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: "Utama",
    items: [
      { href: "/dashboard", label: "Beranda", desc: "Jatah hari ini & catatan terbaru", icon: LayoutDashboard, keywords: ["home", "dashboard", "ringkasan", "jatah", "saldo"] },
      { href: "/copilot", label: "Copilot AI", desc: "Tanya soal duitmu", icon: Bot, keywords: ["chat", "asisten", "bot", "tanya", "konsultasi", "ai"] },
    ],
  },
  {
    id: "student",
    label: "Mahasiswa & Kost",
    items: [
      { href: "/ukt-savings", label: "Tabungan UKT", desc: "Nyicil biaya semesteran", icon: GraduationCap, keywords: ["kuliah", "semester", "spp", "sinking fund", "kampus"] },
      { href: "/meal-calc", label: "Masak vs Warteg", desc: "Hitung mana yang lebih hemat", icon: Utensils, keywords: ["makan", "kost", "dapur", "magic com", "belanja", "pasar"] },
      { href: "/split-bill", label: "Split Bill", desc: "Bagi tagihan & talangan, teks WA", icon: Receipt, keywords: ["patungan", "resto", "nongkrong", "pajak", "talangan"] },
      { href: "/debts", label: "Buku Kasbon", desc: "Utang & piutang teman", icon: Handshake, keywords: ["pinjam", "hutang", "piutang", "teman", "lunas"] },
      { href: "/wishlist", label: "Wishlist Tunda", desc: "Tunda 7 hari sebelum checkout", icon: Hourglass, keywords: ["belanja", "tunda", "cooling-off", "impulsif", "shopee"] },
      { href: "/streak", label: "Streak Hemat", desc: "Hari tanpa jajan", icon: Flame, keywords: ["no spend", "challenge", "puasa jajan", "tantangan"] },
    ],
  },
  {
    id: "finances",
    label: "Kas & Anggaran",
    items: [
      { href: "/wallets", label: "Dompet", desc: "Tunai, bank, e-wallet", icon: CreditCard, keywords: ["bca", "bri", "gopay", "shopeepay", "cash", "tunai", "multi-dompet"] },
      { href: "/budget", label: "Amplop Anggaran", desc: "Pos makan, kos, jajan", icon: Wallet, keywords: ["pos", "alokasi", "jatah", "amplop", "kebutuhan"] },
      { href: "/bills", label: "Tagihan Kost", desc: "Sewa, WiFi, listrik", icon: CalendarClock, keywords: ["sewa kost", "wifi", "listrik", "kuota", "langganan", "rutin"] },
      { href: "/audit", label: "Bocor Halus", desc: "Jajan kecil yang numpuk", icon: Zap, keywords: ["kopi", "rokok", "admin", "bocor", "audit", "evaluasi"] },
    ],
  },
  {
    id: "planning",
    label: "Analisis & Rencana",
    items: [
      { href: "/reports", label: "Laporan & LPJ", desc: "Rekap bulanan, unduh Excel", icon: FileSpreadsheet, keywords: ["lpj", "beasiswa", "rekap", "ortu", "unduh", "csv", "riwayat"] },
      { href: "/simulator", label: "Simulator Kas", desc: "Coba skenario jatah harian", icon: Compass, keywords: ["what if", "simulasi", "prediksi", "skenario"] },
      { href: "/goals", label: "Target Finansial", desc: "Dana darurat, laptop, liburan", icon: Target, keywords: ["impian", "dana darurat", "laptop", "liburan", "tabungan"] },
      { href: "/insights", label: "Insight", desc: "Pola belanjamu bulan ini", icon: Lightbulb, keywords: ["analisis", "pola", "tren", "statistik"] },
    ],
  },
  {
    id: "account",
    label: "Akun",
    items: [{ href: "/profile", label: "Profil", desc: "Uang saku, Mode Demo, akun", icon: User, keywords: ["pengaturan", "akun", "nama", "email", "uang saku", "demo"] }],
  },
];

export function matchesNav(item: NavItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.label.toLowerCase().includes(q) ||
    item.desc.toLowerCase().includes(q) ||
    item.href.includes(q) ||
    item.keywords.some((k) => k.includes(q))
  );
}
