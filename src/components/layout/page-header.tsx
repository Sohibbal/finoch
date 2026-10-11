"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FlaskConical,
  Bell,
  Search,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { isDemoMode } from "@/lib/storage/local-storage";
import { seedDemoExpenses } from "@/lib/storage/demo-seed";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Breadcrumbs } from "./breadcrumbs";
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
  const [nickname, setNickname] = useState("Kawan");

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("finoch_user_nickname");
      if (stored && stored.trim()) setNickname(stored.trim());
    }
  }, []);

  const navPills = [
    { label: "Overview", href: "/dashboard" },
    { label: "Pemasukan", href: "/pemasukan" },
    { label: "Pengeluaran", href: "/pengeluaran" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Copilot", href: "/copilot" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 bg-white/90 dark:bg-[#0E1422]/90 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 print:static ${className}`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand / Mobile Back / Title */}
        <div className="flex items-center gap-3 min-w-0">
          {!isDashboard && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="-ml-1 w-9 h-9 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <Link href="/dashboard" className="flex items-center gap-2 shrink-0" aria-label="Finoch Beranda">
            <BrandLogo variant="symbol" className="w-7 h-7 text-blue-600" />
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white hidden sm:inline">
              Finoch
            </span>
          </Link>

          <div className="hidden lg:block h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <div className="min-w-0 hidden sm:block">
            {!isDashboard && <Breadcrumbs className="hidden md:flex mb-0.5" />}
            <h1 className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
              {title}
            </h1>
          </div>
        </div>

        {/* Center: Subly-style Pill Navigation Bar (Desktop) */}
        <nav
          aria-label="Navigasi Atas"
          className="hidden md:flex items-center gap-1 p-1 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 shadow-inner"
        >
          {navPills.map((pill) => {
            const active = pathname === pill.href;
            return (
              <Link
                key={pill.href}
                href={pill.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {pill.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions, Search, Notifications, Theme, User Pill */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <GlobalSearchBar className="hidden sm:block" />

          {/* Notification Button */}
          <button
            type="button"
            title="Notifikasi"
            aria-label="Notifikasi"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          <ThemeToggle />

          {/* User Profile Pill (Matching Subly "James Noah" User Box) */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
              {nickname.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden xl:block leading-tight">
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {nickname}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Personal / Pro
              </p>
            </div>
          </Link>

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
