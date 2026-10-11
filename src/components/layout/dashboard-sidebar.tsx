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
      className={`w-64 h-screen sticky top-0 self-start overflow-hidden bg-paper border-r border-ink/15 flex flex-col shrink-0 ${className}`}
    >
      <div className="p-4 pb-3 space-y-3 shrink-0 border-b border-ink/15">
        <Link href="/dashboard" className="inline-flex items-center" aria-label="finoch.id dashboard">
          <BrandLogo variant="full" className="h-6 w-auto" />
        </Link>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari menu..."
            aria-label="Cari menu"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-9 text-meta bg-paper-sheet border border-ink/20 placeholder:text-ink-soft text-ink focus:outline-none focus:border-ink"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-ink-soft hover:text-ink"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Navigasi fitur" className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {groups.map((group) => (
          <div key={group.id}>
            <h2 className="px-2 pb-1 text-meta font-semibold uppercase tracking-[0.1em] text-ink-soft">{group.label}</h2>
            <ul>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 px-2 min-h-9 text-body transition-colors ${
                        active ? "bg-ink text-paper-sheet dark:text-paper font-semibold" : "text-ink hover:bg-ink/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {groups.length === 0 && (
          <p className="p-4 text-center text-meta text-ink-soft">Tidak ada fitur yang cocok dengan &quot;{searchQuery}&quot;</p>
        )}
      </nav>

      <div className="p-3 border-t border-ink/15 space-y-2 shrink-0">
        <div className="flex items-center justify-between px-1">
          <span className="text-meta text-ink-soft">PWA offline siap</span>
          <ThemeToggle />
        </div>

        {user ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0">
              <p className="text-meta font-semibold text-ink truncate">{user.name}</p>
              <p className="text-meta text-ink-soft truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              title="Keluar Akun"
              aria-label="Keluar Akun"
              className="w-10 h-10 flex items-center justify-center text-ink-soft hover:text-habis-ink transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="w-full min-h-10 flex items-center justify-center bg-ink text-paper-sheet dark:text-paper text-body font-semibold"
          >
            Masuk Akun
          </Link>
        )}
      </div>
    </aside>
  );
}
