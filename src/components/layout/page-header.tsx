"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Breadcrumbs } from "./breadcrumbs";
import { ThemeToggle } from "./theme-toggle";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-side page actions, rendered after the theme toggle. */
  actions?: React.ReactNode;
  className?: string;
}

/** Floating glass "pill" header shared by every app page. */
export function PageHeader({ title, subtitle, actions, className = "" }: PageHeaderProps) {
  const router = useRouter();
  const isDashboard = usePathname() === "/dashboard";

  return (
    <header className={`sticky top-0 z-40 px-4 sm:px-6 pt-[calc(1rem+env(safe-area-inset-top))] pb-2 ${className}`}>
      <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between gap-2 transition-all">
        {/* Left: Back Button, Mobile Brand & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {!isDashboard && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-navy-700 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-white/10 transition-colors shrink-0"
              aria-label="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Link href="/dashboard" className="md:hidden shrink-0 flex items-center" aria-label="Finoch Beranda">
            <BrandLogo variant="symbol" className="w-5 h-5 shrink-0" />
          </Link>
          <div className="min-w-0">
            {!isDashboard && <Breadcrumbs className="hidden md:flex mb-0.5" />}
            <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] text-navy-500 dark:text-cream-400 hidden sm:block truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </header>
  );
}
