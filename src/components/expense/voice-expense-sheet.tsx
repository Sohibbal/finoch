"use client";

import React, { useState, useEffect, useRef } from "react";
import { useHybridSpeech } from "@/hooks/use-hybrid-speech";
import { parseIndonesianExpense } from "@/lib/nlp/indonesian-expense-parser";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import { localDateKey } from "@/lib/date";
import { rupiah } from "@/lib/format";
import type { Expense, ParsedVoiceItem } from "@/lib/types/expense";
import { PaperDialog, PRIMARY_CLASS } from "@/components/press/kampus-press";
import { SaveReceipt } from "@/components/press/receipt-stub";
import { VoiceRecorder, type VoiceState } from "./voice-recorder";
import { TranscriptPreview } from "./transcript-preview";
import { ParsedExpenseList } from "./parsed-expense-list";
import { CATEGORIES, ExpenseEditor } from "./expense-editor";
import { ManualExpenseInput } from "./manual-expense-input";
import { OfflineVoiceLine } from "./offline-model-card";

interface VoiceExpenseSheetProps {
  isOpen: boolean;
  /** Keep it stable (useCallback): the dialog re-focuses itself when it changes. */
  onClose: () => void;
  userId?: string;
  /** Saved or undone: reload so the jatah re-prints before the receipt shows. */
  onExpenseSaved?: () => void | Promise<void>;
  /** Today's jatah left, printed on the save receipt. */
  sisaHariIni?: number;
}

const settle = async (fn?: () => void | Promise<void>) => {
  try {
    await fn?.();
  } catch {
    // A failed reload never undoes a save; the next sync refreshes the page.
  }
};

