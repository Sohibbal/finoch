"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, X, Sparkles, CheckCircle2 } from "lucide-react";
import { useHybridSpeech } from "@/hooks/use-hybrid-speech";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { rupiah } from "@/lib/format";

interface VoiceWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; targetPrice: number; priority: number }) => Promise<void> | void;
}

export function VoiceWishlistModal({ isOpen, onClose, onSave }: VoiceWishlistModalProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useHybridSpeech();

  const [candidateName, setCandidateName] = useState("");
  const [candidatePrice, setCandidatePrice] = useState<number | null>(null);
  const [candidatePriority, setCandidatePriority] = useState(3);
  const [isSaving, setIsSaving] = useState(false);

  // Automatically parse transcript whenever speech updates
  useEffect(() => {
    const fullText = (transcript + " " + interimTranscript).trim();
    if (!fullText) return;

    const parsed = parseIndonesianExpense(fullText);
    if (parsed.length > 0) {
      const top = parsed[0];
      setCandidateName(top.itemName);
      setCandidatePrice(top.amount);
    } else {
      // Fallback if price parser hasn't caught amount yet: set text as candidate name
      setCandidateName(fullText);
    }
  }, [transcript, interimTranscript]);

  // Clean up state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      if (isListening) stopListening();
      resetTranscript();
      setCandidateName("");
      setCandidatePrice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setCandidateName("");
      setCandidatePrice(null);
      startListening();
    }
  };

  const handleSave = async () => {
    if (!candidateName.trim() || !candidatePrice || candidatePrice <= 0) return;
    setIsSaving(true);
    try {
      await onSave({
        name: candidateName.trim(),
        targetPrice: candidatePrice,
        priority: candidatePriority,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-paper dark:bg-navy-900 rounded-3xl p-6 shadow-xl border border-ink/10 dark:border-navy-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-head font-bold text-ink dark:text-white">Bicara Wishlist</h2>
              <p className="text-meta text-ink-soft dark:text-navy-400">Sebutkan barang dan harga incaranmu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-ink/5 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Trigger Button & Pulse */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <button
            type="button"
            onClick={handleToggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30 ring-8 ring-rose-500/20"
                : "bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:scale-105"
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
          <p className="text-meta font-medium text-ink-soft dark:text-navy-400">
            {isListening ? "Mendengarkan... Ketuk untuk berhenti" : "Ketuk mikrofon untuk mulai bicara"}
          </p>
          {!candidateName && !isListening && (
            <p className="text-meta text-center text-ink-soft/70 dark:text-navy-500 italic max-w-xs">
              Contoh: &ldquo;Mau beli hoodie oversize seratus delapan puluh ribu&rdquo;
            </p>
          )}
        </div>

        {/* Live Transcript / Candidate Card */}
        {candidateName && (
          <div className="p-4 rounded-2xl bg-paper-sheet dark:bg-navy-950 border border-ink/10 dark:border-navy-800 space-y-3">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-meta font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Terdeteksi</span>
            </div>
            <div>
              <label className="block text-meta text-ink-soft dark:text-navy-400 mb-1">Nama Incaran</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-ink/15 dark:border-navy-700 bg-paper dark:bg-navy-900 text-ink dark:text-white font-medium"
              />
            </div>
            <div>
              <label className="block text-meta text-ink-soft dark:text-navy-400 mb-1">Target Harga</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={candidatePrice ?? ""}
                  placeholder="Masukkan nominal harga"
                  onChange={(e) => setCandidatePrice(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-xl border border-ink/15 dark:border-navy-700 bg-paper dark:bg-navy-900 text-ink dark:text-white font-medium money"
                />
                {candidatePrice && (
                  <span className="text-meta font-bold text-emerald-600 dark:text-emerald-400 money">
                    {rupiah(candidatePrice)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink/10 dark:border-navy-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-meta font-medium text-ink-soft hover:text-ink dark:text-navy-400 dark:hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!candidateName || !candidatePrice || candidatePrice <= 0 || isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-paper-sheet dark:bg-white dark:text-navy-950 font-semibold text-meta hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? "Menyimpan..." : "Simpan Wishlist"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
