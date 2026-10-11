"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical, UserRoundCog, WifiOff, type LucideIcon } from "lucide-react";
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

/**
 * Printed masthead shared by every app page: solid paper, one hairline rule, no glass.
 * The title wraps instead of truncating; on narrow screens the actions drop below it.
 */
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
    <header
      className={`sticky top-0 z-40 bg-paper border-b border-ink/15 pt-[env(safe-area-inset-top)] print:static ${className}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 basis-48">
          {!isDashboard && (
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="-ml-2 w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors shrink-0"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {/* On phones the mark only sits on Beranda: subpages already have the back arrow, and the title needs the room. */}
          <Link href="/dashboard" className={`${isDashboard ? "md:hidden" : "hidden"} shrink-0 flex items-center`} aria-label="Finoch Beranda">
            <BrandLogo variant="symbol" className="w-6 h-6 shrink-0" />
          </Link>
          <div className="min-w-0">
            {!isDashboard && <Breadcrumbs className="hidden md:flex mb-0.5" />}
            <h1 className="font-display text-head font-bold text-ink break-words">{title}</h1>
            {subtitle && <p className="text-meta text-ink-soft hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <ThemeToggle className="hidden md:inline-flex" />
          {actions}
        </div>

        {/* Its own line under the title row, so a wrapped title never collides with it. Ink, not a status hue. */}
        {demo && (
          <p className="basis-full text-meta text-ink-soft">
            <Link href="/profile" className="inline-flex items-center gap-1 min-h-6 font-semibold text-ink underline underline-offset-2 decoration-ink/40 hover:decoration-ink">
              <FlaskConical className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Mode Demo
            </Link>{" "}
            · data contoh, matikan di Profil
          </p>
        )}
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
  "inline-flex items-center min-h-11 px-5 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet dark:text-paper font-semibold text-body transition-colors";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** Primary (and optional secondary) action buttons or links. */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** Shared zero-data sheet so empty pages read as intentional: icon, short copy, primary action. */
export function EmptyState({ icon: Icon, title, action, children }: EmptyStateProps) {
  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-paper-sheet border border-ink/20 text-center space-y-3">
      <Icon className="w-6 h-6 mx-auto text-ink" />
      <h2 className="font-display text-head font-bold text-ink">{title}</h2>
      <p className="text-body text-ink-soft">{children}</p>
      {action && <div className="flex flex-wrap justify-center gap-2 pt-1">{action}</div>}
    </div>
  );
}

/** Placeholder blocks while page data loads, instead of zero-filled cards. */
export function ContentSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-36 bg-paper-deep motion-safe:animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-28 bg-paper-deep motion-safe:animate-pulse" />
        <div className="h-28 bg-paper-deep motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
