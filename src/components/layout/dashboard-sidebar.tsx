"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  LayoutDashboard,
  Compass,
  Target,
  Bot,
  User,
  LogOut,
  Receipt,
  CalendarClock,
  Hourglass,
  Wallet,
  FileSpreadsheet,
  Flame,
  Handshake,
  CreditCard,
  Zap,
  Utensils,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Sparkles,
  Wifi,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "./theme-toggle";

interface DashboardSidebarProps {
  className?: string;
}

interface NavChildItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  keywords?: string[];
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: NavChildItem[];
}

interface NavSingleItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  keywords?: string[];
}

export function DashboardSidebar({ className = "" }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Navigation Items Hierarchy
  const singleTopItems: NavSingleItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      keywords: ["home", "beranda", "ringkasan", "overview", "saldo"],
    },
    {
      href: "/copilot",
      label: "AI Copilot",
      icon: Bot,
      badge: "AI",
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      keywords: ["chat", "asisten", "bot", "tanya", "konsultasi"],
    },
  ];

  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        id: "student",
        label: "Mahasiswa & Kost",
        icon: GraduationCap,
        children: [
          {
            href: "/ukt-savings",
            label: "Sinking Fund UKT",
            icon: GraduationCap,
            badge: "Baru",
            badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
            keywords: ["kuliah", "semester", "spp", "biaya", "kampus", "skripsi"],
          },
          {
            href: "/meal-calc",
            label: "Masak vs Warteg",
            icon: Utensils,
            badge: "Hemat",
            badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            keywords: ["makan", "kost", "dapur", "magic com", "belanja", "pasar"],
          },
          {
            href: "/split-bill",
            label: "Split Bill & Talangan",
            icon: Receipt,
            keywords: ["patungan", "resto", "nongkrong", "pajak", "bayar"],
          },
          {
            href: "/debts",
            label: "Buku Kasbon & Hutang",
            icon: Handshake,
            keywords: ["pinjam", "piutang", "teman", "jatuh tempo", "lunas"],
          },
          {
            href: "/wishlist",
            label: "Wishlist Anti-Impulsif",
            icon: Hourglass,
            keywords: ["belanja", "tunda", "cooling-off", "shopee", "tokopedia"],
          },
          {
            href: "/streak",
            label: "Streak Hemat",
            icon: Flame,
            keywords: ["no spend", "challenge", "puasa jajan", "tantangan"],
          },
        ],
      },
      {
        id: "finances",
        label: "Kas & Anggaran",
        icon: Wallet,
        children: [
          {
            href: "/wallets",
            label: "Multi-Dompet Akun",
            icon: CreditCard,
            keywords: ["bca", "bri", "gopay", "shopeepay", "cash", "tunai"],
          },
          {
            href: "/budget",
            label: "Amplop Anggaran",
            icon: Wallet,
            keywords: ["pos", "alokasi", "jatah", "amplop", "kebutuhan"],
          },
          {
            href: "/bills",
            label: "Tagihan Kost & Rutin",
            icon: CalendarClock,
            keywords: ["sewa kost", "wifi", "listrik", "kuota", "langganan"],
          },
          {
            href: "/audit",
            label: "Audit Bocor Halus",
            icon: Zap,
            keywords: ["kopi", "rokok", "admin", "bocor", "evaluasi"],
          },
        ],
      },
      {
        id: "planning",
        label: "Analisis & Rencana",
        icon: Compass,
        children: [
          {
            href: "/reports",
            label: "Laporan & LPJ Excel",
            icon: FileSpreadsheet,
            badge: "LPJ",
            badgeColor: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
            keywords: ["lpj", "beasiswa", "rekap", "ortu", "unduh", "csv"],
          },
          {
            href: "/simulator",
            label: "Simulator Arus Kas",
            icon: Compass,
            keywords: ["what if", "simulasi", "prediksi", "skenario"],
          },
          {
            href: "/goals",
            label: "Target Finansial",
            icon: Target,
            keywords: ["impian", "dana darurat", "laptop", "liburan"],
          },
        ],
      },
    ],
    []
  );

  const singleBottomItems: NavSingleItem[] = [
    {
      href: "/profile",
      label: "Profil Saya",
      icon: User,
      keywords: ["pengaturan", "akun", "nama", "email", "gaji", "income"],
    },
  ];

  // Accordion state: by default, all groups are open for immediate discovery
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    student: true,
    finances: true,
    planning: true,
  });

  // Automatically ensure the group containing the active page is open
  useEffect(() => {
    navGroups.forEach((group) => {
      const hasActiveChild = group.children.some((child) => child.href === pathname);
      if (hasActiveChild) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname, navGroups]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Filtered navigation when user types in search box
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const isMatching = (item: { label: string; href?: string; keywords?: string[] }) => {
    if (!normalizedQuery) return true;
    if (item.label.toLowerCase().includes(normalizedQuery)) return true;
    if (item.href?.toLowerCase().includes(normalizedQuery)) return true;
    if (item.keywords?.some((k) => k.toLowerCase().includes(normalizedQuery))) return true;
    return false;
  };

  const filteredSingleTop = singleTopItems.filter(isMatching);
  const filteredSingleBottom = singleBottomItems.filter(isMatching);

  const filteredGroups = navGroups
    .map((group) => {
      const matchingChildren = group.children.filter(isMatching);
      const isGroupMatching = group.label.toLowerCase().includes(normalizedQuery);
      return {
        ...group,
        children: isGroupMatching ? group.children : matchingChildren,
        hasMatches: isGroupMatching || matchingChildren.length > 0,
      };
    })
    .filter((group) => !normalizedQuery || group.hasMatches);

  return (
    <aside
      className={`w-64 h-screen sticky top-0 self-start overflow-hidden bg-cream-50 dark:bg-navy-950 border-r border-cream-300 dark:border-navy-800 flex flex-col justify-between shrink-0 transition-colors select-none ${className}`}
    >
      {/* Top Header & Search Filter */}
      <div className="p-4 pb-2 space-y-3 shrink-0">
        {/* Brand Logo & App Badge */}
        <div className="flex items-center justify-between px-1">
          <Link href="/dashboard" className="flex items-center gap-2 group" aria-label="finoch.id dashboard">
            <BrandLogo variant="full" className="h-6 w-auto transition-transform group-hover:scale-105" />
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Mahasiswa
          </span>
        </div>

        {/* Search / Filter Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 dark:text-cream-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari fitur (UKT, warteg, kasbon)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 placeholder:text-navy-400 dark:placeholder:text-cream-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-navy-950 dark:text-cream-100 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-navy-400 hover:text-navy-700 dark:text-cream-500 dark:hover:text-cream-200"
              title="Hapus pencarian"
              aria-label="Hapus pencarian"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Nav Items (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
        {/* Core Direct Links */}
        {filteredSingleTop.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-navy-400 dark:text-cream-500">
              Navigasi Utama
            </div>
            {filteredSingleTop.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 font-bold shadow-sm"
                      : "text-navy-700/90 dark:text-cream-300/90 hover:text-navy-950 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-navy-900/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-current" : "text-navy-500 dark:text-cream-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || "bg-cream-200 text-navy-700"}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Grouped Menus with Submenus (Menu Anak) */}
        {filteredGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = openGroups[group.id] || Boolean(searchQuery);
          const hasActiveChild = group.children.some((child) => child.href === pathname);

          return (
            <div key={group.id} className="space-y-1">
              {/* Parent Accordion Button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors group ${
                  hasActiveChild
                    ? "text-navy-950 dark:text-cream-100"
                    : "text-navy-600 dark:text-cream-400 hover:text-navy-900 dark:hover:text-cream-100 hover:bg-cream-200/40 dark:hover:bg-navy-900/40"
                }`}
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={`p-1 rounded-md ${hasActiveChild ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-cream-200/60 dark:bg-navy-900 text-navy-500 dark:text-cream-400"}`}>
                    <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                  </div>
                  <span className="truncate tracking-tight">{group.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-cream-200 dark:bg-navy-900 text-navy-500 dark:text-cream-400">
                    {group.children.length}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-navy-400 dark:text-cream-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-navy-400 dark:text-cream-500" />
                  )}
                </div>
              </button>

              {/* Child Submenu (Menu Anak) */}
              {isOpen && (
                <div className="ml-3 pl-2.5 border-l border-cream-300 dark:border-navy-800 space-y-0.5 pt-0.5">
                  {group.children.map((child) => {
                    const ChildIcon = child.icon;
                    const isChildActive = pathname === child.href;

                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all relative ${
                          isChildActive
                            ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 font-bold shadow-sm"
                            : "text-navy-700/80 dark:text-cream-300/80 hover:text-navy-950 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-navy-900/50 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <ChildIcon
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isChildActive ? "text-current" : "text-navy-400 dark:text-cream-500"
                            }`}
                          />
                          <span className="truncate">{child.label}</span>
                        </div>

                        {child.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                              isChildActive
                                ? "bg-white/20 text-current"
                                : child.badgeColor || "bg-cream-200 text-navy-700 dark:bg-navy-800 dark:text-cream-300"
                            }`}
                          >
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom Direct Links (Settings / Profile) */}
        {filteredSingleBottom.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-cream-200 dark:border-navy-800">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-navy-400 dark:text-cream-500">
              Pengaturan
            </div>
            {filteredSingleBottom.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 font-bold shadow-sm"
                      : "text-navy-700/90 dark:text-cream-300/90 hover:text-navy-950 dark:hover:text-cream-50 hover:bg-cream-200/50 dark:hover:bg-navy-900/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-current" : "text-navy-500 dark:text-cream-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${item.badgeColor || "bg-cream-200 text-navy-700"}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* No Search Results Fallback */}
        {normalizedQuery &&
          filteredSingleTop.length === 0 &&
          filteredGroups.length === 0 &&
          filteredSingleBottom.length === 0 && (
            <div className="p-4 text-center text-xs text-navy-500 dark:text-cream-400">
              Tidak ada fitur yang cocok dengan &quot;{searchQuery}&quot;
            </div>
          )}
      </div>

      {/* Footer Controls: Theme Toggle, User Card & Offline Status */}
      <div className="p-3 border-t border-cream-200 dark:border-navy-800 space-y-2.5 shrink-0 bg-cream-100/50 dark:bg-navy-900/30">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>PWA Offline Siap</span>
          </div>
          <ThemeToggle />
        </div>

        {user ? (
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <div className="w-7 h-7 rounded-lg bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 font-bold text-xs flex items-center justify-center shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate min-w-0">
                <div className="text-xs font-bold text-navy-950 dark:text-cream-50 truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-navy-500 dark:text-cream-400 truncate">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              title="Keluar Akun"
              aria-label="Keluar Akun"
              className="p-1.5 rounded-lg text-navy-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full py-2 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold text-center block transition-all"
          >
            Masuk Akun
          </Link>
        )}
      </div>
    </aside>
  );
}
