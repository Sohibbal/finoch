"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Mic, Gift, Sparkles, Filter } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { rupiah } from "@/lib/format";
import {
  getWishlistItems,
  saveWishlistItem,
  toggleWishlistAchieved,
  deleteWishlist,
  type LocalWishlist,
} from "@/lib/storage/wishlist-storage";
import { getTransactions, type LocalTransaction } from "@/lib/storage/transaction-storage";
import { calculateWishlistProjection } from "@/lib/financial/wishlist-engine";
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card";
import { ManualWishlistModal } from "@/components/wishlist/manual-wishlist-modal";
import { VoiceWishlistModal } from "@/components/wishlist/voice-wishlist-modal";

type FilterStatus = "all" | "active" | "achieved";

export default function WishlistPage() {
  const [items, setItems] = useState<LocalWishlist[]>([]);
  const [transactions, setTransactions] = useState<LocalTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("active");

  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [wList, txList] = await Promise.all([
        getWishlistItems(),
        getTransactions(),
      ]);
      setItems(wList);
      setTransactions(txList);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute financial health for dynamic projections
  const { currentSavings, dailySavingsRate } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      if (t.type === "expense") expense += t.amount;
    }
    const net = Math.max(0, income - expense);
    // Surplus per day over 30 days
    const dailyRate = Math.max(0, Math.round(net / 30));
    return {
      currentSavings: net,
      dailySavingsRate: dailyRate > 0 ? dailyRate : 25000,
    };
  }, [transactions]);

  const handleManualSave = async (data: { name: string; targetPrice: number; priority: number }) => {
    await saveWishlistItem({
      name: data.name,
      targetPrice: data.targetPrice,
      savedAmount: 0,
      priority: data.priority,
      isAchieved: false,
    });
    await loadData();
  };

  const handleToggleAchieved = async (id: string) => {
    await toggleWishlistAchieved(id);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus barang ini dari wishlist?")) {
      await deleteWishlist(id);
      await loadData();
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === "active") return !item.isAchieved;
      if (filter === "achieved") return item.isAchieved;
      return true;
    });
  }, [items, filter]);

  const totalValue = items.reduce((sum, item) => sum + item.targetPrice, 0);
  const activeCount = items.filter((i) => !i.isAchieved).length;
  const achievedCount = items.filter((i) => i.isAchieved).length;

  return (
    <>
      <PageHeader
        title="Wishlist"
        subtitle="Kawal barang impian dan pantau estimasi jadwal ketercapaiannya"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {/* Metric Summary Card */}
        <div className="p-5 sm:p-6 rounded-3xl backdrop-blur-xl bg-white/80 dark:bg-[#111C2E]/80 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.08] dark:before:via-white/[0.03] before:to-transparent before:pointer-events-none after:absolute after:top-0 after:left-7 after:w-10 after:h-1 after:rounded-b-md after:bg-blue-500/80 after:shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-meta font-medium text-ink-soft dark:text-navy-400">Total Nilai Wishlist</p>
              <h2 className="text-display font-bold text-ink dark:text-white money">
                {rupiah(totalValue)}
              </h2>
              <p className="text-meta text-ink-soft dark:text-navy-400 mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-500" />
                <span>Tabungan bersih saat ini: <strong className="text-ink dark:text-white">{rupiah(currentSavings)}</strong></span>
              </p>
            </div>

            {/* Input Options (Voice & Manual) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-meta transition-colors"
              >
                <Mic className="w-4 h-4" strokeWidth={2} />
                <span>Bicara</span>
              </button>

              <button
                type="button"
                onClick={() => setIsManualOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-ink text-paper-sheet dark:bg-white dark:text-navy-950 font-semibold text-meta hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Catat Manual</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-paper-sheet dark:bg-navy-900 p-1 rounded-xl border border-ink/10 dark:border-navy-800">
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-meta font-semibold transition-colors ${
                filter === "active"
                  ? "bg-ink text-white dark:bg-white dark:text-navy-950 shadow-sm"
                  : "text-ink-soft dark:text-navy-400 hover:text-ink dark:hover:text-white"
              }`}
            >
              Aktif ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("achieved")}
              className={`px-3 py-1.5 rounded-lg text-meta font-semibold transition-colors ${
                filter === "achieved"
                  ? "bg-ink text-white dark:bg-white dark:text-navy-950 shadow-sm"
                  : "text-ink-soft dark:text-navy-400 hover:text-ink dark:hover:text-white"
              }`}
            >
              Tercapai ({achievedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-meta font-semibold transition-colors ${
                filter === "all"
                  ? "bg-ink text-white dark:bg-white dark:text-navy-950 shadow-sm"
                  : "text-ink-soft dark:text-navy-400 hover:text-ink dark:hover:text-white"
              }`}
            >
              Semua ({items.length})
            </button>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-ink/20 dark:border-navy-800 bg-paper-sheet/50 dark:bg-navy-900/30 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-ink/5 dark:bg-navy-800 mx-auto flex items-center justify-center text-ink-soft">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="text-body font-bold text-ink dark:text-white">Belum ada barang di daftar ini</h3>
            <p className="text-meta text-ink-soft dark:text-navy-400 max-w-sm mx-auto">
              Punya barang yang pengen dibeli? Catat sekarang lewat tombol Bicara atau Catat Manual di atas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const projection = calculateWishlistProjection(
                item.targetPrice,
                currentSavings,
                dailySavingsRate
              );

              return (
                <WishlistItemCard
                  key={item.id}
                  item={item}
                  estimatedDays={projection.estimatedDays}
                  projectionStatus={projection.status}
                  onToggleAchieved={handleToggleAchieved}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <ManualWishlistModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSave={handleManualSave}
      />

      <VoiceWishlistModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSave={handleManualSave}
      />
    </>
  );
}
