"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  // The big banner only fits the landing page: in the app it covered page headers and modals.
  const isLanding = usePathname() === "/";
  // On the landing the banner waits until the visitor has scrolled past the first screen,
  // so it never sits on top of the hero and the live demo.
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () =>
      setPastHero(
        window.scrollY > window.innerHeight * 0.8 ||
          (window.innerWidth < 768 && window.scrollY > 40)
      );
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

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

  if (isInstalled) {
    return null;
  }

  if (!isLanding || isDismissed) {
    // In the app only a small desktop pill, and only when the browser says Finoch is installable.
    // Phones keep the bottom edge for the nav alone. z-30 keeps it under modals (z-50).
    if (!isLanding) return null;
    return (
      <>
        {/* Floating mobile install button on landing page */}
        <div className="md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40">
          <button
            type="button"
            onClick={handleInstallClick}
            aria-label="Install PWA"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-lg border border-slate-800 dark:border-slate-200 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-teal-400 dark:text-teal-600" />
            <span>Install App</span>
          </button>
        </div>

        {/* Desktop pill */}
        <div className="hidden md:block fixed md:bottom-6 md:right-6 z-30">
          <button
            type="button"
            onClick={handleInstallClick}
            aria-label="Install PWA"
            className="flex items-center gap-2 px-4 min-h-10 rounded-full bg-white dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold shadow-lg transition-all"
          >
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Install PWA</span>
          </button>
        </div>
      </>
    );
  }

  if (!pastHero) return null;

  return (
    // Landing only, after the first screen: floating card anchored to the bottom-right.
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 left-auto sm:max-w-sm md:bottom-6 md:right-6 z-40">
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/90 dark:border-slate-800 shadow-xl flex items-center justify-between gap-3 text-slate-900 dark:text-white">
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo variant="symbol" className="w-8 h-8 shrink-0" theme="auto" />
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">Pasang Finoch di HP</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Kontrol &amp; akses cepat</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="h-9 px-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup rekomendasi pasang"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
