"use client";

import React, { useState, useEffect } from "react";
import { Participant, SplitItem, SplitBillConfig } from "@/types/split-bill-types";
import { calculateSplitBill } from "@/lib/financial/split-bill-engine";
import { addDebt, getDebtSummary } from "@/lib/storage/debt-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";

import { ParticipantManager } from "@/components/split-bill/participant-manager";
import { BillItemEditor } from "@/components/split-bill/bill-item-editor";
import { TaxDiscountConfig } from "@/components/split-bill/tax-discount-config";
import { SplitSummaryCard } from "@/components/split-bill/split-summary-card";
import { ReceiptOcrButton } from "@/components/split-bill/receipt-ocr-button";
import { initialSplitBill } from "@/components/split-bill/initial-bill";
import { PageHeader } from "@/components/layout/page-header";
import { Note } from "@/components/press/note";
import { Serial } from "@/components/press/serial";
import { isDemoMode } from "@/lib/storage/local-storage";
import { shortDate } from "@/lib/format";

export default function SplitBillPage() {
  // 1. Initial State: an empty nota; Mode Demo swaps in the sample bill after mount (storage is client-only).
  const [participants, setParticipants] = useState<Participant[]>(() => initialSplitBill(false).participants);
  const [items, setItems] = useState<SplitItem[]>([]);
  const [config, setConfig] = useState<SplitBillConfig>(() => initialSplitBill(false).config);

  useEffect(() => {
    if (!isDemoMode()) return;
    const demo = initialSplitBill(true);
    setParticipants(demo.participants);
    setItems(demo.items);
    setConfig(demo.config);
  }, []);

  const [isSaved, setIsSaved] = useState(false);
  // Friends' shares are receivables in Buku Kasbon; read after mount (localStorage).
  const [unpaidReceivables, setUnpaidReceivables] = useState(0);
  const refreshKasbon = () => setUnpaidReceivables(getDebtSummary().unpaidReceivablesCount);

  useEffect(() => {
    refreshKasbon();
  }, []);

  // 2. Event Handlers
  const handleAddParticipant = (name: string) => {
    const newParticipant: Participant = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      isUser: false,
    };
    setParticipants([...participants, newParticipant]);
    setIsSaved(false);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
    // Clean up from items
    setItems(
      items.map((item) => ({
        ...item,
        assignedParticipantIds: (item.assignedParticipantIds || []).filter((pid) => pid !== id),
      }))
    );
    setIsSaved(false);
  };

  const handleAddItem = (item: Omit<SplitItem, "id">) => {
    const newItem: SplitItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setItems([...items, newItem]);
    setIsSaved(false);
  };

  const handleUpdateItem = (id: string, updates: Partial<SplitItem>) => {
    setItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    setIsSaved(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    setIsSaved(false);
  };

  const handleConfigChange = (updates: Partial<SplitBillConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    setIsSaved(false);
  };

  const handleOcrExtracted = (newItems: Omit<SplitItem, "id">[], detectedStore?: string) => {
    const createdItems: SplitItem[] = newItems.map((item, idx) => ({
      ...item,
      id: `item_ocr_${Date.now()}_${idx}`,
      assignedParticipantIds: participants.map((p) => p.id), // Share equally by default
    }));
    setItems((prev) => [...prev, ...createdItems]);
    if (detectedStore) {
      setConfig((prev) => ({ ...prev, restaurantName: detectedStore }));
    }
    setIsSaved(false);
  };

  // 3. Calculation Result
  const result = calculateSplitBill(items, participants, config);

  // 4. Save to Finoch Storage
  const handleSaveToFinoch = async () => {
    try {
      const userShare = result.shares.find((s) => s.isUser);
      if (userShare && userShare.finalAmount > 0) {
        await expenseStorage.saveExpense({
          itemName: `Makan di ${config.restaurantName || "Restoran"} (Porsi Saya)`,
          amount: userShare.finalAmount,
          category: "Food & Drinks",
        });
      }

      // Each friend's share becomes a receivable ("teman berhutang ke saya") in Buku Kasbon
      const friends = result.shares.filter((s) => !s.isUser && s.finalAmount > 0);
      friends.forEach((friend) => {
        const summary =
          config.mode === "itemized" && friend.items.length > 0
            ? friend.items.map((i) => i.itemName).join(", ")
            : "Bagi Rata";

        addDebt({
          type: "receivable",
          personName: friend.name,
          amount: friend.finalAmount,
          description: `Patungan ${config.restaurantName || "Makan Bareng"} · ${summary}`,
        });
      });

      refreshKasbon();
      setIsSaved(true);
    } catch (err) {
      console.error("Gagal menyimpan ke Finoch:", err);
      alert("Terjadi kesalahan saat menyimpan transaksi.");
    }
  };

  return (
    <>
      <PageHeader title="Split Bill" subtitle="Bagi tagihan makan bareng, lengkap PB1 & service, lalu kirim ke WhatsApp" />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 items-start">
        <Note
          as="section"
          aria-label="Nota patungan"
          microtext
          serial={<Serial id={`split-${config.date}`} date={config.date} />}
          className="lg:col-span-7"
        >
          <div className="px-5 sm:px-8 pt-6 pb-5 space-y-6">
            <div className="text-center space-y-1 border-b-[3px] border-double border-ink/40 pb-4">
              <label htmlFor="split-restaurant" className="sr-only">
                Nama tempat makan
              </label>
              <input
                id="split-restaurant"
                type="text"
                value={config.restaurantName}
                onChange={(e) => handleConfigChange({ restaurantName: e.target.value })}
                placeholder="Nama tempat makan"
                className="w-full bg-transparent text-center font-display text-head font-bold text-ink placeholder:text-ink-soft border-b border-dashed border-ink/30 focus:outline-none focus-visible:border-ink py-1"
              />
              <p className="text-meta text-ink-soft">Nota patungan · {shortDate(config.date)}</p>
            </div>

            <BillItemEditor
              items={items}
              participants={participants}
              mode={config.mode}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              extraAction={<ReceiptOcrButton onItemsExtracted={handleOcrExtracted} />}
            />

            <div className="border-t border-ink/15 pt-5">
              <ParticipantManager
                participants={participants}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                mode={config.mode}
                onModeChange={(mode) => handleConfigChange({ mode })}
              />
            </div>

            {items.length > 0 && (
              <div className="border-t border-ink/15 pt-5">
                <TaxDiscountConfig config={config} onChange={handleConfigChange} result={result} />
              </div>
            )}
          </div>
        </Note>

        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <SplitSummaryCard
            result={result}
            config={config}
            onSaveToTransactionsAndTalangan={handleSaveToFinoch}
            isSaved={isSaved}
            unpaidReceivables={unpaidReceivables}
          />
          <p role="status" className="sr-only">
            {isSaved ? "Porsi kamu tercatat di Pengeluaran, porsi teman tercatat di Buku Kasbon." : ""}
          </p>
        </div>
      </main>
    </>
  );
}
