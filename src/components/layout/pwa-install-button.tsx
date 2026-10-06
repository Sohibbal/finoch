"use client";

import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed previously in this session or local storage
    const dismissed = localStorage.getItem("finoch_pwa_dismissed") === "true";
    if (dismissed) {
      setIsDismissed(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        "Untuk memasang Finoch di HP:\n\n" +
        "1. Chrome Android: Tekan menu titik tiga (⋮) > 'Tambahkan ke Layar Utama' atau 'Instal Aplikasi'.\n" +
        "2. Safari iPhone: Tekan tombol Bagikan (Share) > 'Tambahkan ke Layar Utama'.\n\n" +
        "Catatan: Jika memakai jaringan Wi-Fi lokal (HTTP IP), pastikan menggunakan HTTPS atau mengaktifkan flag insecure-origin di Chrome."
      );
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Install prompt error:", err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("finoch_pwa_dismissed", "true");
  };

  if (isInstalled || (isDismissed && !deferredPrompt)) {
    return null;
  }

  if (isDismissed) {
    return (
      <div className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40">
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Pasang Aplikasi Finoch"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-cream-50 dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 text-navy-900 dark:text-cream-100 hover:bg-cream-100 dark:hover:bg-navy-900 shadow-lg text-xs font-bold transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-navy-900 dark:text-cream-100" />
          <span>Pasang Finoch</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:right-auto sm:max-w-sm md:bottom-6 md:left-6 z-40 animate-fade-in">
      <div className="p-3.5 rounded-2xl bg-cream-50/95 dark:bg-[#070E1A]/95 border border-cream-300 dark:border-navy-800 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 text-navy-950 dark:text-cream-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            FN
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-navy-950 dark:text-cream-50 truncate">
                Pasang Finoch
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-navy-600 dark:text-cream-300/80 truncate">
              Akses cepat layar utama &amp; luring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Pasang</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup rekomendasi pasang"
            className="p-1.5 rounded-lg text-navy-400 hover:text-navy-950 dark:text-cream-400 dark:hover:text-cream-50 hover:bg-cream-200 dark:hover:bg-navy-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
