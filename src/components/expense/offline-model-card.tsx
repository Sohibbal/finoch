"use client";

import React, { useState } from "react";
import { Download, CheckCircle2, Trash2, Loader2, Sparkles, WifiOff } from "lucide-react";

interface OfflineModelCardProps {
  isModelDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: () => Promise<void | boolean>;
  onDelete: () => Promise<void>;
  isOnline: boolean;
}

export function OfflineModelCard({
  isModelDownloaded,
  isDownloading,
  downloadProgress,
  onDownload,
  onDelete,
  isOnline,
}: OfflineModelCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-[#0b1120]/80 border border-blue-200/80 dark:border-blue-500/25 text-xs space-y-2.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">
              Paket Suara Offline (Whisper AI ~39 MB)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bicara dan catat pengeluaran kapan saja tanpa internet
            </p>
          </div>
        </div>

        {isModelDownloaded && !isDownloading && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300/80 dark:border-blue-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Aktif</span>
          </span>
        )}
      </div>

      {/* State 1: Sedang Mengunduh */}
      {isDownloading && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Mengunduh model suara offline...</span>
            </span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Model disimpan sekali di cache browser perangkat Anda.
          </p>
        </div>
      )}

      {/* State 2: Sudah Diunduh */}
      {isModelDownloaded && !isDownloading && (
        <div className="flex items-center justify-between pt-1 border-t border-blue-100 dark:border-white/[0.06] text-[11px]">
          <span className="text-slate-600 dark:text-slate-300">
            Tersimpan di memori perangkat
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
            <span>Hapus Model</span>
          </button>
        </div>
      )}

      {/* State 3: Belum Diunduh */}
      {!isModelDownloaded && !isDownloading && (
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-blue-100 dark:border-white/[0.06]">
          <span className="text-slate-600 dark:text-slate-300 text-[11px]">
            {isOnline
              ? "Unduh sekali saat ada internet untuk digunakan saat offline."
              : "Perangkat offline. Sambungkan internet sekali untuk mengunduh."}
          </span>

          {isOnline ? (
            <button
              type="button"
              onClick={onDownload}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Model (39 MB)</span>
            </button>
          ) : (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Perlu Internet 1x</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
