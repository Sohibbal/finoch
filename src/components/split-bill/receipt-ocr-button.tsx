"use client";

import React, { useState, useRef } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { SplitItem } from "@/types/split-bill-types";
import { TransactionCandidate } from "@/types/financial-types";

/**
 * Maps an OCR transaction candidate to split-bill items: one per receipt line item,
 * or a single item for the total when no line items were detected.
 */
export function candidateToSplitItems(candidate: TransactionCandidate): Omit<SplitItem, "id">[] {
  const lineItems = (candidate.items ?? []).filter((item) => item.amount > 0);
  if (lineItems.length > 0) {
    return lineItems.map((item) => ({
      name: item.name,
      price: item.amount,
      quantity: 1,
      assignedParticipantIds: [],
    }));
  }

  const amount = Number(candidate.amount) || 0;
  if (amount <= 0) return [];
  return [
    {
      name: candidate.merchant || "Menu Struk",
      price: amount,
      quantity: 1,
      assignedParticipantIds: [],
    },
  ];
}

interface ReceiptOcrButtonProps {
  onItemsExtracted: (items: Omit<SplitItem, "id">[], detectedStore?: string) => void;
}

export function ReceiptOcrButton({ onItemsExtracted }: ReceiptOcrButtonProps) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/transactions/ocr", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const candidate: TransactionCandidate = data.candidate || data;
        const items = candidateToSplitItems(candidate);

        if (items.length > 0) {
          onItemsExtracted(items, candidate.merchant || "");
        } else {
          alert("OCR berhasil membaca teks, namun tidak menemukan nominal yang valid. Silakan masukkan menu manual.");
        }
      } else {
        alert("Gagal memproses struk via OCR. Silakan masukkan menu manual.");
      }
    } catch (err) {
      console.error("Gagal scan OCR:", err);
      alert("Terjadi kendala saat scan struk.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        disabled={isScanning}
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
      >
        {isScanning ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Memindai Struk...</span>
          </>
        ) : (
          <>
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Struk Kasir</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </>
        )}
      </button>
    </div>
  );
}
