"use client";

import React from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArrowRight } from "lucide-react";

interface LandingNavbarProps {
  userEmail: string | null;
}

export function LandingNavbar({ userEmail }: LandingNavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-2.5 sm:pt-3 animate-navbar-down">
      <div className="rounded-2xl bg-[#eaf0fd]/90 dark:bg-[#070A11]/90 backdrop-blur-xl border border-blue-200/70 dark:border-slate-800/80 shadow-xl shadow-blue-900/5 dark:shadow-2xl dark:shadow-black/60 px-3.5 sm:px-6 py-2 sm:py-2.5 transition-all flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand Logo */}
        <Link href="/" aria-label="Finoch Beranda" className="shrink-0 flex items-center gap-2">
          <BrandLogo variant="full" className="h-6 sm:h-7 w-auto" />
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav aria-label="Navigasi Halaman" className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <a href="#fitur" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Fitur
          </a>
          <a href="#finbot" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            FinBot AI
          </a>
          <a href="#demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Preview
          </a>
          <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Tanya Jawab
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeToggle />

          {userEmail ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold hover:opacity-90 active:scale-98 transition-all shadow-xs"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-bold hover:opacity-90 active:scale-98 transition-all shadow-xs"
            >
              <span>Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
