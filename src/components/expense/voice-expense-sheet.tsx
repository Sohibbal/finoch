"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import type { ParsedVoiceItem } from "@/lib/types/expense";
import { VoiceRecorder, type VoiceState } from "./voice-recorder";
import { TranscriptPreview } from "./transcript-preview";
import { ParsedExpenseList } from "./parsed-expense-list";
import { ExpenseEditor } from "./expense-editor";
import { ManualExpenseInput } from "./manual-expense-input";

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
    errorMessage: speechErrorMsg,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [parsedItems, setParsedItems] = useState<ParsedVoiceItem[]>([]);
  const [editingItem, setEditingItem] = useState<ParsedVoiceItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state with speech recognition lifecycle
  useEffect(() => {
    if (isListening) {
      setVoiceState("listening");
      setStatusMessage(null);
    } else if (voiceState === "listening" && !isListening) {
      // Finished listening -> process transcript
      const fullText = transcript.trim();
      if (fullText) {
        setVoiceState("processing");
        const items = parseIndonesianExpense(fullText);
        if (items.length > 0) {
          setParsedItems(items);
          setVoiceState("review");
        } else {
          setVoiceState("error");
          setStatusMessage("Pengeluaran belum dapat dikenali. Silakan coba lagi atau gunakan ketikan teks.");
        }
      } else {
        setVoiceState("idle");
      }
    }
  }, [isListening, transcript, voiceState]);

  // Handle speech recognition error
  useEffect(() => {
    if (speechError) {
      setVoiceState("error");
      setStatusMessage(speechErrorMsg || "Terjadi kesalahan pada mikrofon.");
    }
  }, [speechError, speechErrorMsg]);

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

  const handleStart = () => {
    resetTranscript();
    setParsedItems([]);
    setStatusMessage(null);
    startListening();
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Catat Pengeluaran Suara
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Privasi aman: Suara diproses di perangkat
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* Voice Mic Section */}
          <VoiceRecorder
            state={voiceState}
            onStart={handleStart}
            onStop={handleStop}
            isSupported={isSupported}
          />

          {/* Real-time speech preview */}
          <TranscriptPreview
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
          />

          {/* Status / Error alert */}
          {statusMessage && (
            <div className="flex items-center gap-2 p-3 my-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs">
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

          {/* Fallback manual input when idle or error */}
          {(voiceState === "idle" || voiceState === "error") && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="block text-center text-[11px] text-slate-400 mb-1">
                Atau ketik manual tanpa bicara
              </span>
              <ManualExpenseInput onParsed={handleManualParsed} />
            </div>
          )}
        </div>

        {/* Action Footer */}
        {voiceState === "review" && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              type="button"
              onClick={handleStart}
              className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ulangi
            </button>
            <button
              type="button"
              onClick={handleConfirmAndSave}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              Konfirmasi & Simpan ({parsedItems.length})
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
