"use client";

import React, { useState, useEffect, useRef } from "react";

export function OfflineBanner() {
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setShowOnlineToast(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  if (!mounted) {
    return null;
  }

  // 1. Offline Banner (Persistent while offline)
  if (!isOnline) {
    return (
      <aside
        role="status"
        aria-live="polite"
        data-testid="offline-banner"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-2 px-4 bg-amber-500/95 dark:bg-amber-600/95 text-white backdrop-blur-md shadow-md text-xs sm:text-sm font-semibold transition-transform duration-300 ease-out transform translate-y-0"
      >
        <div className="flex items-center gap-2 text-center leading-tight">
          <span>🟠 Mode Offline Aktif · Data tersimpan lokal di HP (IndexedDB)</span>
        </div>
      </aside>
    );
  }

  // 2. Back Online Notification Toast (Brief temporary notification)
  if (showOnlineToast) {
    return (
      <aside
        role="status"
        aria-live="polite"
        data-testid="online-toast"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center py-2 px-4 rounded-full bg-emerald-600/95 text-white backdrop-blur-md shadow-lg text-xs sm:text-sm font-semibold transition-all duration-300 animate-fade-in"
      >
        <div className="flex items-center gap-2 text-center leading-tight">
          <span>🟢 Terhubung Kembali · Data otomatis sinkron ke server</span>
        </div>
      </aside>
    );
  }

  return null;
}

export default OfflineBanner;
