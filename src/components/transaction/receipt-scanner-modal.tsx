"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, ImageUp, Loader2 } from "lucide-react";
import { TransactionCandidate } from "@/types/financial-types";
import { PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  type?: "income" | "expense";
  /** Keep it stable (useCallback): the dialog re-focuses itself when it changes. */
  onClose: () => void;
  onScanSuccess?: (candidate: TransactionCandidate) => void;
  onConfirm?: (candidate: TransactionCandidate) => void;
}

export function ReceiptScannerModal({
  isOpen,
  type = "expense",
  onClose,
  onScanSuccess,
  onConfirm,
}: ReceiptScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Stop camera stream on unmount or close
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  // The <video> only mounts once useCamera is true, so attach the stream afterwards
  useEffect(() => {
    if (useCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [useCamera]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

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
      setUseCamera(true);
    } catch {
      setErrorMessage(
        "Kamera nggak bisa dibuka. Izinkan akses kamera di browser, atau pilih foto dari galeri."
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
        setErrorMessage("Fotonya lebih dari 10 MB. Pilih foto yang lebih kecil.");
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
          throw new Error(errData.error || "Server belum bisa membaca struk ini");
        }

        const data = await res.json();
        if (data.candidate) {
          (onScanSuccess || onConfirm)?.(data.candidate);
          onClose();
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Server belum bisa membaca struk ini";
        setErrorMessage(`${msg}. Mencoba baca di HP...`);
      }
    }

    // Offline or fallback processing using Web Worker
    try {
      if (typeof Worker !== "undefined") {
        const worker = new Worker(
          new URL("../../workers/ocr.worker.ts", import.meta.url),
          { type: "module" }
        );
        workerRef.current = worker;

        worker.onmessage = (e) => {
          setIsScanning(false);
          worker.terminate();
          workerRef.current = null;
          if (e.data.success && e.data.candidate) {
            (onScanSuccess || onConfirm)?.(e.data.candidate);
            onClose();
          } else {
            setErrorMessage(
              e.data.error || "Tulisan di struknya belum kebaca. Foto ulang lebih dekat dan terang, atau pakai Catat manual."
            );
          }
        };

        worker.onerror = () => {
          setIsScanning(false);
          worker.terminate();
          workerRef.current = null;
          setErrorMessage("Pembaca struk di HP gagal jalan. Coba lagi saat online, atau pakai Catat manual.");
        };

        worker.postMessage({
          type: "RECOGNIZE_RECEIPT",
          payload: { image: imageBlob },
        });
      } else {
        setIsScanning(false);
        setErrorMessage("Browser ini belum bisa baca struk tanpa internet. Coba lagi saat online, atau pakai Catat manual.");
      }
    } catch {
      setIsScanning(false);
      setErrorMessage("Struknya gagal dibaca. Coba foto ulang, atau pakai Catat manual.");
    }
  };

  const isIncome = type === "income";

  return (
    <PaperDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isIncome ? "Scan bukti transfer" : "Scan struk"}
    >
      <div className="space-y-4">
        {errorMessage && (
          <p role="alert" className="text-body text-habis-ink">
            {errorMessage}
          </p>
        )}

        {isScanning ? (
          <div aria-busy="true" className="py-10 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-8 h-8 text-ink motion-safe:animate-spin" aria-hidden="true" />
            <p className="text-body font-semibold text-ink">
              {isIncome ? "Membaca bukti transfer..." : "Membaca struk..."}
            </p>
            <p className="text-meta text-ink-soft">
              {isIncome
                ? "Nominal transfer dan tanggal. Kamu cek dulu sebelum disimpan."
                : "Nama toko, tanggal dan totalnya. Kamu cek dulu sebelum disimpan."}
            </p>
          </div>
        ) : useCamera ? (
          <div className="space-y-3">
            <div className="relative overflow-hidden bg-ink aspect-[4/3] border border-ink/20">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={stopCamera} className={SECONDARY_CLASS}>
                Batal
              </button>
              <button type="button" onClick={capturePhoto} className={`${PRIMARY_CLASS} flex-1`}>
                <Camera className="w-4 h-4" aria-hidden="true" />
                {isIncome ? "Foto bukti transfer" : "Foto struknya"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={startCamera}
              className={`${PRIMARY_CLASS} w-full`}
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              Buka kamera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`${SECONDARY_CLASS} w-full`}
            >
              <ImageUp className="w-4 h-4" aria-hidden="true" />
              Pilih foto dari galeri
            </button>
            <p className="text-meta text-ink-soft">JPG, PNG atau WEBP, maksimal 10 MB.</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        )}
      </div>
    </PaperDialog>
  );
}
