"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export type OfflineModelTier = "base" | "small";

export interface OfflineModelConfig {
  id: OfflineModelTier;
  name: string;
  modelId: string;
  sizeLabel: string;
  ramLabel: string;
  accuracyLabel: string;
  badge: string;
  description: string;
}

export const OFFLINE_MODEL_CONFIGS: Record<OfflineModelTier, OfflineModelConfig> = {
  base: {
    id: "base",
    name: "Standar (Whisper-Base)",
    modelId: "Xenova/whisper-base",
    sizeLabel: "~77 MB",
    ramLabel: "~250 MB",
    accuracyLabel: "Optimal & Seimbang",
    badge: "Rekomendasi",
    description: "Cepat dan hemat memori. Sangat akurat untuk kalimat belanja dan nominal rupiah harian.",
  },
  small: {
    id: "small",
    name: "Akurasi Tinggi (Whisper-Small)",
    modelId: "Xenova/whisper-small",
    sizeLabel: "~242 MB",
    ramLabel: "~750 MB",
    accuracyLabel: "Maksimal (Mendekati Cloud)",
    badge: "Akurasi Tinggi",
    description: "Model lebih besar dengan pemahaman logat dan ucapan cepat bahasa Indonesia terbaik.",
  },
};

export const DEFAULT_OFFLINE_TIER: OfflineModelTier = "base";
export const WHISPER_STORAGE_KEY = "voicash_offline_whisper_ready";
export const WHISPER_TIER_STORAGE_KEY = "voicash_offline_whisper_tier";

export interface UseOfflineWhisperReturn {
  isModelDownloaded: boolean;
  activeModelTier: OfflineModelTier | null;
  selectedModelTier: OfflineModelTier;
  setSelectedModelTier: (tier: OfflineModelTier) => void;
  isDownloading: boolean;
  downloadProgress: number;
  isTranscribing: boolean;
  error: string | null;
  downloadModel: (tier?: OfflineModelTier) => Promise<boolean>;
  deleteModel: () => Promise<void>;
  transcribe: (audio: Float32Array) => Promise<string>;
}

