"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FlaskConical,
  Bell,
} from "lucide-react";
import { isDemoMode } from "@/lib/storage/local-storage";
import { seedDemoExpenses } from "@/lib/storage/demo-seed";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearchBar } from "./global-search-bar";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className = "" }: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    const on = isDemoMode();
    setDemo(on);
    if (!on) return;
    seedDemoExpenses()
      .then((added) => {
        if (added > 0) window.dispatchEvent(new Event("finoch:data-pulled"));
      })
      .catch((err) => console.error("Gagal mengisi data demo:", err));
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 bg-[#eaf0fd]/95 dark:bg-[#070A11]/95 backdrop-blur-xl border-b border-blue-200/70 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 print:static ${className}`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand / Mobile Back / Title */}
        <div className="flex items-center gap-3 min-w-0">
          {!isDashboard && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="-ml-1 w-9 h-9 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions, Search, Notifications, Theme */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <GlobalSearchBar className="hidden sm:block" />

          {/* Notification Button */}
          <button
            type="button"
            title="Notifikasi"
            aria-label="Notifikasi"
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800 border border-blue-200/70 dark:border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 flex items-center justify-center transition-colors shadow-xs"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          <ThemeToggle />

          {actions}
        </div>
      </div>

      {/* Demo scope note */}
      {demo && (
        <div className="max-w-[1400px] mx-auto pt-1">
          <p className="text-[11px] text-slate-400">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 underline"
            >
              <FlaskConical className="w-3 h-3 text-amber-500" />
              Mode Demo
            </Link>{" "}
            (data contoh lokal, atur di Profil)
          </p>
        </div>
      )}
    </header>
  );
}
