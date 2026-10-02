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
    const dismissed = localStorage.getItem("voicash_pwa_dismissed") === "true";
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
      alert("Untuk memasang VoiCash: Tekan tombol Berbagi (Share) di peramban, lalu pilih 'Tambahkan ke Layar Utama' (Add to Home Screen).");
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("voicash_pwa_dismissed", "true");
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
          aria-label="Pasang Aplikasi VoiCash"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-lg text-xs font-semibold transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Pasang App</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:right-auto sm:max-w-sm md:bottom-6 md:left-6 z-40 animate-fade-in">
      <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-[#0e1526]/95 border border-slate-200/90 dark:border-blue-500/30 backdrop-blur-xl shadow-2xl shadow-slate-900/10 dark:shadow-blue-950/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-blue-500/30">
            VC
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Pasang VoiCash
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Akses cepat layar utama &amp; luring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-600/20 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Pasang</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup rekomendasi pasang"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
