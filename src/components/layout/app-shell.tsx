"use client";

import React, { Fragment, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "./dashboard-sidebar";
import { BottomNav } from "./bottom-nav";
import { useAuthContext } from "./auth-provider";
import { DATA_PULLED_EVENT } from "@/lib/sync/document-keys";

/** The dashboard listens for this to open its voice sheet from the bottom nav mic. */
export const OPEN_VOICE_EVENT = "finoch:open-voice";

function isOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, sessionUnavailable } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  // Offline the session check can't reach the server: keep showing the local-first data of the
  // current storage scope instead of bouncing to /login.
  // A 5xx from /api/auth/me is treated the same way: never log users out because the DB is down.
  const sessionUnknown = sessionUnavailable || isOffline();
  const canShowPage = Boolean(user) || (!isLoading && sessionUnknown);
  // Bumped when sync wrote server data into localStorage, so pages re-read it.
  const [dataRevision, setDataRevision] = useState(0);

  useEffect(() => {
    const onPulled = () => setDataRevision((r) => r + 1);
    window.addEventListener(DATA_PULLED_EVENT, onPulled);
    return () => window.removeEventListener(DATA_PULLED_EVENT, onPulled);
  }, []);

  useEffect(() => {
    if (isLoading || user || sessionUnknown) return;
    const next = window.location.pathname + window.location.search;
    // The cookie can still pass middleware while /api/auth/me finds no user (e.g. deleted
    // account): clear it first, or /login would send us straight back here.
    fetch("/api/auth/logout", { method: "POST" })
      .catch(() => {})
      .finally(() => router.replace(`/login?next=${encodeURIComponent(next)}`));
  }, [isLoading, user, sessionUnknown, router]);

  const openVoice = () => {
    if (pathname === "/dashboard") window.dispatchEvent(new Event(OPEN_VOICE_EVENT));
    else router.push("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] bg-paper text-ink flex flex-col md:flex-row transition-colors">
      <DashboardSidebar className="hidden md:flex print:hidden" />

      {/* Document scroll (no h-screen overflow box) so iOS can collapse the address bar.
          Bottom padding reserves the mobile nav, its seal and page action bars. */}
      <div className="flex-1 flex flex-col min-w-0 pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-12 print:p-0">
        {canShowPage ? (
          // Pages read per-user storage on mount: remount them when the account or pulled data changes.
          <Fragment key={`${user?.id ?? "offline"}:${dataRevision}`}>{children}</Fragment>
        ) : (
          <div className="flex-1 flex items-center justify-center py-32" aria-busy="true">
            <Loader2 className="w-6 h-6 motion-safe:animate-spin text-ink-soft" aria-label="Memuat" />
          </div>
        )}
      </div>

      <div className="print:hidden">
        <BottomNav onOpenVoice={openVoice} userEmail={user?.email ?? null} />
      </div>
    </div>
  );
}
