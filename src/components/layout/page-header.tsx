"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, UserRoundCog, WifiOff, type LucideIcon } from "lucide-react";
import { isDemoMode } from "@/lib/storage/local-storage";
import { seedDemoExpenses } from "@/lib/storage/demo-seed";
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
  // Read after mount: storage is client-only and the server render must match the first client render.
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    const on = isDemoMode();
    setDemo(on);
    if (!on) return;
    // Every page has this header, so an empty demo scope gets its sample expenses wherever the app opens.
    seedDemoExpenses()
      .then((added) => {
        if (added > 0) window.dispatchEvent(new Event("finoch:data-pulled"));
      })
      .catch((err) => console.error("Gagal mengisi data demo:", err));
  }, []);

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
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide truncate">{title}</h1>
              {demo && (
                <Link
                  href="/profile"
                  title="Data contoh aktif. Matikan di halaman Profil."
                  className="shrink-0 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800"
                >
                  Mode Demo
                </Link>
              )}
            </div>
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

interface ProfileGateProps {
  profile: { loading: boolean; error: boolean; hasProfile: boolean };
  children: React.ReactNode;
}

/**
 * Page body for pages computed from the user's allowance: skeletons while the profile loads,
 * an onboarding link when there is none, so no page ever shows placeholder amounts.
 */
export function ProfileGate({ profile, children }: ProfileGateProps) {
  if (profile.loading) {
    return (
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3">
        <ContentSkeleton />
      </main>
    );
  }
  if (!profile.hasProfile) {
    return (
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3">
        {profile.error ? (
          <EmptyState
            icon={WifiOff}
            title="Profil keuangan belum bisa dimuat"
            action={
              <button type="button" onClick={() => window.location.reload()} className={EMPTY_ACTION_CLASS}>
                Coba Lagi
              </button>
            }
          >
            Periksa koneksi internet, lalu coba lagi. Angka di halaman ini dihitung dari uang saku bulananmu.
          </EmptyState>
        ) : (
          <EmptyState
            icon={UserRoundCog}
            title="Lengkapi profil keuanganmu dulu"
            action={
              <Link href="/onboarding" className={EMPTY_ACTION_CLASS}>
                Isi Profil Keuangan
              </Link>
            }
          >
            Halaman ini dihitung dari uang saku dan pengeluaran tetap bulananmu. Isi sekali, berlaku di semua fitur.
          </EmptyState>
        )}
      </main>
    );
  }
  return <>{children}</>;
}

export const EMPTY_ACTION_CLASS =
  "inline-block px-5 py-2.5 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs transition-colors";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** Primary (and optional secondary) action buttons or links. */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared zero-data card so empty pages read as intentional: icon, short copy, primary action. */
export function EmptyState({ icon: Icon, title, action, children }: EmptyStateProps) {
  return (
    <div className="max-w-md mx-auto mt-6 p-6 rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 text-center space-y-3 shadow-sm">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-cream-100 dark:bg-navy-900 flex items-center justify-center">
        <Icon className="w-5 h-5 text-navy-700 dark:text-cream-200" />
      </div>
      <h2 className="text-base font-bold text-navy-950 dark:text-cream-50">{title}</h2>
      <p className="text-xs text-navy-600 dark:text-cream-300/70">{children}</p>
      {action && <div className="flex flex-wrap justify-center gap-2 pt-1">{action}</div>}
    </div>
  );
}

/** Placeholder blocks while page data loads, instead of zero-filled cards. */
export function ContentSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-36 rounded-3xl bg-cream-200/70 dark:bg-navy-900/70 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-28 rounded-2xl bg-cream-200/70 dark:bg-navy-900/70 animate-pulse" />
        <div className="h-28 rounded-2xl bg-cream-200/70 dark:bg-navy-900/70 animate-pulse" />
      </div>
    </div>
  );
}
