"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Bot,
  User,
  LogOut,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("finoch_sidebar_expanded");
      if (saved !== null) {
        setIsExpanded(saved === "true");
      }
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      alert(
        "Untuk memasang Finoch di perangkat:\n\n" +
        "1. Chrome Android/Desktop: Tekan menu titik tiga (⋮) > 'Instal Aplikasi' atau tombol instal di bilah alamat browser.\n" +
        "2. Safari iPhone/iPad: Tekan tombol Bagikan (Share) > 'Tambahkan ke Layar Utama'."
      );
    }
  };

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("finoch_sidebar_expanded", String(next));
      }
      return next;
    });
  };

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
      className={`sticky top-3 self-start my-3 ml-3 rounded-2xl bg-[#eaf0fd]/95 dark:bg-[#070A11] border border-blue-200/70 dark:border-slate-800/80 shadow-xl shadow-blue-900/5 dark:shadow-2xl dark:shadow-black/50 backdrop-blur-xl flex flex-col py-5 justify-between shrink-0 z-40 transition-all duration-300 h-[calc(100vh-1.5rem)] max-h-screen relative ${
        isExpanded ? "w-56 md:w-60 px-3" : "w-16 md:w-20 px-2 items-center"
      } ${className}`}
    >
      {/* Toggle Expand / Collapse Button:
          - When collapsed (!isExpanded): placed outside the card on the right edge so logo remains centered
          - When expanded (isExpanded): placed in top-right corner inside the card */}
      <button
        type="button"
        onClick={toggleExpand}
        title={isExpanded ? "Perkecil sidebar" : "Perbesar sidebar"}
        aria-label={isExpanded ? "Perkecil sidebar" : "Perbesar sidebar"}
        className={`absolute top-6.5 w-7 h-7 rounded-full bg-[#eaf0fd] dark:bg-[#111726] border border-blue-200/80 dark:border-slate-700/80 shadow-md hover:bg-blue-100/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all z-50 cursor-pointer ${
          isExpanded ? "right-3" : "-right-9"
        }`}
      >
        {isExpanded ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Top: Logo & Brand */}
      <div className="flex flex-col gap-3 w-full shrink-0">
        <div
          className={`flex items-center w-full ${
            isExpanded ? "px-2" : "justify-center"
          }`}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-blue-500 hover:scale-105 transition-transform"
            aria-label="finoch dashboard"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/90 dark:bg-blue-600/20 border border-blue-200/60 dark:border-transparent flex items-center justify-center shrink-0 shadow-xs">
              <BrandLogo variant="symbol" className="w-6 h-6 text-blue-500" />
            </div>
            {isExpanded && (
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white animate-in fade-in duration-200">
                finoch
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Top Navigation Items */}
      <nav aria-label="Navigasi fitur" className="flex flex-col gap-1.5 mt-5 mb-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={`rounded-2xl transition-all flex items-center ${
                isExpanded
                  ? "px-3.5 py-2.5 gap-3 w-full"
                  : "w-11 h-11 justify-center mx-auto"
              } ${
                active
                  ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/30 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className="w-5 h-5 shrink-0"
                strokeWidth={active ? 2.2 : 1.75}
                aria-hidden="true"
              />
              {isExpanded ? (
                <span className="text-xs tracking-tight truncate animate-in fade-in duration-200">
                  {item.label}
                </span>
              ) : (
                <span className="sr-only">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: User Card, Install PWA & Logout */}
      <div className="flex flex-col gap-2 pt-2 border-t border-blue-200/60 dark:border-slate-800/60 w-full shrink-0">
        {isExpanded ? (
          <div className="flex flex-col gap-1.5 px-1">
            <button
              type="button"
              onClick={handleInstallPwa}
              title="Install PWA"
              aria-label="Install PWA"
              className="w-full px-3 py-2 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate">Install PWA</span>
            </button>

            <div className="px-2 py-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="min-w-0 pr-2">
                <p className="font-bold text-slate-900 dark:text-white truncate text-xs">
                  {user?.name || "Budi Mahasiswa"}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>PWA Offline Mode</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                title="Keluar"
                aria-label="Keluar"
                className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleInstallPwa}
              title="Install PWA"
              aria-label="Install PWA"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="sr-only">Install PWA</span>
            </button>

            <button
              type="button"
              onClick={() => logout()}
              title="Keluar"
              aria-label="Keluar"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only">Keluar</span>
            </button>
          </div>
        )}

        {/* Screen-reader / assistive compatibility */}
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
      </div>
    </aside>
  );
}
