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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-[#0e1526]/95 border border-slate-200 dark:border-blue-500/25 p-6 shadow-2xl shadow-slate-900/15 dark:shadow-blue-950/80 backdrop-blur-2xl overflow-y-auto max-h-[90vh] text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 stroke-[2.2]" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Komitmen Privasi VoiCash
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/90 dark:border-blue-500/25 text-blue-950 dark:text-blue-200 font-medium">
            &ldquo;VoiCash tidak menyimpan rekaman suara. Suara diproses melalui fitur speech recognition browser, sedangkan data transaksi yang telah dikonfirmasi dapat disimpan pada akun Anda agar dapat digunakan di perangkat lain.&rdquo;
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-white/[0.06] border border-blue-100 dark:border-white/[0.08] text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <MicOff className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">
                  Tanpa Rekaman Audio di Server
                </strong>
                Mikrofon Anda tidak pernah direkam atau diunggah dalam bentuk berkas audio ke server mana pun.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-white/[0.06] border border-blue-100 dark:border-white/[0.08] text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">
                  Pemrosesan NLP Lokal
                </strong>
                Pemisahan transaksi dan deteksi rupiah dijalankan 100% di peramban Anda menggunakan algoritma deterministik tanpa API AI eksternal berbayar.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-white/[0.06] border border-blue-100 dark:border-white/[0.08] text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">
                  Penyimpanan Lokal IndexedDB
                </strong>
                Data pengeluaran Anda disimpan terlebih dahulu di perangkat Anda, sehingga aplikasi tetap berfungsi penuh saat luring (offline).
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-white/[0.06] border border-blue-100 dark:border-white/[0.08] text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-white font-semibold">
                  Hanya Transaksi yang Dikonfirmasi
                </strong>
                Tidak ada data yang disimpan diam-diam. Anda selalu meninjau dan menyetujui transaksi sebelum tersimpan.
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition active:scale-95 shadow-lg shadow-blue-600/25"
        >
          Saya Mengerti
        </button>
      </div>
    </div>
  );
}
