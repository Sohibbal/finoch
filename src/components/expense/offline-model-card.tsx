"use client";

import React, { useState } from "react";
import { Download, CheckCircle2, Trash2, Loader2, Sparkles, WifiOff, Check } from "lucide-react";
import { OfflineModelTier, OFFLINE_MODEL_CONFIGS } from "@/hooks/use-offline-whisper";

interface OfflineModelCardProps {
  isModelDownloaded: boolean;
  activeModelTier?: OfflineModelTier | null;
  selectedModelTier?: OfflineModelTier;
  onSelectTier?: (tier: OfflineModelTier) => void;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: (tier?: OfflineModelTier) => Promise<void | boolean>;
  onDelete: () => Promise<void>;
  isOnline: boolean;
}

export function OfflineModelCard({
  isModelDownloaded,
  activeModelTier = null,
  selectedModelTier = "base",
  onSelectTier,
  isDownloading,
  downloadProgress,
  onDownload,
  onDelete,
  isOnline,
}: OfflineModelCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [internalTier, setInternalTier] = useState<OfflineModelTier>(selectedModelTier);

  const currentSelectedTier = onSelectTier ? selectedModelTier : internalTier;

  const handleSelectTier = (tier: OfflineModelTier) => {
    if (isDownloading) return;
    if (onSelectTier) {
      onSelectTier(tier);
    } else {
      setInternalTier(tier);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedConfig = OFFLINE_MODEL_CONFIGS[currentSelectedTier];
  const isSelectedTierActive = activeModelTier === currentSelectedTier;

  return (
    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-[#0b1120]/90 border border-blue-200/80 dark:border-blue-500/25 text-xs space-y-3 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">
              Paket Suara Offline (Whisper AI)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bicara dan catat pengeluaran tanpa koneksi internet
            </p>
          </div>
        </div>

        {isModelDownloaded && !isDownloading && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{activeModelTier === "small" ? "Small Aktif" : "Base Aktif"}</span>
          </span>
        )}
      </div>

      {/* Model Tier Selector (Pilihan Fleksibel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
        {(Object.keys(OFFLINE_MODEL_CONFIGS) as OfflineModelTier[]).map((tierKey) => {
          const cfg = OFFLINE_MODEL_CONFIGS[tierKey];
          const isSelected = currentSelectedTier === tierKey;
          const isInstalled = activeModelTier === tierKey;

          return (
            <button
              key={tierKey}
              type="button"
              onClick={() => handleSelectTier(tierKey)}
              disabled={isDownloading}
              className={`p-2.5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "bg-blue-100/60 dark:bg-blue-500/15 border-blue-500 shadow-sm"
                  : "bg-white/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] hover:border-blue-300 dark:hover:border-blue-500/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {cfg.badge}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-semibold">
                    {cfg.sizeLabel}
                  </span>
                  {isInstalled && (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>

              <div className="font-bold text-slate-900 dark:text-white text-xs">
                {cfg.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                {cfg.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* State 1: Sedang Mengunduh */}
      {isDownloading && (
        <div className="space-y-1.5 pt-1 border-t border-blue-100 dark:border-white/[0.06]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-blue-700 dark:text-blue-300">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Mengunduh {selectedConfig.name}...</span>
            </span>
            <span className="font-mono">{downloadProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Tersimpan langsung di memori browser perangkat Anda untuk penggunaan offline.
          </p>
        </div>
      )}

      {/* State 2: Terinstal & Aktif */}
      {isSelectedTierActive && !isDownloading && (
        <div className="flex items-center justify-between pt-1 border-t border-blue-100 dark:border-white/[0.06] text-[11px]">
          <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Model {selectedConfig.name} aktif di perangkat</span>
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
            <span>Hapus</span>
          </button>
        </div>
      )}

      {/* State 3: Model Dipilih Belum Diunduh (atau ganti kapasitas) */}
      {!isSelectedTierActive && !isDownloading && (
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-blue-100 dark:border-white/[0.06]">
          <span className="text-slate-600 dark:text-slate-300 text-[11px]">
            {isOnline
              ? isModelDownloaded
                ? `Beralih ke model ${selectedConfig.name} (${selectedConfig.sizeLabel}).`
                : `Unduh ${selectedConfig.name} (${selectedConfig.sizeLabel}) untuk pemakaian offline.`
              : "Perangkat sedang offline. Sambungkan internet sekali untuk mengunduh."}
          </span>

          {isOnline ? (
            <button
              type="button"
              onClick={() => onDownload(currentSelectedTier)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isModelDownloaded ? "Ganti ke Model Ini" : `Unduh (${selectedConfig.sizeLabel})`}
              </span>
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