/** Catat: speak or type, check the printed stubs, save, and get a receipt with Batalkan. */
export function VoiceExpenseSheet({ isOpen, onClose, userId, onExpenseSaved, sisaHariIni }: VoiceExpenseSheetProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isOnline,
    isTranscribing,
    isModelDownloaded,
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<Expense[] | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);
  // Bumped on close: a save that finishes after it must not print a receipt into the next opening.
  const openingRef = useRef(0);
  const wasOpenRef = useRef(isOpen);

  // 1. Sync state saat merekam
  useEffect(() => {
    if (isOpen && isListening) {
      setVoiceState("listening");
      setStatusMessage(null);
    }
  }, [isOpen, isListening]);

  // 2. Sync state saat Whisper lokal mentranskripsi
  useEffect(() => {
    if (isOpen && isTranscribing) {
      setVoiceState("processing");
      setStatusMessage(null);
    }
  }, [isOpen, isTranscribing]);

  // 3. Hasil transkripsi ditambahkan ke daftar, lalu transkripnya dikosongkan
  useEffect(() => {
    if (!isOpen || isListening || isTranscribing) return;

    const fullText = transcript.trim();
    if (!fullText) return;

    let isMounted = true;
    setVoiceState("processing");

    const found = (items: ParsedVoiceItem[]) => {
      setParsedItems((prev) => [...prev, ...items]);
      setVoiceState("review");
      setStatusMessage(null);
      resetTranscript();
    };

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
            found(data.items);
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
          found(items);
        } else {
          setVoiceState("error");
          setStatusMessage(`Belum kebaca nominalnya dari “${fullText}”. Coba bilang lagi pelan-pelan, atau ketik saja.`);
        }
      }
    }

    parseVoice();

    return () => {
      isMounted = false;
    };
  }, [isOpen, transcript, isListening, isTranscribing, resetTranscript]);

  // 4. Tangani error pengenalan suara
  useEffect(() => {
    if (isOpen && speechError) {
      setVoiceState("error");
      setStatusMessage(speechError);
    }
  }, [isOpen, speechError]);

  // Reset when the sheet closes
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      openingRef.current += 1;
      stopListening();
      resetTranscript();
      setParsedItems([]);
      setEditingId(null);
      setVoiceState("idle");
      setStatusMessage(null);
      setSaved(null);
      setUndoError(null);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, stopListening, resetTranscript]);

  const handleStart = async () => {
    resetTranscript();
    setStatusMessage(null);
    await startListening();
  };

  const handleManualParsed = (items: ParsedVoiceItem[]) => {
    setParsedItems((prev) => [...prev, ...items]);
    setVoiceState("review");
    setStatusMessage(null);
  };

  const handleToggleCategory = (id: string) => {
    setParsedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, category: CATEGORIES[(CATEGORIES.indexOf(item.category) + 1) % CATEGORIES.length] } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setParsedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleConfirmAndSave = async () => {
    if (parsedItems.length === 0) return;
    const opening = openingRef.current;
    setVoiceState("processing");
    setStatusMessage(null);

    let result: Expense[];
    try {
      result = await expenseStorage.saveExpenses(
        parsedItems.map((item) => ({
          itemName: item.itemName,
          amount: item.amount,
          category: item.category,
          userId,
          walletId: null,
        }))
      );
    } catch {
      setVoiceState("error");
      setStatusMessage("Belum tersimpan: penyimpanan HP-mu menolak. Coba Simpan lagi; kalau tetap gagal, kosongkan sedikit ruang di HP.");
      return;
    }

    syncManager.triggerSync();
    // The page re-prints the jatah first, so the receipt reads the new number.
    await settle(onExpenseSaved);
    if (opening !== openingRef.current) return;
    setSaved(result);
    setVoiceState("saved");
  };

  const handleUndo = async () => {
    if (!saved) return;
    setUndoing(true);
    setUndoError(null);
    try {
      await expenseStorage.deleteExpenses(saved.map((e) => e.id));
    } catch {
      setUndoError("Gagal membatalkan. Coba ketuk Batalkan lagi.");
      setUndoing(false);
      return;
    }
    syncManager.triggerSync();
    await settle(onExpenseSaved);
    setUndoing(false);
    setSaved(null);
    // The items come back unsaved, so a wrong amount can be fixed and saved again.
    setVoiceState("review");
    setStatusMessage("Dibatalkan, belum ada yang tercatat. Ubah dulu lalu Simpan, atau tutup.");
  };

  const total = parsedItems.reduce((sum, item) => sum + item.amount, 0);
  const editing = parsedItems.find((item) => item.id === editingId);

  return (
    <PaperDialog isOpen={isOpen} onClose={onClose} title="Catat pengeluaran">
      {saved ? (
        <SaveReceipt
          items={saved.map((e) => ({ name: e.itemName, amount: e.amount }))}
          serialId={saved[0]?.id ?? "catat"}
          date={saved[0] ? localDateKey(new Date(saved[0].createdAt)) : localDateKey(new Date())}
          sisaHariIni={sisaHariIni}
          onUndo={handleUndo}
          onDone={onClose}
          undoing={undoing}
          error={undoError}
        />
      ) : (
        <div className="space-y-5">
          <div className="space-y-4">
            <VoiceRecorder
              state={voiceState}
              onStart={handleStart}
              onStop={stopListening}
              isSupported={isSupported}
              isTranscribing={isTranscribing}
            />
            <TranscriptPreview transcript={transcript} interimTranscript={interimTranscript} isListening={isListening} />
            <ManualExpenseInput onParsed={handleManualParsed} />
            {statusMessage && (
              <p role="status" className="text-body text-ink">
                {statusMessage}
              </p>
            )}
            {parsedItems.length === 0 && (
              <OfflineVoiceLine
                isModelDownloaded={isModelDownloaded}
                isDownloading={isDownloadingModel}
                downloadProgress={modelDownloadProgress}
                onDownload={downloadOfflineModel}
                onDelete={deleteOfflineModel}
                isOnline={isOnline}
              />
            )}
          </div>

          {parsedItems.length > 0 && (
            <section aria-labelledby="catat-review" className="space-y-3">
              <div className="flex items-baseline justify-between gap-3 border-b border-ink/20">
                <h3 id="catat-review" className="text-body font-semibold text-ink">
                  Cek dulu, lalu simpan
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setParsedItems([]);
                    setEditingId(null);
                    setStatusMessage(null);
                    setVoiceState("idle");
                  }}
                  className="min-h-11 text-meta font-semibold text-ink-soft underline underline-offset-4 decoration-ink/40 hover:text-ink"
                >
                  Kosongkan
                </button>
              </div>

              {editing ? (
                <ExpenseEditor
                  key={editing.id}
                  item={editing}
                  submitLabel="Pakai"
                  onCancel={() => setEditingId(null)}
                  onSave={(updated) => {
                    setParsedItems((prev) => prev.map((item) => (item.id === editing.id ? { ...item, ...updated } : item)));
                    setEditingId(null);
                  }}
                />
              ) : (
                <ParsedExpenseList
                  items={parsedItems}
                  onToggleCategory={handleToggleCategory}
                  onEdit={(item) => setEditingId(item.id)}
                  onDelete={handleDeleteItem}
                />
              )}

              {/* Pinned to the sheet's bottom edge so the one action is always in thumb reach. */}
              <div className="sticky bottom-0 -mx-5 px-5 py-3 bg-paper-sheet border-t border-ink/15">
                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  disabled={voiceState === "processing" || Boolean(editing)}
                  className={`${PRIMARY_CLASS} w-full`}
                >
                  {voiceState === "processing" ? "Menyimpan..." : `Simpan ${parsedItems.length} item · ${rupiah(total)}`}
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </PaperDialog>
  );
}
