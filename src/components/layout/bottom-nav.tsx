"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, FileSpreadsheet, Home, Menu, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Seal } from "@/components/press/seal";
import { NAV_GROUPS } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";

interface BottomNavProps {
  onOpenVoice: () => void;
  onOpenPrivacy?: () => void;
  userEmail?: string | null;
}

function Tab({ href, label, icon: Icon, active, ariaLabel }: { href: string; label: string; icon: LucideIcon; active: boolean; ariaLabel?: string }) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center justify-center gap-0.5 min-h-12 text-meta ${active ? "text-ink font-bold" : "text-ink-soft font-medium"}`}
    >
      <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
      <span className={active ? "underline decoration-2 underline-offset-4" : ""}>{label}</span>
    </Link>
  );
}

/** Mobile: one printed bar along the bottom edge with the Catat seal in the middle. */
export function BottomNav({ onOpenVoice, userEmail }: BottomNavProps) {
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
          className="md:hidden fixed inset-0 z-50 bg-paper flex flex-col"
        >
          <div className="flex items-center justify-between gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3 border-b border-ink/15">
            <h2 className="font-display text-head font-bold text-ink">Semua fitur</h2>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-11 h-11 rounded-full border border-ink/20 text-ink flex items-center justify-center"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav aria-label="Semua fitur" className="flex-1 overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            {NAV_GROUPS.map((group) => (
              <section key={group.id} className="pt-4">
                <h3 className="text-meta font-semibold uppercase tracking-[0.1em] text-ink-soft pb-1">{group.label}</h3>
                <ul className="divide-y divide-ink/10 border-y border-ink/10">
                  {group.items.map((item) => {
                    // Guests only get the sign-in page instead of a profile.
                    const href = isGuest && item.href === "/profile" ? "/login" : isGuest && item.href === "/dashboard" ? "/" : item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={href}
                          onClick={() => setIsMenuOpen(false)}
                          aria-current={pathname === item.href ? "page" : undefined}
                          className="flex items-center gap-3 min-h-12 py-2 text-ink"
                        >
                          <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                          <span className="min-w-0">
                            <span className={`block text-body ${pathname === item.href ? "font-bold underline underline-offset-4" : "font-semibold"}`}>
                              {isGuest && item.href === "/profile" ? "Masuk" : item.label}
                            </span>
                            <span className="block text-meta text-ink-soft">{item.desc}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      )}

      <nav
        aria-label="Navigasi Bawah Mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper border-t border-ink/20 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 items-end h-16 max-w-md mx-auto px-1">
          <Tab href={homeHref} label="Beranda" icon={Home} active={isHome} ariaLabel={isGuest ? "Halaman Beranda" : "Halaman Dashboard"} />
          <Tab href="/wallets" label="Dompet" icon={CreditCard} active={pathname === "/wallets"} />
          <div className="flex justify-center -mt-7 self-start">
            <Seal onClick={onOpenVoice} size={72} label="Catat pengeluaran dengan suara" />
          </div>
          <Tab href="/reports" label="Laporan" icon={FileSpreadsheet} active={pathname === "/reports"} />
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-haspopup="dialog"
            className="flex flex-col items-center justify-center gap-0.5 min-h-12 text-meta font-medium text-ink-soft"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
}
