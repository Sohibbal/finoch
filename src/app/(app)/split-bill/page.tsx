"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  HandCoins,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Participant, SplitItem, SplitBillConfig } from "@/types/split-bill-types";
import { calculateSplitBill } from "@/lib/financial/split-bill-engine";
import {
  getTalanganList,
  addTalanganRecord,
  markTalanganAsPaid,
  deleteTalanganRecord,
  getTalanganSummary,
} from "@/lib/storage/talangan-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { useAuth } from "@/hooks/use-auth";

import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-logo";

import { ParticipantManager } from "@/components/split-bill/participant-manager";
import { BillItemEditor } from "@/components/split-bill/bill-item-editor";
import { TaxDiscountConfig } from "@/components/split-bill/tax-discount-config";
import { SplitSummaryCard } from "@/components/split-bill/split-summary-card";
import { TalanganHistoryModal } from "@/components/split-bill/talangan-history-modal";
import { ReceiptOcrButton } from "@/components/split-bill/receipt-ocr-button";

export default function SplitBillPage() {
  const router = useRouter();
  const { user } = useAuth();

  // 1. Initial State
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "p_user", name: "Saya", isUser: true },
    { id: "p_budi", name: "Budi", isUser: false },
    { id: "p_siti", name: "Siti", isUser: false },
  ]);

  const [items, setItems] = useState<SplitItem[]>([
    {
      id: "item_1",
      name: "Ayam Geprek Sambal Bawang",
      price: 18000,
      quantity: 1,
      assignedParticipantIds: ["p_user"],
    },
    {
      id: "item_2",
      name: "Nasi Goreng Spesial",
      price: 22000,
      quantity: 1,
      assignedParticipantIds: ["p_budi"],
    },
    {
      id: "item_3",
      name: "Mie Ayam Bakso",
      price: 19000,
      quantity: 1,
      assignedParticipantIds: ["p_siti"],
    },
    {
      id: "item_4",
      name: "Es Teh Manis Jumbo",
      price: 12000,
      quantity: 1,
      assignedParticipantIds: ["p_user", "p_budi", "p_siti"], // Shared
    },
  ]);

  const [config, setConfig] = useState<SplitBillConfig>({
    restaurantName: "Warteg & Kopi Kampus",
    date: new Date().toISOString().split("T")[0],
    mode: "itemized",
    taxPercentage: 10,
    servicePercentage: 0,
    discountAmount: 0,
    rounding: 100,
    paymentNote: "BCA / GoPay / DANA",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isTalanganModalOpen, setIsTalanganModalOpen] = useState(false);
  const [talanganRecords, setTalanganRecords] = useState(getTalanganList());
  const [talanganSummary, setTalanganSummary] = useState(getTalanganSummary());

  // Refresh talangan storage state
  const refreshTalangan = () => {
    setTalanganRecords(getTalanganList());
    setTalanganSummary(getTalanganSummary());
  };

  useEffect(() => {
    refreshTalangan();
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
          userId: user?.id || "guest",
        });
      }

      // Save each friend's share as a talangan record
      const friends = result.shares.filter((s) => !s.isUser && s.finalAmount > 0);
      friends.forEach((friend) => {
        const summary =
          config.mode === "itemized" && friend.items.length > 0
            ? friend.items.map((i) => i.itemName).join(", ")
            : "Bagi Rata";

        addTalanganRecord({
          restaurantName: config.restaurantName || "Makan Bareng",
          date: config.date || new Date().toISOString().split("T")[0],
          friendName: friend.name,
          amount: friend.finalAmount,
          itemsSummary: summary,
        });
      });

      refreshTalangan();
      setIsSaved(true);
      alert("Berhasil menyimpan! Porsi Anda dicatat ke Pengeluaran dan porsi teman dicatat ke Buku Talangan.");
    } catch (err) {
      console.error("Gagal menyimpan ke Finoch:", err);
      alert("Terjadi kesalahan saat menyimpan transaksi.");
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300 dark:border-navy-800 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Mobile Brand & Page Title */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="md:hidden p-1.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-200 shrink-0"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="md:hidden shrink-0 flex items-center" aria-label="Finoch Beranda">
                <BrandLogo variant="symbol" className="w-5 h-5 shrink-0" />
              </Link>
              <div className="min-w-0">
                <Breadcrumbs className="hidden md:flex mb-1" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-cream-50 flex items-center gap-1.5 truncate">
                  <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Kalkulator Split Bill &amp; Talangan Resto</span>
                </h1>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70 hidden sm:block">
                  Hitung patungan makan, pajak PB1, service charge, dan salin ke WhatsApp
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ReceiptOcrButton onItemsExtracted={handleOcrExtracted} />

              {/* Button to open Talangan Modal */}
              <button
                type="button"
                onClick={() => setIsTalanganModalOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold transition-all active:scale-95"
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Buku Talangan</span>
                {talanganSummary.countUnpaid > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                    {talanganSummary.countUnpaid}
                  </span>
                )}
              </button>

              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-5">
          {/* Hero Banner Alert */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-navy-950 dark:text-cream-50">
                  Bagi Rata atau Bagi per Menu + Pajak Resto (PB1) Adil
                </h3>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70">
                  Pajak & service charge dialokasikan secara proporsional. Selesai hitung, langsung kirim rincian ke WhatsApp grup!
                </p>
              </div>
            </div>
          </div>

          {/* Grid Layout: Config/Items on Left, Result Summary on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Form & Inputs (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <TaxDiscountConfig config={config} onChange={handleConfigChange} />
              <ParticipantManager
                participants={participants}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
              />
              <BillItemEditor
                items={items}
                participants={participants}
                mode={config.mode}
                onAddItem={handleAddItem}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
              />
            </div>

            {/* Right Column: Split Bill Result & Share (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-20">
                <SplitSummaryCard
                  result={result}
                  config={config}
                  onSaveToTransactionsAndTalangan={handleSaveToFinoch}
                  isSaved={isSaved}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Talangan History Modal */}
      <TalanganHistoryModal
        isOpen={isTalanganModalOpen}
        onClose={() => {
          setIsTalanganModalOpen(false);
          refreshTalangan();
        }}
        records={talanganRecords}
        onMarkPaid={(id) => {
          markTalanganAsPaid(id);
          refreshTalangan();
        }}
        onDelete={(id) => {
          deleteTalanganRecord(id);
          refreshTalangan();
        }}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />
    </div>
  );
}
