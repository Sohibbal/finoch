"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Bot,
  User,
  LogOut,
  Settings,
  WifiOff,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useAuthContext } from "./auth-provider";

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className = "" }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { href: "/dashboard", icon: LayoutGrid, label: "Beranda" },
    { href: "/pemasukan", icon: ArrowDownLeft, label: "Pemasukan" },
    { href: "/pengeluaran", icon: ArrowUpRight, label: "Pengeluaran" },
    { href: "/wishlist", icon: Gift, label: "Wishlist" },
    { href: "/copilot", icon: Bot, label: "Copilot" },
    { href: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <aside
      className={`w-16 md:w-20 my-3 ml-3 rounded-[2rem] bg-[#0E131F] dark:bg-[#070A11] border border-slate-800/80 shadow-2xl flex flex-col items-center py-5 justify-between shrink-0 z-30 transition-all ${className}`}
    >
      {/* Top: Logo Mark */}
      <div className="flex flex-col items-center gap-4">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 hover:scale-105 transition-transform"
          aria-label="finoch dashboard"
        >
          <BrandLogo variant="symbol" className="w-6 h-6 text-blue-500" />
        </Link>
      </div>

      {/* Middle: Icon Rail Navigation */}
      <nav aria-label="Navigasi fitur" className="flex flex-col items-center gap-2.5 my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                active
                  ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.75} aria-hidden="true" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings & Logout Actions */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-800/60">
        <Link
          href="/profile"
          title="Pengaturan"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span className="sr-only">Pengaturan</span>
        </Link>

        <button
          type="button"
          onClick={() => logout()}
          title="Keluar"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="sr-only">Keluar</span>
        </button>
      </div>

      {/* Screen-reader / assistive compatibility for user profile & search */}
      <div className="sr-only">
        <span>finoch</span>
        <input
          type="search"
          placeholder="Cari menu..."
          aria-label="Cari menu"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span>{user?.name || "Budi Mahasiswa"}</span>
        <span>PWA Offline Mode</span>
      </div>
    </aside>
  );
}
