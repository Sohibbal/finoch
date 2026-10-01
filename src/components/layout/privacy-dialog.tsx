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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Komitmen Privasi VoiCash
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-950 dark:text-indigo-200 font-medium">
            &ldquo;VoiCash tidak menyimpan rekaman suara. Suara diproses melalui fitur speech recognition browser, sedangkan data transaksi yang telah dikonfirmasi dapat disimpan pada akun Anda agar dapat digunakan di perangkat lain.&rdquo;
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 shrink-0 mt-0.5">
                <MicOff className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 font-semibold">
                  Tanpa Rekaman Audio di Server
                </strong>
                Mikrofon Anda tidak pernah direkam atau diunggah dalam bentuk file suara (.mp3/.wav) ke server VoiCash.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-emerald-600 shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 font-semibold">
                  Pemrosesan NLP Lokal
                </strong>
                Pemisahan transaksi dan deteksi rupiah dijalankan 100% di browser Anda menggunakan algoritma deterministik tanpa API AI eksternal berbayar.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 shrink-0 mt-0.5">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 font-semibold">
                  Penyimpanan Lokal IndexedDB
                </strong>
                Data pengeluaran Anda disimpan terlebih dahulu di perangkat Anda, sehingga aplikasi tetap dapat digunakan saat offline.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-600 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-900 dark:text-slate-100 font-semibold">
                  Hanya Transaksi yang Dikonfirmasi
                </strong>
                Tidak ada data yang disimpan diam-diam. Anda selalu memiliki kesempatan untuk meninjau dan mengedit sebelum menyimpan.
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
        >
          Saya Mengerti
        </button>
      </div>
    </div>
  );
}
