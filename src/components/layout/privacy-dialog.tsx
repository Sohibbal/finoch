"use client";

import React from "react";
import { ShieldCheck, X, MicOff, Lock, Database, Smartphone } from "lucide-react";

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyDialog({ isOpen, onClose }: PrivacyDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-cream-50 dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-navy-950 dark:text-cream-50 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cream-200/80 dark:bg-navy-900 text-navy-950 dark:text-cream-50 border border-cream-300 dark:border-navy-800">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
              Komitmen Privasi Finoch
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-navy-500 hover:text-navy-950 dark:text-cream-400 dark:hover:text-cream-50 hover:bg-cream-200 dark:hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs sm:text-sm text-navy-700 dark:text-cream-200 leading-relaxed">
          <div className="p-4 rounded-2xl bg-cream-100 dark:bg-navy-900/60 border border-cream-300 dark:border-navy-800 text-navy-900 dark:text-cream-100 font-medium text-xs leading-relaxed">
            &ldquo;Finoch tidak menyimpan rekaman audio di cloud. Suara Anda diproses secara lokal di browser, dan data pengeluaran hanya tersimpan setelah Anda meninjau dan mengonfirmasi secara sadar.&rdquo;
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cream-200/70 dark:bg-navy-900 border border-cream-300 dark:border-navy-800 text-navy-900 dark:text-cream-100 shrink-0 mt-0.5">
                <MicOff className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-navy-950 dark:text-cream-50 font-bold text-xs sm:text-sm">
                  Tanpa Rekaman Audio di Server
                </strong>
                <p className="text-xs text-navy-600 dark:text-cream-300/80 mt-0.5">
                  Mikrofon Anda tidak pernah diunggah dalam format berkas audio ke server cloud eksternal.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cream-200/70 dark:bg-navy-900 border border-cream-300 dark:border-navy-800 text-navy-900 dark:text-cream-100 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-navy-950 dark:text-cream-50 font-bold text-xs sm:text-sm">
                  Pemrosesan AI &amp; NLP Lokal
                </strong>
                <p className="text-xs text-navy-600 dark:text-cream-300/80 mt-0.5">
                  Whisper on-device dan parsing rupiah berjalan 100% langsung di mesin browser Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cream-200/70 dark:bg-navy-900 border border-cream-300 dark:border-navy-800 text-navy-900 dark:text-cream-100 shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-navy-950 dark:text-cream-50 font-bold text-xs sm:text-sm">
                  Penyimpanan Lokal Offline
                </strong>
                <p className="text-xs text-navy-600 dark:text-cream-300/80 mt-0.5">
                  Seluruh catatan pengeluaran tersimpan aman di IndexedDB perangkat, siap dipakai tanpa internet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cream-200/70 dark:bg-navy-900 border border-cream-300 dark:border-navy-800 text-navy-900 dark:text-cream-100 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-navy-950 dark:text-cream-50 font-bold text-xs sm:text-sm">
                  100% Kendali di Tangan Anda
                </strong>
                <p className="text-xs text-navy-600 dark:text-cream-300/80 mt-0.5">
                  Tidak ada pencatatan tersembunyi. Anda selalu melihat dan menyetujui detail transaksi.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs transition active:scale-95 shadow-sm"
        >
          Saya Mengerti
        </button>
      </div>
    </div>
  );
}
