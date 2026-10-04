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
    <div className="p-3.5 sm:p-4 rounded-2xl bg-cream-100/70 dark:bg-navy-900/60 border border-cream-300 dark:border-navy-800 text-xs space-y-3 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-cream-200/80 dark:bg-navy-800 text-navy-950 dark:text-cream-50 border border-cream-300/80 dark:border-navy-700">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-bold text-navy-950 dark:text-cream-50">
              Paket Suara Offline (Whisper AI)
            </h4>
            <p className="text-[11px] text-navy-700/80 dark:text-cream-300/80 leading-tight">
              Whisper AI memproses suara 100% lokal di browser Anda tanpa kirim rekaman ke server.
            </p>
          </div>
        </div>

        {isModelDownloaded && !isDownloading && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cream-200/80 dark:bg-navy-800 text-navy-900 dark:text-cream-100 border border-cream-300 dark:border-navy-700 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{activeModelTier === "small" ? "Mode Berat Aktif" : "Mode Ringan Aktif"}</span>
          </span>
        )}
      </div>

      {/* Model Tier Selector (Pilihan Human-Friendly) */}
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
                  ? "bg-cream-50 dark:bg-navy-800 border-navy-900 dark:border-cream-100 shadow-sm ring-1 ring-navy-900/10"
                  : "bg-white/70 dark:bg-navy-950/60 border-cream-300 dark:border-navy-800 hover:border-cream-400 dark:hover:border-navy-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-900 dark:text-cream-200">
                  {cfg.badge}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cream-200/60 dark:bg-navy-900 text-navy-800 dark:text-cream-200 font-semibold">
                    {cfg.sizeLabel}
                  </span>
                  {isInstalled && (
                    <span className="w-4 h-4 rounded-full bg-navy-900 dark:bg-cream-100 text-cream-50 dark:text-navy-950 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>

              <div className="font-bold text-navy-950 dark:text-cream-50 text-xs">
                {cfg.name}
              </div>
              <div className="text-[10px] text-navy-600 dark:text-cream-300/80 mt-0.5 line-clamp-2 leading-tight">
                {cfg.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* State 1: Sedang Mengunduh */}
      {isDownloading && (
        <div className="space-y-1.5 pt-1 border-t border-cream-200 dark:border-navy-800">
          <div className="flex items-center justify-between text-[11px] font-semibold text-navy-900 dark:text-cream-100">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-navy-900 dark:text-cream-100" />
              <span>Mengunduh {selectedConfig.name}...</span>
            </span>
            <span className="font-mono">{downloadProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-cream-200 dark:bg-navy-800 overflow-hidden">
            <div
              className="h-full bg-navy-900 dark:bg-cream-100 transition-all duration-300 rounded-full"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-navy-600 dark:text-cream-400">
            Tersimpan langsung di memori browser perangkat Anda untuk penggunaan offline.
          </p>
        </div>
      )}

      {/* State 2: Terinstal & Aktif */}
      {isSelectedTierActive && !isDownloading && (
        <div className="flex items-center justify-between pt-1 border-t border-cream-200 dark:border-navy-800 text-[11px]">
          <span className="text-navy-900 dark:text-cream-100 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
        <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-cream-200 dark:border-navy-800">
          <span className="text-navy-700 dark:text-cream-300 text-[11px]">
            {isOnline
              ? isModelDownloaded
                ? `Beralih ke ${selectedConfig.name} (${selectedConfig.sizeLabel}).`
                : `Unduh ${selectedConfig.name} (${selectedConfig.sizeLabel}) untuk pemakaian offline.`
              : "Perangkat sedang offline. Sambungkan internet sekali untuk mengunduh."}
          </span>

          {isOnline ? (
            <button
              type="button"
              onClick={() => onDownload(currentSelectedTier)}
              className="px-3.5 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isModelDownloaded ? "Ganti ke Model Ini" : `Unduh (${selectedConfig.sizeLabel})`}
              </span>
            </button>
          ) : (
            <span className="text-[11px] text-navy-600 dark:text-cream-400 font-semibold flex items-center gap-1 shrink-0">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Perlu Internet 1x</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
