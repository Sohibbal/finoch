"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  UploadCloud,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { TransactionCandidate } from "@/types/financial-types";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (candidate: TransactionCandidate) => void;
}

export function ReceiptScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: ReceiptScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream on unmount or close
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      stopCamera();
      setIsScanning(false);
      setErrorMessage("");
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setUseCamera(true);
    } catch {
      setErrorMessage(
        "Kamera tidak dapat diakses. Silakan izinkan akses kamera atau gunakan unggah foto."
      );
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        processImageFile(blob);
      }
    }, "image/jpeg", 0.9);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Ukuran gambar melebihi batas 10 MB.");
        return;
      }
      processImageFile(file);
    }
  };

  const processImageFile = async (imageBlob: Blob | File) => {
    setIsScanning(true);
    setErrorMessage("");
    stopCamera();

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    if (isOnline) {
      try {
        const formData = new FormData();
        formData.append("image", imageBlob, "receipt.jpg");

        const res = await fetch("/api/transactions/ocr", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal memproses struk di server");
        }

        const data = await res.json();
        if (data.candidate) {
          onScanSuccess(data.candidate);
          onClose();
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal memproses OCR online";
        setErrorMessage(`${msg}. Mencoba pemindaian offline...`);
      }
    }

    // Offline or fallback processing using Web Worker
    try {
      if (typeof Worker !== "undefined") {
        const worker = new Worker(
          new URL("../../workers/ocr.worker.ts", import.meta.url),
          { type: "module" }
        );

        worker.onmessage = (e) => {
          setIsScanning(false);
          worker.terminate();
          if (e.data.success && e.data.candidate) {
            onScanSuccess(e.data.candidate);
            onClose();
          } else {
            setErrorMessage(
              e.data.error || "Gagal mengenali teks struk secara offline."
            );
          }
        };

        worker.onerror = () => {
          setIsScanning(false);
          worker.terminate();
          setErrorMessage("Gagal menjalankan worker OCR offline.");
        };

        worker.postMessage({
          type: "RECOGNIZE_RECEIPT",
          payload: { image: imageBlob },
        });
      } else {
        setIsScanning(false);
        setErrorMessage("Browser tidak mendukung Web Worker untuk OCR offline.");
      }
    } catch {
      setIsScanning(false);
      setErrorMessage("Terjadi kegagalan saat menjalankan pemrosesan OCR.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Scan Struk Belanja
              </h3>
              <p className="text-xs text-slate-500">
                Hybrid OCR: Otomatis deteksi total & item
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isScanning ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Membaca & Mengekstrak Data Struk...
              </div>
              <p className="text-xs text-slate-500">
                Mendeteksi nama toko, total belanja, dan kategori
              </p>
            </div>
          ) : useCamera ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] border border-slate-700">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20"
                >
                  Ambil Foto Struk
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center space-y-2 transition-all group"
              >
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 group-hover:text-emerald-600 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 transition-colors">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Pilih atau Tarik Berkas Foto Struk
                </div>
                <p className="text-xs text-slate-500">
                  Mendukung JPG, PNG, WEBP hingga 10 MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Buka Kamera
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
