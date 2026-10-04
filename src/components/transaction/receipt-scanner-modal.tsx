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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-50 dark:bg-[#070E1A] rounded-3xl shadow-2xl border border-cream-300 dark:border-navy-800 max-w-md w-full overflow-hidden text-navy-950 dark:text-cream-50 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cream-200/80 dark:bg-navy-900 text-navy-950 dark:text-cream-50 border border-cream-300 dark:border-navy-800">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                Scan Struk Belanja
              </h3>
              <p className="text-xs text-navy-600 dark:text-cream-400">
                Ekstrak otomatis total nominal &amp; rincian transaksi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-navy-500 hover:text-navy-950 dark:text-cream-400 dark:hover:text-cream-50 hover:bg-cream-200 dark:hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isScanning ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 text-navy-900 dark:text-cream-100 animate-spin" />
              <div className="text-sm font-bold text-navy-950 dark:text-cream-50">
                Membaca &amp; Mengekstrak Data Struk...
              </div>
              <p className="text-xs text-navy-600 dark:text-cream-400">
                Mendeteksi nama merchant, tanggal, dan total belanja
              </p>
            </div>
          ) : useCamera ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] border border-cream-300 dark:border-navy-800">
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
                  className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-sm font-bold text-cream-50 dark:text-navy-950 shadow-sm transition active:scale-95"
                >
                  Ambil Foto Struk
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-sm font-semibold text-navy-800 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-navy-900 transition active:scale-95"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-cream-300 dark:border-navy-800 hover:border-navy-900 dark:hover:border-cream-300 rounded-2xl p-8 flex flex-col items-center justify-center space-y-2 transition-all group bg-white/40 dark:bg-navy-900/30"
              >
                <div className="p-3 bg-cream-200/80 dark:bg-navy-900 rounded-full text-navy-800 dark:text-cream-200 group-hover:bg-cream-300 dark:group-hover:bg-navy-800 transition-colors">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Pilih atau Tarik Berkas Foto Struk
                </div>
                <p className="text-xs text-navy-600 dark:text-cream-400">
                  Format JPG, PNG, WEBP (maks. 10 MB)
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
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-sm font-semibold text-navy-900 dark:text-cream-100 hover:bg-cream-200/60 dark:hover:bg-navy-900 transition-colors"
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
