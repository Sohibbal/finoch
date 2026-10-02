"use client";

import React, { useEffect, useState } from "react";
import { Cloud, CloudOff, RefreshCw, Check } from "lucide-react";
import { syncManager } from "@/lib/sync/sync-manager";

export function SyncIndicator() {
  const [status, setStatus] = useState<"synced" | "syncing" | "pending" | "failed" | "offline">("synced");

  useEffect(() => {
    // Initial check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setStatus("offline");
    }

    const unsubscribe = syncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });

    return () => unsubscribe();
  }, []);

  const handleManualSync = () => {
    syncManager.triggerSync();
  };

  if (status === "offline") {
    return (
      <div
        title="Mode Offline: Transaksi tersimpan lokal di IndexedDB"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
      >
        <CloudOff className="w-3 h-3 text-slate-500" />
        <span>Offline</span>
      </div>
    );
  }

  if (status === "syncing") {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
        <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />
        <span>Sinkronisasi...</span>
      </div>
    );
  }

  if (status === "pending" || status === "failed") {
    return (
      <button
        type="button"
        onClick={handleManualSync}
        title="Klik untuk menyinkronkan data sekarang"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
      >
        <Cloud className="w-3 h-3 text-amber-500" />
        <span>Belum Terunggah</span>
      </button>
    );
  }

  return (
    <div
      title="Tersinkronisasi aman dengan cloud"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
    >
      <Check className="w-3 h-3 text-blue-500" />
      <span>Tersinkron</span>
    </div>
  );
}
