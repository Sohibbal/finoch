"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { useHybridSpeech } from "@/hooks/use-hybrid-speech";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import type { ParsedVoiceItem } from "@/lib/types/expense";
import { VoiceRecorder, type VoiceState } from "./voice-recorder";
import { TranscriptPreview } from "./transcript-preview";
import { ParsedExpenseList } from "./parsed-expense-list";
import { ExpenseEditor } from "./expense-editor";
import { ManualExpenseInput } from "./manual-expense-input";
import { OfflineModelCard } from "./offline-model-card";

interface VoiceExpenseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onExpenseSaved?: () => void;
}

export function VoiceExpenseSheet({
  isOpen,
  onClose,
  userId = "guest",
  onExpenseSaved,
}: VoiceExpenseSheetProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    engineMode,
    isOnline,
    isTranscribing,
    isModelDownloaded,
    activeModelTier,
    selectedModelTier,
    setSelectedModelTier,
    isDownloadingModel,
    modelDownloadProgress,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    downloadOfflineModel,
    deleteOfflineModel,
  } = useHybridSpeech();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [parsedItems, setParsedItems] = useState<ParsedVoiceItem[]>([]);
  const [editingItem, setEditingItem] = useState<ParsedVoiceItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. Sync state saat merekam
  useEffect(() => {
    if (isListening) {
      setVoiceState("listening");
      setStatusMessage(null);
    }
  }, [isListening]);

  // 2. Sync state saat AI lokal Whisper mentranskripsi
  useEffect(() => {
    if (isTranscribing) {
      setVoiceState("processing");
      setStatusMessage(null);
    }
  }, [isTranscribing]);

  // 3. Tangani hasil transkripsi setelah selesai merekam dan mentranskripsi
  useEffect(() => {
    // Jangan proses selama masih merekam suara atau AI masih mentranskripsi
    if (isListening || isTranscribing) return;

    const fullText = transcript.trim();
    if (fullText) {
      setVoiceState("processing");
      const items = parseIndonesianExpense(fullText);
      if (items.length > 0) {
        setParsedItems(items);
        setVoiceState("review");
        setStatusMessage(null);
      } else {
        setVoiceState("error");
        setStatusMessage(
          "Pengeluaran belum dapat dikenali. Silakan coba bicara lebih jelas atau gunakan Catat Manual."
        );
      }
    }
  }, [transcript, isListening, isTranscribing]);

  // 4. Tangani error pengenalan suara
  useEffect(() => {
    if (speechError) {
      setVoiceState("error");
      setStatusMessage(speechError);
    }
  }, [speechError]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      resetTranscript();
      setParsedItems([]);
      setVoiceState("idle");
      setStatusMessage(null);
    }
  }, [isOpen, stopListening, resetTranscript]);

  if (!isOpen) return null;

  const handleStart = async () => {
    resetTranscript();
    setParsedItems([]);
    setStatusMessage(null);
    await startListening();
  };

  const handleStop = () => {
    stopListening();
  };

  const handleManualParsed = (items: ParsedVoiceItem[]) => {
    setParsedItems(items);
    setVoiceState("review");
    setStatusMessage(null);
  };

  const handleToggleCategory = (id: string) => {
    setParsedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            category: item.category === "primer" ? "bocor_halus" : "primer",
          };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    const updated = parsedItems.filter((item) => item.id !== id);
    setParsedItems(updated);
    if (updated.length === 0) {
      setVoiceState("idle");
    }
  };

  const handleSaveEditedItem = (updatedItem: ParsedVoiceItem) => {
    setParsedItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    setEditingItem(null);
  };

  const handleConfirmAndSave = async () => {
    if (parsedItems.length === 0) return;

    setVoiceState("processing");

    try {
      await expenseStorage.saveExpenses(
        parsedItems.map((item) => ({
          itemName: item.itemName,
          amount: item.amount,
          category: item.category,
          userId,
        }))
      );

      // Trigger background sync
      syncManager.triggerSync();

      setVoiceState("saved");

      setTimeout(() => {
        if (onExpenseSaved) onExpenseSaved();
        onClose();
      }, 1200);
    } catch (err) {
      setVoiceState("error");
      setStatusMessage("Gagal menyimpan pengeluaran ke memori perangkat.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-white dark:bg-[#0e1526]/95 border border-slate-200 dark:border-blue-500/25 p-5 shadow-2xl shadow-slate-900/15 dark:shadow-blue-950/80 backdrop-blur-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Catat Pengeluaran Suara
              </h2>
              {engineMode === "online" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300/80 dark:border-blue-500/30">
                  Online: Web Speech
                </span>
              )}
              {engineMode === "offline-whisper" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300/80 dark:border-indigo-500/30">
                  Offline: Whisper AI
                </span>
              )}
              {engineMode === "offline-unready" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30">
                  Offline: Perlu Model
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Web Speech id-ID &amp; Whisper Offline • Pemrosesan NLP &amp; Transaksi Lokal
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2">
          {/* Voice Mic Section */}
          <VoiceRecorder
            state={voiceState}
            onStart={handleStart}
            onStop={handleStop}
            isSupported={isSupported}
            isTranscribing={isTranscribing}
          />

          {/* Real-time speech preview */}
          <TranscriptPreview
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
          />

          {/* Status / Error alert */}
          {statusMessage && (
            <div className="flex items-center gap-2 p-3 my-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Review stage: detected transactions */}
          {voiceState === "review" && (
            <ParsedExpenseList
              items={parsedItems}
              onToggleCategory={handleToggleCategory}
              onEdit={(item) => setEditingItem(item)}
              onDelete={handleDeleteItem}
            />
          )}

          {/* Offline Model Manager Card */}
          {(voiceState === "idle" || voiceState === "error" || !isOnline) && (
            <div className="pt-1">
              <OfflineModelCard
                isModelDownloaded={isModelDownloaded}
                activeModelTier={activeModelTier}
                selectedModelTier={selectedModelTier}
                onSelectTier={setSelectedModelTier}
                isDownloading={isDownloadingModel}
                downloadProgress={modelDownloadProgress}
                onDownload={downloadOfflineModel}
                onDelete={deleteOfflineModel}
                isOnline={isOnline}
              />
            </div>
          )}

          {/* Fallback manual input when idle or error */}
          {(voiceState === "idle" || voiceState === "error") && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.08]">
              <span className="block text-center text-[11px] text-slate-400 mb-1">
                Atau ketik manual tanpa bicara
              </span>
              <ManualExpenseInput onParsed={handleManualParsed} />
            </div>
          )}
        </div>

        {/* Action Footer */}
        {voiceState === "review" && (
          <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex gap-2">
            <button
              type="button"
              onClick={handleStart}
              className="py-3 px-3.5 rounded-2xl border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ulangi
            </button>
            <button
              type="button"
              onClick={handleConfirmAndSave}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition active:scale-95"
            >
              <CheckCircle className="w-4 h-4 stroke-[2.2]" />
              Konfirmasi &amp; Simpan ({parsedItems.length})
            </button>
          </div>
        )}

        {/* Inline item editor modal */}
        {editingItem && (
          <ExpenseEditor
            item={editingItem}
            isOpen={true}
            onSave={handleSaveEditedItem}
            onClose={() => setEditingItem(null)}
          />
        )}
      </div>
    </div>
  );
}
