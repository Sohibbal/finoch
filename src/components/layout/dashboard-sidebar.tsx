"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useAuthContext } from "./auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { NAV_GROUPS, matchesNav } from "./nav-items";

interface DashboardSidebarProps {
  className?: string;
}

/** Desktop index of every feature, printed like the contents page of a note book. */
export function DashboardSidebar({ className = "" }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ? group.items
      : group.items.filter((item) => matchesNav(item, searchQuery)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      className={`w-64 h-screen sticky top-0 self-start overflow-hidden bg-white dark:bg-[#0B1320] border-r border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 ${className}`}
    >
      <div className="p-4 pb-3 space-y-3 shrink-0 border-b border-slate-100 dark:border-slate-800">
        <Link href="/dashboard" className="inline-flex items-center" aria-label="finoch.id dashboard">
          <BrandLogo variant="full" className="h-6 w-auto" />
        </Link>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari menu..."
            aria-label="Cari menu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 placeholder:text-slate-400 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Navigasi fitur" className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {groups.map((group) => (
          <div key={group.id}>
            <h2 className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{group.label}</h2>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        active
                          ? "bg-slate-100 dark:bg-slate-800/90 text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.2 : 1.75} aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {groups.length === 0 && (
          <p className="p-4 text-center text-xs text-slate-400">Tidak ada fitur yang cocok dengan &quot;{searchQuery}&quot;</p>
        )}
      </nav>

      {/* Support Banner (Treehouse QA style) */}
      <div className="px-3 pb-3">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Butuh Bantuan Finansial?</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Tanya FinBot seputar tips hemat &amp; wishlist lo.</p>
          <Link
            href="/copilot"
            className="inline-block w-full py-1.5 text-center text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Tanya FinBot
          </Link>
        </div>
      </div>

      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">PWA offline siap</span>
          <ThemeToggle />
        </div>

        {user ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              title="Keluar Akun"
              aria-label="Keluar Akun"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full py-2 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Masuk Akun
          </Link>
        )}
      </div>
    </aside>
  );
}
