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
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0B1320]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
          <Tab
            href={homeHref}
            label="Beranda"
            icon={LayoutDashboard}
            active={isHome}
            ariaLabel={isGuest ? "Halaman Beranda" : "Halaman Dashboard"}
          />
          <Tab
            href="/pemasukan"
            label="Masuk"
            icon={ArrowDownLeft}
            active={pathname === "/pemasukan"}
          />
          <Tab
            href="/pengeluaran"
            label="Keluar"
            icon={ArrowUpRight}
            active={pathname === "/pengeluaran"}
          />
          <Tab
            href="/wishlist"
            label="Wishlist"
            icon={Gift}
            active={pathname === "/wishlist"}
          />
          <Tab
            href="/copilot"
            label="FinBot"
            icon={Bot}
            active={pathname === "/copilot"}
          />
        </div>
      </nav>
    </>
  );
}