export function useOfflineWhisper(): UseOfflineWhisperReturn {
  const [activeModelTier, setActiveModelTier] = useState<OfflineModelTier | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const isReady = localStorage.getItem(WHISPER_STORAGE_KEY) === "true";
        if (!isReady) return null;
        const tier = localStorage.getItem(WHISPER_TIER_STORAGE_KEY) as OfflineModelTier;
        return tier === "small" ? "small" : "base";
      } catch {
        return null;
      }
    }
    return null;
  });

  const [selectedModelTier, setSelectedModelTier] = useState<OfflineModelTier>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(WHISPER_TIER_STORAGE_KEY) as OfflineModelTier;
        if (saved === "small" || saved === "base") return saved;
      } catch {}
    }
    return DEFAULT_OFFLINE_TIER;
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pendingTranscribeResolve = useRef<((text: string) => void) | null>(null);
  const pendingTranscribeReject = useRef<((err: Error) => void) | null>(null);
  const pendingLoadResolve = useRef<((success: boolean) => void) | null>(null);
  const activeLoadingTierRef = useRef<OfflineModelTier>(selectedModelTier);

  const isModelDownloaded = activeModelTier !== null;

  const getOrCreateWorker = useCallback(() => {
    if (typeof window === "undefined") return null;

    if (!workerRef.current) {
      try {
        const worker = new Worker(
          new URL("../workers/whisper.worker.ts", import.meta.url),
          { type: "module" }
        );

        worker.onmessage = (event: MessageEvent) => {
          const { status, data, output, error: workerErr } = event.data || {};

          if (status === "progress") {
            if (data?.progress) {
              const pct = Math.round(data.progress);
              setDownloadProgress(Math.min(100, Math.max(0, pct)));
            }
          } else if (status === "ready") {
            setIsDownloading(false);
            setDownloadProgress(100);
            const downloadedTier = data?.tier || activeLoadingTierRef.current;
            setActiveModelTier(downloadedTier);
            try {
              localStorage.setItem(WHISPER_STORAGE_KEY, "true");
              localStorage.setItem(WHISPER_TIER_STORAGE_KEY, downloadedTier);
            } catch {}
            if (pendingLoadResolve.current) {
              pendingLoadResolve.current(true);
              pendingLoadResolve.current = null;
            }
          } else if (status === "transcribing") {
            setIsTranscribing(true);
          } else if (status === "complete") {
            setIsTranscribing(false);
            if (pendingTranscribeResolve.current) {
              pendingTranscribeResolve.current(output || "");
              pendingTranscribeResolve.current = null;
            }
          } else if (status === "error") {
            setIsDownloading(false);
            setIsTranscribing(false);
            setError(workerErr || "Gagal memproses suara offline.");
            if (pendingLoadResolve.current) {
              pendingLoadResolve.current(false);
              pendingLoadResolve.current = null;
            }
            if (pendingTranscribeReject.current) {
              pendingTranscribeReject.current(new Error(workerErr));
              pendingTranscribeReject.current = null;
            }
          } else if (status === "deleted") {
            setActiveModelTier(null);
            setDownloadProgress(0);
            try {
              localStorage.removeItem(WHISPER_STORAGE_KEY);
              localStorage.removeItem(WHISPER_TIER_STORAGE_KEY);
            } catch {}
          }
        };

        workerRef.current = worker;
      } catch (err: any) {
        setError(err?.message || "Browser tidak dapat membuat Web Worker.");
      }
    }

    return workerRef.current;
  }, []);

  // Warmup model saat komponen dimuat jika model sudah tersimpan
  useEffect(() => {
    if (activeModelTier) {
      const worker = getOrCreateWorker();
      if (worker) {
        const modelId = OFFLINE_MODEL_CONFIGS[activeModelTier].modelId;
        worker.postMessage({ type: "warmup", model: modelId, tier: activeModelTier });
      }
    }
  }, [activeModelTier, getOrCreateWorker]);

  // Cleanup worker saat unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const downloadModel = useCallback(
    async (tier?: OfflineModelTier): Promise<boolean> => {
      const targetTier = tier || selectedModelTier;
      activeLoadingTierRef.current = targetTier;
      const config = OFFLINE_MODEL_CONFIGS[targetTier];

      setError(null);
      setIsDownloading(true);
      setDownloadProgress(5);

      // Pastikan file WebAssembly runtime lokal ikut tersimpan di cache PWA
      try {
        if (typeof window !== "undefined" && typeof caches !== "undefined") {
          const cache = await caches.open("voicash-shell-v2");
          await cache.addAll(["/wasm/ort-wasm-simd.wasm", "/wasm/ort-wasm.wasm"]);
        }
      } catch (e) {
        console.warn("PWA WASM precache note:", e);
      }

      const worker = getOrCreateWorker();
      if (!worker) {
        setIsDownloading(false);
        setError("Web Worker tidak didukung pada peramban ini.");
        return false;
      }

      return new Promise<boolean>((resolve) => {
        pendingLoadResolve.current = resolve;
        worker.postMessage({
          type: "load",
          model: config.modelId,
          tier: targetTier,
        });
      });
    },
    [getOrCreateWorker, selectedModelTier]
  );

  const deleteModel = useCallback(async (): Promise<void> => {
    const worker = getOrCreateWorker();
    if (worker) {
      worker.postMessage({ type: "delete" });
    }
    setActiveModelTier(null);
    setDownloadProgress(0);
    try {
      localStorage.removeItem(WHISPER_STORAGE_KEY);
      localStorage.removeItem(WHISPER_TIER_STORAGE_KEY);
    } catch {}
  }, [getOrCreateWorker]);

  const transcribe = useCallback(
    async (audio: Float32Array): Promise<string> => {
      setError(null);
      const worker = getOrCreateWorker();

      if (!worker) {
        throw new Error("Web Worker suara offline tidak tersedia.");
      }

      const activeTier = activeModelTier || selectedModelTier;
      const modelId = OFFLINE_MODEL_CONFIGS[activeTier].modelId;

      setIsTranscribing(true);
      return new Promise<string>((resolve, reject) => {
        pendingTranscribeResolve.current = resolve;
        pendingTranscribeReject.current = reject;
        worker.postMessage({
          type: "transcribe",
          audio,
          model: modelId,
          tier: activeTier,
        });
      });
    },
    [getOrCreateWorker, activeModelTier, selectedModelTier]
  );

  return {
    isModelDownloaded,
    activeModelTier,
    selectedModelTier,
    setSelectedModelTier,
    isDownloading,
    downloadProgress,
    isTranscribing,
    error,
    downloadModel,
    deleteModel,
    transcribe,
  };
}
