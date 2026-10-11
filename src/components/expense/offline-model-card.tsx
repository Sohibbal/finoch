"use client";

import React, { useState } from "react";
import { DEFAULT_OFFLINE_TIER, OFFLINE_MODEL_CONFIGS, type OfflineModelTier } from "@/hooks/use-offline-whisper";

interface OfflineVoiceLineProps {
  isModelDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: (tier?: OfflineModelTier) => Promise<void | boolean>;
  onDelete: () => Promise<void>;
  isOnline: boolean;
}

// Only the light pack is offered; a heavier pack installed earlier keeps working.
const PACK = OFFLINE_MODEL_CONFIGS[DEFAULT_OFFLINE_TIER];
const PACK_SIZE = PACK.sizeLabel.replace("~", "");

const LINK = "min-h-11 inline-flex items-center font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink disabled:opacity-50";

/** Offline voice in one quiet line: an offer to download, its progress, or that it's ready. */
export function OfflineVoiceLine({ isModelDownloaded, isDownloading, downloadProgress, onDownload, onDelete, isOnline }: OfflineVoiceLineProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  let line: React.ReactNode;
  if (isDownloading) {
    line = <span className="money">Mengunduh paket suara... {downloadProgress}%</span>;
  } else if (isModelDownloaded) {
    line = (
      <>
        Bisa catat tanpa sinyal ·{" "}
        <button
          type="button"
          disabled={isDeleting}
          onClick={async () => {
            setIsDeleting(true);
            try {
              await onDelete();
            } finally {
              setIsDeleting(false);
            }
          }}
          className={LINK}
        >
          Hapus paket suara
        </button>
      </>
    );
  } else if (isOnline) {
    line = (
      <>
        Mau bisa catat tanpa sinyal?{" "}
        <button type="button" onClick={() => onDownload(DEFAULT_OFFLINE_TIER)} className={LINK}>
          Unduh paket suara ({PACK_SIZE})
        </button>
      </>
    );
  } else {
    line = "Lagi tanpa sinyal: ketik dulu. Paket suara bisa diunduh nanti saat online.";
  }

  return (
    <p aria-live="polite" className="text-meta text-ink-soft min-h-11 flex flex-wrap items-center gap-x-1">
      {line}
    </p>
  );
}
