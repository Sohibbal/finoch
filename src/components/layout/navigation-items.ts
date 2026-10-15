import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Bot,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavigationItem {
  href: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  keywords: string[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Beranda",
    desc: "Insight harian & saldo",
    icon: LayoutDashboard,
    keywords: ["beranda", "dashboard", "home", "saldo", "streak"],
  },
  {
    href: "/pemasukan",
    label: "Pemasukan",
    desc: "Bicara, scan & manual",
    icon: ArrowDownLeft,
    keywords: ["masuk", "income", "pemasukan", "gaji", "kiriman"],
  },
  {
    href: "/pengeluaran",
    label: "Pengeluaran",
    desc: "Bicara, scan & manual",
    icon: ArrowUpRight,
    keywords: ["keluar", "expense", "pengeluaran", "jajan", "bayar"],
  },
  {
    href: "/wishlist",
    label: "Wishlist",
    desc: "Target & proyeksi",
    icon: Gift,
    keywords: ["wishlist", "impian", "target", "nabung", "beli"],
  },
  {
    href: "/copilot",
    label: "FinBot",
    desc: "Tanya data finansial lo",
    icon: Bot,
    keywords: ["finbot", "copilot", "ai", "asisten", "tanya"],
  },
  {
    href: "/profile",
    label: "Profil",
    desc: "Info akun & preferensi",
    icon: User,
    keywords: ["profil", "profile", "akun", "nickname", "pengaturan"],
  },
];
