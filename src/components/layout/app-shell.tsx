"use client";

import React, { Fragment, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { BottomNav } from "./bottom-nav";
import { useAuthContext } from "./auth-provider";

/** The dashboard listens for this to open its voice sheet from the bottom nav mic. */
export const OPEN_VOICE_EVENT = "finoch:open-voice";

function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  // Offline the session check can't reach the server: keep showing the local-first data of the
  // current storage scope instead of bouncing to /login.
  const canShowPage = Boolean(user) || (!isLoading && isOffline());

  useEffect(() => {
    if (isLoading || user || isOffline()) return;
    const next = window.location.pathname + window.location.search;
    // The cookie can still pass middleware while /api/auth/me finds no user (e.g. deleted
    // account): clear it first, or /login would send us straight back here.
    fetch("/api/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => router.replace(`/login?next=${encodeURIComponent(next)}`));
  }, [isLoading, user, router]);

  const openVoice = () => {
    if (pathname === "/dashboard") window.dispatchEvent(new Event(OPEN_VOICE_EVENT));
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] bg-cream-50 dark:bg-[#030712] text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors selection:bg-navy-900 selection:text-white">
      <DashboardSidebar className="hidden md:flex print:hidden" />

      {/* Document scroll (no h-screen overflow box) so iOS can collapse the address bar.
          Bottom padding reserves the mobile nav, floating pills and page action bars. */}
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(12rem+env(safe-area-inset-bottom))] md:pb-12 print:p-0">
        {canShowPage ? (
          // Pages read per-user storage on mount: remount them when the account changes.
          <Fragment key={user?.id ?? "offline"}>{children}</Fragment>
        ) : (
          <div className="flex-1 flex items-center justify-center py-32" aria-busy="true">
            <Loader2 className="w-6 h-6 animate-spin text-navy-400 dark:text-cream-400" aria-label="Memuat" />
          </div>
        )}
      </div>

      <div className="print:hidden">
        <BottomNav onOpenVoice={openVoice} userEmail={user?.email ?? null} />
      </div>
    </div>
  );
}
