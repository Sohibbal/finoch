"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export const WHISPER_STORAGE_KEY = "voicash_offline_whisper_ready";
export const WHISPER_MODEL_ID = "Xenova/whisper-tiny";

export interface UseOfflineWhisperReturn {
  isModelDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  isTranscribing: boolean;
  error: string | null;
  downloadModel: () => Promise<boolean>;
  deleteModel: () => Promise<void>;
  transcribe: (audio: Float32Array) => Promise<string>;
}

export function useOfflineWhisper(): UseOfflineWhisperReturn {
  const [isModelDownloaded, setIsModelDownloaded] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem(WHISPER_STORAGE_KEY) === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pendingTranscribeResolve = useRef<((text: string) => void) | null>(null);
  const pendingTranscribeReject = useRef<((err: Error) => void) | null>(null);
  const pendingLoadResolve = useRef<((success: boolean) => void) | null>(null);

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
            setIsModelDownloaded(true);
            try {
              localStorage.setItem(WHISPER_STORAGE_KEY, "true");
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
            setIsModelDownloaded(false);
            setDownloadProgress(0);
            try {
              localStorage.removeItem(WHISPER_STORAGE_KEY);
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

  // Cleanup worker saat unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const downloadModel = useCallback(async (): Promise<boolean> => {
    setError(null);
    setIsDownloading(true);
    setDownloadProgress(5);

    const worker = getOrCreateWorker();
    if (!worker) {
      setIsDownloading(false);
      setError("Web Worker tidak didukung pada peramban ini.");
      return false;
    }

    return new Promise<boolean>((resolve) => {
      pendingLoadResolve.current = resolve;
      worker.postMessage({ type: "load" });
    });
  }, [getOrCreateWorker]);

  const deleteModel = useCallback(async (): Promise<void> => {
    const worker = getOrCreateWorker();
    if (worker) {
      worker.postMessage({ type: "delete" });
    }
    setIsModelDownloaded(false);
    setDownloadProgress(0);
    try {
      localStorage.removeItem(WHISPER_STORAGE_KEY);
    } catch {}
  }, [getOrCreateWorker]);

  const transcribe = useCallback(
    async (audio: Float32Array): Promise<string> => {
      setError(null);
      const worker = getOrCreateWorker();

      if (!worker) {
        throw new Error("Web Worker suara offline tidak tersedia.");
      }

      setIsTranscribing(true);
      return new Promise<string>((resolve, reject) => {
        pendingTranscribeResolve.current = resolve;
        pendingTranscribeReject.current = reject;
        worker.postMessage({ type: "transcribe", audio });
      });
    },
    [getOrCreateWorker]
  );

  return {
    isModelDownloaded,
    isDownloading,
    downloadProgress,
    isTranscribing,
    error,
    downloadModel,
    deleteModel,
    transcribe,
  };
}
