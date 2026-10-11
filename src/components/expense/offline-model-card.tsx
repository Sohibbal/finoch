"use client";

import React, { useState } from "react";
import { Download, Trash2, Loader2, WifiOff, Check } from "lucide-react";
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
    <section aria-labelledby="offline-model-title" className="bg-paper-sheet border border-ink/20 p-4 text-meta text-ink space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 id="offline-model-title" className="text-body font-bold text-ink">
            Paket suara offline
          </h4>
          <p className="text-meta text-ink-soft">
            Suaramu diproses di HP sendiri, rekamannya nggak dikirim ke server.
          </p>
        </div>

        {isModelDownloaded && !isDownloading && (
          <span className="text-meta font-semibold text-ink flex items-center gap-1 shrink-0 whitespace-nowrap">
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            {activeModelTier === "small" ? "Mode berat aktif" : "Mode ringan aktif"}
          </span>
        )}
      </div>

      {/* Model tier choice */}
      <div role="group" aria-label="Pilih paket suara" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(Object.keys(OFFLINE_MODEL_CONFIGS) as OfflineModelTier[]).map((tierKey) => {
          const cfg = OFFLINE_MODEL_CONFIGS[tierKey];
          const isSelected = currentSelectedTier === tierKey;
          const isInstalled = activeModelTier === tierKey;

          return (
            <button
              key={tierKey}
              type="button"
              aria-pressed={isSelected}
              onClick={() => handleSelectTier(tierKey)}
              disabled={isDownloading}
              className={`p-3 border text-left transition-colors disabled:opacity-50 ${
                isSelected ? "border-ink bg-ink/5" : "border-ink/25 hover:bg-ink/5"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-meta font-semibold text-ink-soft">{cfg.badge}</span>
                <span className="flex items-center gap-1 text-meta money text-ink-soft">
                  {cfg.sizeLabel}
                  {isInstalled && <Check className="w-3.5 h-3.5 text-ink" aria-label="terpasang" />}
                </span>
              </span>
              <span className="block text-body font-bold text-ink">{cfg.name}</span>
              <span className="block text-meta text-ink-soft line-clamp-2">{cfg.description}</span>
            </button>
          );
        })}
      </div>

      {/* State 1: downloading */}
      {isDownloading && (
        <div className="space-y-1.5 pt-2 border-t border-ink/15">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              Mengunduh {selectedConfig.name}...
            </span>
            <span className="money">{downloadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-ink/10" aria-hidden="true">
            <div className="h-full bg-ink transition-[width] duration-300" style={{ width: `${downloadProgress}%` }} />
          </div>
          <p className="text-ink-soft">Disimpan di browser HP-mu, jadi bisa dipakai tanpa sinyal.</p>
        </div>
      )}

      {/* State 2: installed and active */}
      {isSelectedTierActive && !isDownloading && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink/15">
          <span className="font-semibold flex items-center gap-1.5 min-w-0">
            <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {selectedConfig.name} siap dipakai offline
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-h-11 -my-2 px-2 -mr-2 flex items-center gap-1 font-semibold text-ink underline underline-offset-2 decoration-ink/40 hover:decoration-ink disabled:opacity-50 shrink-0"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />}
            Hapus
          </button>
        </div>
      )}

      {/* State 3: chosen tier not downloaded yet (or switching) */}
      {!isSelectedTierActive && !isDownloading && (
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-ink/15">
          <span className="text-ink-soft">
            {isOnline
              ? isModelDownloaded
                ? `Ganti ke ${selectedConfig.name} (${selectedConfig.sizeLabel}).`
                : `Unduh ${selectedConfig.name} (${selectedConfig.sizeLabel}) biar bisa catat tanpa sinyal.`
              : "Lagi offline. Sambungkan internet sekali untuk mengunduh."}
          </span>

          {isOnline ? (
            <button
              type="button"
              onClick={() => onDownload(currentSelectedTier)}
              className="min-h-11 px-4 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet text-body font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              {isModelDownloaded ? "Ganti ke paket ini" : `Unduh (${selectedConfig.sizeLabel})`}
            </button>
          ) : (
            <span className="font-semibold flex items-center gap-1 shrink-0">
              <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
              Perlu internet sekali
            </span>
          )}
        </div>
      )}
    </section>
  );
}
