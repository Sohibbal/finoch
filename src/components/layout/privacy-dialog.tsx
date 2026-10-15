"use client";

import React, { useEffect, useRef } from "react";
import { ShieldCheck, X } from "lucide-react";

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Each line states what really happens to the data, including where it leaves the phone.
const LINES: { title: string; body: string }[] = [
  {
    title: "Suara",
    body: "Saat online, suara diubah jadi teks oleh layanan suara bawaan browser (misalnya Google di Chrome). Saat offline, Whisper mengolahnya langsung di HP. Finoch tidak menyimpan rekaman audio.",
  },
  {
    title: "Teks catatan",
    body: "Kalimat yang kamu ucapkan dibaca parser di HP. Kalau kamu login, teksnya (bukan audio) bisa dikirim ke server Finoch supaya dibantu AI membaca item dan nominal.",
  },
  {
    title: "Foto struk",
    body: "Struk bisa dibaca di HP, atau diunggah ke server Finoch untuk dibaca lebih teliti. Foto tidak disimpan setelah dibaca.",
  },
  {
    title: "Tempat data",
    body: "Catatan tersimpan dulu di HP, jadi tetap jalan tanpa sinyal. Kalau kamu login, catatan dan data fitur disinkron ke akunmu supaya aman saat ganti HP.",
  },
  {
    title: "Kamu yang memutuskan",
    body: "Tidak ada yang tersimpan sebelum kamu cek dan konfirmasi. Mode Demo memakai data contoh yang terpisah dan tidak pernah disinkron.",
  },
];

export function PrivacyDialog({ isOpen, onClose }: PrivacyDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-dialog-title"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-blue-950/20 dark:shadow-black/80 overflow-hidden glass-sheen"
      >
        {/* Top Horizon Subtle Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent pointer-events-none" />

        {/* Card 2D Square / Radial Dot Grid Pattern (Matching Landing Page Cards) */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

        {/* Dialog Header */}
        <div className="relative z-10 flex items-start justify-between gap-4 p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="privacy-dialog-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Privasi di Finoch
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Apa yang terjadi pada suara, struk, dan catatanmu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Tutup dialog privasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dialog Body (Scrollable List) */}
        <div className="relative z-10 overflow-y-auto px-5 sm:px-6 py-4 space-y-3 flex-1">
          {LINES.map((line, i) => (
            <div
              key={line.title}
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0E1628]/80 border border-slate-200/70 dark:border-slate-800/80 flex items-start gap-3 transition-card"
            >
              <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-500/20">
                {i + 1}
              </span>
              <div className="space-y-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {line.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {line.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dialog Footer Action */}
        <div className="relative z-10 p-5 sm:p-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0B1120]/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs sm:text-sm hover:opacity-90 active:scale-98 transition-all shadow-md cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
