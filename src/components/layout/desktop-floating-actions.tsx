"use client";

import React from "react";
import { Mic, PenLine } from "lucide-react";

interface DesktopFloatingActionsProps {
  onOpenVoice: () => void;
  onOpenManual?: () => void;
}

export function DesktopFloatingActions({
  onOpenVoice,
  onOpenManual,
}: DesktopFloatingActionsProps) {
  return (
    <aside
      aria-label="Aksi Cepat Pengeluaran Desktop"
      className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3"
    >
      {/* 1. Catat Manual Floating Button */}
      <button
        type="button"
        onClick={onOpenManual || onOpenVoice}
        aria-label="Catat pengeluaran secara manual"
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-cream-50/95 dark:bg-navy-900/95 border border-cream-300 dark:border-navy-800 backdrop-blur-xl shadow-lg text-navy-950 dark:text-cream-50 font-bold text-xs hover:bg-cream-100 dark:hover:bg-navy-800 transition-all active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-cream-200/80 dark:bg-navy-800 text-navy-950 dark:text-cream-50 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <PenLine className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
        <span>Catat Manual</span>
      </button>

      {/* 2. Logo Microphone Floating Button */}
      <button
        type="button"
        onClick={onOpenVoice}
        aria-label="Catat pengeluaran dengan suara"
        className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs shadow-xl border border-navy-800 dark:border-cream-200 transition-all active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-navy-800 dark:bg-cream-200 text-cream-50 dark:text-navy-950 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Mic className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span>Catat Suara</span>
      </button>
    </aside>
  );
}
