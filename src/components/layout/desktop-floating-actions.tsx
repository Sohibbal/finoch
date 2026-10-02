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
        className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-white/95 dark:bg-[#0e1526]/90 border border-slate-200 dark:border-blue-500/30 backdrop-blur-xl shadow-xl shadow-slate-900/10 dark:shadow-blue-950/50 text-slate-800 dark:text-slate-100 font-bold text-xs hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-[#141f36] transition-all duration-200 active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <PenLine className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
        <span>Catat Manual</span>
      </button>

      {/* 2. Logo Microphone Floating Button */}
      <button
        type="button"
        onClick={onOpenVoice}
        aria-label="Catat pengeluaran dengan suara"
        className="group flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-2xl shadow-blue-600/40 border border-blue-400/40 transition-all duration-200 active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-slate-950/40 text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Mic className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span>Catat Suara</span>
      </button>
    </aside>
  );
}
