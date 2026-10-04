"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, CheckCircle, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { useHybridSpeech } from "@/hooks/use-hybrid-speech";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import type { ParsedVoiceItem, ExpenseCategory } from "@/lib/types/expense";
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
  const wasOpenRef = useRef(isOpen);

  // 1. Sync state saat merekam
  useEffect(() => {
    if (isOpen && isListening) {
      setVoiceState("listening");
      setStatusMessage(null);
    }
  }, [isOpen, isListening]);

  // 2. Sync state saat AI lokal Whisper mentranskripsi
  useEffect(() => {
    if (isOpen && isTranscribing) {
      setVoiceState("processing");
      setStatusMessage(null);
    }
  }, [isOpen, isTranscribing]);

  // 3. Tangani hasil transkripsi setelah selesai merekam dan mentranskripsi
  useEffect(() => {
    if (!isOpen || isListening || isTranscribing) return;

    const fullText = transcript.trim();
    if (!fullText) return;

    let isMounted = true;
    setVoiceState("processing");

    async function parseVoice() {
      try {
        const res = await fetch("/api/transactions/parse-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: fullText }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0 && isMounted) {
            setParsedItems(data.items);
            setVoiceState("review");
            setStatusMessage(null);
            return;
          }
        }
      } catch {
        // Fall through to local parser
      }

      // Local offline fallback
      if (isMounted) {
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
    }

    parseVoice();

    return () => {
      isMounted = false;
    };
  }, [isOpen, transcript, isListening, isTranscribing]);

  // 4. Tangani error pengenalan suara
  useEffect(() => {
    if (isOpen && speechError) {
      setVoiceState("error");
      setStatusMessage(speechError);
    }
  }, [isOpen, speechError]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      stopListening();
      resetTranscript();
      setParsedItems([]);
      setVoiceState("idle");
      setStatusMessage(null);
    }
    wasOpenRef.current = isOpen;
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
    const CATEGORIES: ExpenseCategory[] = [
      "Food & Drinks",
      "Transportation",
      "Bills & Utilities",
      "Shopping & Lifestyle",
      "Other",
    ];
    setParsedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const currentIdx = CATEGORIES.indexOf(item.category as ExpenseCategory);
          const nextCategory = CATEGORIES[(currentIdx + 1) % CATEGORIES.length];
          return {
            ...item,
            category: nextCategory,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-cream-50 dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl max-h-[92vh] flex flex-col overflow-hidden text-navy-950 dark:text-cream-50 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-navy-950 dark:text-cream-50">
                Pencatatan Suara
              </h2>
              {engineMode === "online" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream-200/80 dark:bg-navy-800 text-navy-900 dark:text-cream-200 border border-cream-300 dark:border-navy-700">
                  Online: Web Speech
                </span>
              )}
              {engineMode === "offline-whisper" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cream-200/80 dark:bg-navy-800 text-navy-900 dark:text-cream-200 border border-cream-300 dark:border-navy-700">
                  Offline: Whisper AI
                </span>
              )}
              {engineMode === "offline-unready" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Offline: Perlu Model
                </span>
              )}
            </div>
            <p className="text-xs text-navy-600 dark:text-cream-300/80">
              Bicara santai, AI otomatis mendeteksi transaksi dan nominal rupiah.
            </p>
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
            <div className="flex items-center gap-2 p-3 my-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
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
            <div className="mt-3 pt-3 border-t border-cream-200 dark:border-navy-800">
              <span className="block text-center text-[11px] text-navy-500 dark:text-cream-400/80 mb-1 font-medium">
                Atau ketik manual tanpa bicara
              </span>
              <ManualExpenseInput onParsed={handleManualParsed} />
            </div>
          )}
        </div>

        {/* Action Footer */}
        {voiceState === "review" && (
          <div className="pt-3 border-t border-cream-200 dark:border-navy-800 flex gap-2">
            <button
              type="button"
              onClick={handleStart}
              className="py-2.5 px-4 rounded-xl border border-cream-300 dark:border-navy-800 text-xs font-semibold text-navy-800 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-navy-900 flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ulangi
            </button>
            <button
              type="button"
              onClick={handleConfirmAndSave}
              className="flex-1 py-2.5 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
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
