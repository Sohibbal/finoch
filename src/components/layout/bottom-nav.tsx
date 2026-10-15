"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Bot,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "./navigation-items";
import { ThemeToggle } from "./theme-toggle";

interface BottomNavProps {
  onOpenVoice?: () => void;
  onOpenPrivacy?: () => void;
  userEmail?: string | null;
}

function Tab({
  href,
  label,
  icon: Icon,
  active,
  ariaLabel,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center justify-center gap-1 min-h-12 text-[11px] transition-colors ${
        active
          ? "text-blue-600 dark:text-blue-400 font-bold"
          : "text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-200"
      }`}
    >
      <Icon className="w-4 h-4" strokeWidth={active ? 2.4 : 1.75} aria-hidden="true" />
      <span>{label}</span>
      {active && <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 -mt-0.5" />}
    </Link>
  );
}

function FloatingFinBotTab({
  active,
}: {
  active: boolean;
}) {
  return (
    <Link
      href="/copilot"
      aria-label="FinBot Asisten AI"
      aria-current={active ? "page" : undefined}
      className="relative flex flex-col items-center justify-center -top-5 group cursor-pointer focus:outline-hidden"
    >
      {/* Floating Squircle Button ala Livin QRIS */}
      <div
        className={`w-14 h-14 rounded-[1.35rem] flex items-center justify-center transition-all duration-300 border-[3.5px] border-white dark:border-[#0B1320] shadow-[0_8px_24px_rgba(20,184,166,0.32)] dark:shadow-[0_8px_24px_rgba(13,148,136,0.35)] ${
          active
            ? "bg-gradient-to-b from-[#38BDF8] via-[#14B8A6] to-[#2563EB] text-white scale-105 ring-4 ring-teal-500/20 shadow-[0_10px_28px_rgba(37,99,235,0.4)]"
            : "bg-gradient-to-b from-[#38BDF8] via-[#14B8A6] to-[#2563EB] text-white group-hover:scale-105 group-hover:shadow-[0_10px_28px_rgba(20,184,166,0.45)] active:scale-95"
        }`}
      >
        <Bot
          className="w-7 h-7 text-white transition-transform group-hover:scale-110 drop-shadow-xs"
          strokeWidth={2.2}
          aria-hidden="true"
        />
      </div>
      <span
        className={`text-[11px] font-black tracking-tight mt-1 transition-colors ${
          active
            ? "text-blue-600 dark:text-teal-400"
            : "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
        }`}
      >
        FinBot
      </span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-teal-400 -mt-0.5" />}
    </Link>
  );
}

/** Mobile bottom bar providing instant access to the core features */
export function BottomNav({ userEmail }: BottomNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isGuest = userEmail === null || (userEmail === undefined && pathname === "/");
  const homeHref = isGuest ? "/" : "/dashboard";
  const isHome = isGuest ? pathname === "/" : pathname === "/" || pathname === "/dashboard";

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  return (
    <>
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Semua fitur"
          className="md:hidden fixed inset-0 z-50 bg-paper dark:bg-navy-950 flex flex-col animate-fade-in"
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 border-b border-ink/15 dark:border-navy-800">
            <h2 className="font-display text-head font-bold text-ink dark:text-white">Menu Finoch</h2>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-11 h-11 rounded-full border border-ink/20 dark:border-navy-700 text-ink dark:text-white flex items-center justify-center"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav
            aria-label="Semua fitur"
            className="flex-1 overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            <ul className="divide-y divide-ink/10 dark:divide-navy-800 border-b border-ink/10 dark:border-navy-800">
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className="flex items-center gap-3 min-h-12 py-3 text-ink dark:text-white"
                    >
                      <div className="w-9 h-9 rounded-xl bg-ink/5 dark:bg-navy-800 flex items-center justify-center">
                        <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      </div>
                      <span className="min-w-0">
                        <span
                          className={`block text-body ${
                            active ? "font-bold text-primary-600 dark:text-primary-400" : "font-semibold"
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="block text-meta text-ink-soft dark:text-navy-400">{item.desc}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      <nav
        aria-label="Navigasi Bawah Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0B1320]/95 backdrop-blur-md rounded-t-[1.75rem] border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
          {/* 1. Beranda */}
          <Tab
            href={homeHref}
            label="Beranda"
            icon={LayoutDashboard}
            active={isHome}
            ariaLabel={isGuest ? "Halaman Beranda" : "Halaman Dashboard"}
          />
          {/* 2. Pemasukan */}
          <Tab
            href="/pemasukan"
            label="Masuk"
            icon={ArrowDownLeft}
            active={pathname === "/pemasukan"}
          />
          {/* 3. FinBot (Tengah - Floating Mobile Banking Action Button) */}
          <FloatingFinBotTab
            active={pathname === "/copilot"}
          />
          {/* 4. Pengeluaran (Di kanan FinBot) */}
          <Tab
            href="/pengeluaran"
            label="Keluar"
            icon={ArrowUpRight}
            active={pathname === "/pengeluaran"}
          />
          {/* 5. Wishlist (Paling ujung kanan) */}
          <Tab
            href="/wishlist"
            label="Wishlist"
            icon={Gift}
            active={pathname === "/wishlist"}
          />
        </div>
      </nav>
    </>
  );
}
