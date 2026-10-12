"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  ImageUp,
  Loader2,
  X,
  Check,
  RotateCcw,
  ScanLine,
  Sparkles,
  Receipt,
  Store,
} from "lucide-react";
import { TransactionCandidate } from "@/types/financial-types";
import { rupiah } from "@/lib/format";
import { localDateKey } from "@/lib/date";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "./manual-transaction-modal";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  type?: "income" | "expense";
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
  const isIncome = type === "income";
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [useCamera, setUseCamera] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Flow step: "select" (choose file/cam) -> "confirm" (human-in-the-loop review)
  const [step, setStep] = useState<"select" | "confirm">("select");

  // Editable confirmation form state
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(localDateKey(new Date()));
  const [scannedItems, setScannedItems] = useState<Array<{ name: string; amount: number }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  useEffect(() => {
    if (useCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [useCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setIsScanning(false);
      setErrorMessage("");
      setStep("select");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setScannedItems([]);
    }
  }, [isOpen]);

  const mapCategoryToUi = (catStr?: string): string => {
    if (!catStr) return categories[0];
    const lower = catStr.toLowerCase();
    if (isIncome) {
      if (lower.includes("gaji")) return "Gaji";
      if (lower.includes("freelance")) return "Freelance";
      if (lower.includes("saku")) return "Uang Saku";
      if (lower.includes("bonus")) return "Hadiah & Bonus";
      if (lower.includes("jual")) return "Penjualan";
      return "Lainnya";
    }
    if (lower.includes("food") || lower.includes("makan") || lower.includes("minum") || lower.includes("warteg")) {
      return "Makanan & Minuman";
    }
    if (lower.includes("transport") || lower.includes("bensin") || lower.includes("parkir") || lower.includes("ojol")) {
      return "Transportasi";
    }
    if (lower.includes("bills") || lower.includes("kost") || lower.includes("listrik") || lower.includes("pulsa") || lower.includes("wifi")) {
      return "Kebutuhan Kost";
    }
    if (lower.includes("shopping") || lower.includes("lifestyle") || lower.includes("belanja") || lower.includes("hiburan")) {
      return "Belanja";
    }
    return "Lainnya";
  };

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
        "Kamera tidak dapat diakses. Silakan izinkan akses kamera pada browser, atau unggah foto dari galeri."
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
    }, "image/jpeg", 0.92);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Ukuran file melebihi 10 MB. Silakan pilih foto dengan resolusi lebih kecil.");
        return;
      }
      processImageFile(file);
    }
  };

  const handleScanReady = (cand: TransactionCandidate) => {
    setIsScanning(false);
    setMerchant(cand.merchant || (isIncome ? "Pemasukan Transfer" : "Struk Belanja"));
    setAmount(cand.amount || 0);
    setCategory(mapCategoryToUi(cand.category));
    setDate(cand.date || localDateKey(new Date()));
    setScannedItems(Array.isArray(cand.items) ? cand.items : []);
    setStep("confirm");
  };

  const processImageFile = async (imageBlob: Blob | File) => {
    setIsScanning(true);
    setErrorMessage("");
    stopCamera();

    // Create preview for scanner laser animation
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const newUrl = URL.createObjectURL(imageBlob);
    setPreviewUrl(newUrl);

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
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Server belum berhasil membaca struk");
        }

        const data = await res.json();
        if (data.candidate) {
          handleScanReady(data.candidate);
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal membaca struk di server";
        setErrorMessage(`${msg}. Mencoba pemindaian di perangkat...`);
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
            handleScanReady(e.data.candidate);
          } else {
            setErrorMessage(
              e.data.error || "Teks pada struk belum terbaca jelas. Coba foto lebih dekat dan terang, atau gunakan Catat Manual."
            );
          }
        };

        worker.onerror = () => {
          setIsScanning(false);
          worker.terminate();
          workerRef.current = null;
          setErrorMessage("Mesin pembaca struk di perangkat gagal berjalan. Silakan coba lagi atau gunakan Catat Manual.");
        };

        worker.postMessage({
          type: "RECOGNIZE_RECEIPT",
          payload: { image: imageBlob },
        });
      } else {
        setIsScanning(false);
        setErrorMessage("Browser belum mendukung pembacaan struk offline. Silakan coba kembali saat online.");
      }
    } catch {
      setIsScanning(false);
      setErrorMessage("Struk gagal dipindai. Silakan coba foto ulang atau gunakan Catat Manual.");
    }
  };

  const handleSaveConfirmed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || !amount || amount <= 0) return;

    setIsSaving(true);
    try {
      const confirmedCandidate: TransactionCandidate = {
        merchant: merchant.trim(),
        amount,
        category,
        date,
        source: "ocr",
        items: scannedItems,
      };

      (onScanSuccess || onConfirm)?.(confirmedCandidate);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleRescan = () => {
    setStep("select");
    setIsScanning(false);
    setErrorMessage("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-[2.25rem] bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-2xl glass-sheen relative overflow-hidden group space-y-5">
        {/* Background Watermark Icon */}
        <ScanLine
          className="absolute -right-3 -bottom-3 w-32 h-32 text-emerald-500/10 dark:text-emerald-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
          strokeWidth={1.5}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ScanLine className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isIncome ? "Scan Bukti Transfer" : "Scan Struk Belanja"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isScanning
                  ? "Memindai dan mengekstrak rincian struk"
                  : step === "confirm"
                  ? "Konfirmasi & sesuaikan hasil scan"
                  : "Pindai struk fisik atau bukti pembayaran"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="relative z-10 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMessage}
          </div>
        )}

        {/* SCANNING STATE WITH ANIMATED LASER BEAM */}
        {isScanning && (
          <div className="relative z-10 space-y-4 py-2 animate-fade-in">
            {/* Viewfinder Preview Box with Scanning Laser */}
            <div className="relative w-full aspect-[4/3] rounded-2xl bg-slate-900 overflow-hidden border border-slate-700 shadow-inner flex items-center justify-center">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Struk Belanja"
                  className="w-full h-full object-cover filter brightness-90"
                />
              )}

              {/* Viewfinder holographic HUD corner brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl pointer-events-none z-20" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr pointer-events-none z-20" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl pointer-events-none z-20" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br pointer-events-none z-20" />

              {/* Glowing horizontal laser scanning line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_16px_4px_rgba(56,189,248,0.85)] z-30 animate-scanner-laser pointer-events-none" />

              {/* Trailing scanning gradient shadow */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-cyan-400/20 to-transparent pointer-events-none z-10 animate-pulse" />

              {/* Status Badge */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-center pointer-events-none z-30">
                <div className="px-4 py-2 rounded-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 text-white text-xs font-semibold flex items-center gap-2 shadow-lg">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>AI sedang membaca nama toko, total & tanggal...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAMERA MODE */}
        {!isScanning && step === "select" && useCamera && (
          <div className="relative z-10 space-y-3.5 animate-fade-in">
            <div className="relative w-full aspect-[4/3] rounded-2xl bg-black overflow-hidden border border-slate-700">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {/* HUD guides */}
              <div className="absolute inset-6 border border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] text-white/70 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                  Posisikan struk di dalam kotak
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Ambil Foto Struk</span>
              </button>
            </div>
          </div>
        )}

        {/* SELECT FILE OR OPEN CAMERA */}
        {!isScanning && step === "select" && !useCamera && (
          <div className="relative z-10 space-y-3.5 animate-fade-in">
            <button
              type="button"
              onClick={startCamera}
              className="w-full p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/20 transition-all group/btn"
            >
              <Camera className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              <span>Buka Kamera & Foto Struk</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 border border-slate-200/80 dark:border-slate-700 transition-all group/btn"
            >
              <ImageUp className="w-5 h-5 group-hover/btn:scale-110 transition-transform text-emerald-500" />
              <span>Pilih Foto dari Galeri</span>
            </button>

            <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
              Format JPG, PNG, atau WEBP hingga 10 MB. Hasil scan dapat diedit sebelum disimpan.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* STEP 2: HUMAN-IN-THE-LOOP CONFIRMATION REVIEW FORM */}
        {!isScanning && step === "confirm" && (
          <form onSubmit={handleSaveConfirmed} className="relative z-10 space-y-4 animate-fade-in">
            {/* Informational banner */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>Data struk terbaca. Periksa & edit field jika diperlukan sebelum disimpan.</span>
            </div>

            {/* Field: Toko / Merchant */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>Nama Toko / Deskripsi</span>
              </label>
              <input
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="Contoh: Mie Gacoan Tebet"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Field: Nominal & Kategori */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Total Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount ?? ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="25000"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-extrabold money focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field: Tanggal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#0B101D] text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Rincian item di struk jika ada */}
            {scannedItems.length > 0 && (
              <details className="rounded-2xl bg-slate-50 dark:bg-[#0B101D] border border-slate-200/80 dark:border-slate-800 p-3 text-xs">
                <summary className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rincian Item di Struk ({scannedItems.length} item)</span>
                </summary>
                <ul className="mt-2.5 space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  {scannedItems.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>{item.name}</span>
                      <span className="font-semibold money">{rupiah(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Nominal preview badge */}
            {amount && amount > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold text-right pt-1">
                Terbaca: {rupiah(amount)}
              </p>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleRescan}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Scan Ulang</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={!merchant.trim() || !amount || amount <= 0 || isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Transaksi"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
