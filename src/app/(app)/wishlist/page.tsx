"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, Mic, Sparkles, Gift, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { rupiah } from "@/lib/format";
import {
  getWishlistItems,
  saveWishlistItem,
  toggleWishlistAchieved,
  deleteWishlist,
  type LocalWishlist,
} from "@/lib/storage/wishlist-storage";
import { getTransactions } from "@/lib/storage/transaction-storage";
import { calculateWishlistProjection } from "@/lib/financial/wishlist-engine";
import { syncManager } from "@/lib/sync/sync-manager";
import {
  getWishlistSavingsPercentage,
  WISHLIST_SETTINGS_CHANGED_EVENT,
} from "@/lib/storage/wishlist-settings";
import {
  getDailyAllowanceSetting,
  DAILY_ALLOWANCE_CHANGED_EVENT,
} from "@/lib/storage/daily-allowance-settings";
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card";
import { ManualWishlistModal } from "@/components/wishlist/manual-wishlist-modal";
import { VoiceWishlistModal } from "@/components/wishlist/voice-wishlist-modal";

export default function WishlistPage() {
  const [items, setItems] = useState<LocalWishlist[]>([]);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [dailyAllowance, setDailyAllowance] = useState<number>(() => getDailyAllowanceSetting());
  const [savingsPercentage, setSavingsPercentage] = useState<number>(() => getWishlistSavingsPercentage());
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "achieved" | "all">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  // Modals
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [wishlistData, txData] = await Promise.all([
        getWishlistItems(),
        getTransactions(),
      ]);
      setItems(wishlistData);

      // Calculate current net savings (Income - Expenses) and dynamic daily allowance
      let income = 0;
      let expenses = 0;
      let monthIncome = 0;
      let monthExpense = 0;
      let todayExpense = 0;
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const todayStr = `${currentMonthStr}-${String(now.getDate()).padStart(2, "0")}`;

      for (const tx of txData) {
        if (tx.type === "income") {
          income += tx.amount;
          if (tx.transactionDate?.startsWith(currentMonthStr)) monthIncome += tx.amount;
        } else if (tx.type === "expense") {
          expenses += tx.amount;
          if (tx.transactionDate?.startsWith(currentMonthStr)) monthExpense += tx.amount;
          if (tx.transactionDate?.startsWith(todayStr)) todayExpense += tx.amount;
        }
      }
      setCurrentSavings(Math.max(0, income - expenses));

      setDailyAllowance(getDailyAllowanceSetting());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ percentage: number }>;
      if (customEvent.detail?.percentage) {
        setSavingsPercentage(customEvent.detail.percentage);
      } else {
        setSavingsPercentage(getWishlistSavingsPercentage());
      }
    };

    const handleAllowanceChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ allowance: number }>;
      if (customEvent.detail?.allowance) {
        setDailyAllowance(customEvent.detail.allowance);
      } else {
        setDailyAllowance(getDailyAllowanceSetting());
      }
    };

    window.addEventListener(WISHLIST_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
    window.addEventListener(DAILY_ALLOWANCE_CHANGED_EVENT, handleAllowanceChanged);
    return () => {
      window.removeEventListener(WISHLIST_SETTINGS_CHANGED_EVENT, handleSettingsChanged);
      window.removeEventListener(DAILY_ALLOWANCE_CHANGED_EVENT, handleAllowanceChanged);
    };
  }, []);

  const dailySavingsRate = useMemo(() => {
    return Math.max(1000, Math.round(dailyAllowance * (savingsPercentage / 100)));
  }, [dailyAllowance, savingsPercentage]);

  const handleManualSave = async (data: { name: string; targetPrice: number; priority: number }) => {
    const saved = await saveWishlistItem({
      name: data.name,
      targetPrice: data.targetPrice,
      priority: data.priority,
      savedAmount: 0,
      isAchieved: false,
    });
    setItems((prev) => [saved, ...prev]);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:wishlist-changed"));
    }
    syncManager.triggerSync().catch(() => {});
    await loadData();
  };

  const handleToggleAchieved = async (id: string) => {
    const updated = await toggleWishlistAchieved(id);
    if (updated) {
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("finoch:wishlist-changed"));
      }
      syncManager.triggerSync().catch(() => {});
    }
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteWishlist(id);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("finoch:wishlist-changed"));
    }
    syncManager.triggerSync().catch(() => {});
    await loadData();
  };

  const filteredItems = useMemo(() => {
    if (filter === "active") return items.filter((i) => !i.isAchieved);
    if (filter === "achieved") return items.filter((i) => i.isAchieved);
    return items;
  }, [items, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedWishlistItems = useMemo(() => {
    return filteredItems.slice(
      (safeCurrentPage - 1) * ITEMS_PER_PAGE,
      safeCurrentPage * ITEMS_PER_PAGE
    );
  }, [filteredItems, safeCurrentPage]);

  const totalValue = items.reduce((sum, item) => sum + item.targetPrice, 0);
  const activeCount = items.filter((i) => !i.isAchieved).length;
  const achievedCount = items.filter((i) => i.isAchieved).length;

  const handleFilterChange = (f: "active" | "achieved" | "all") => {
    setFilter(f);
    setCurrentPage(1);
  };

  return (
    <>
      <PageHeader
        title="Wishlist"
        subtitle="Kawal barang impian dan pantau estimasi jadwal ketercapaiannya"
      />

      <div className="w-full max-w-[1440px] mx-auto p-3 sm:p-5 lg:p-6">
        <div className="rounded-2xl bg-[#eaf0fd] dark:bg-[#0B101D] border border-blue-200/60 dark:border-slate-800/80 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-6">
          
          {/* Main 2-Column Split: Kiri Button Persegi & Kanan Grid Wishlist */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* SISI KIRI: Summary Metric Card + Button Persegi Berjejer ke Bawah (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4 h-full">
              {/* Summary Metric Card with Glass Sheen */}
              <div className="rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-3 glass-sheen relative overflow-hidden group">
                <Gift
                  className="absolute -right-3 -bottom-3 w-28 h-28 text-blue-500/10 dark:text-blue-400/10 pointer-events-none select-none transition-transform group-hover:scale-105"
                  strokeWidth={1.5}
                />
                <div className="relative z-10 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Nilai Wishlist
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white money">
                    {rupiah(totalValue)}
                  </h2>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Tabungan aktif: <strong className="text-slate-900 dark:text-white">{rupiah(currentSavings)}</strong></span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {activeCount} impian · {achievedCount} tercapai
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Target Alokasi:</span>
                      <Link
                        href="/profile"
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        title="Atur persentase di menu Profil"
                      >
                        <span>{rupiah(dailySavingsRate)}/hari ({savingsPercentage}%)</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2 Action Cards Berjejer ke Bawah */}
              <div className="flex flex-col gap-3">
                {/* 1. Card: Bicara */}
                <button
                  type="button"
                  onClick={() => setIsVoiceOpen(true)}
                  className="w-full text-left rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs glass-sheen relative overflow-hidden group hover:border-blue-400 dark:hover:border-blue-500/70 hover:shadow-md transition-all flex flex-col justify-between min-h-[142px] cursor-pointer"
                >
                  <Mic
                    className="absolute -right-3 -bottom-3 w-24 h-24 text-blue-500/10 dark:text-blue-400/10 pointer-events-none select-none transition-transform group-hover:scale-110 group-hover:rotate-6"
                    strokeWidth={1.5}
                  />
                  <div className="relative z-10 space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Mic className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        Bicara
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Catat target impian via suara
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <span>Mulai Bicara</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </button>

                {/* 2. Card: Catat Manual */}
                <button
                  type="button"
                  onClick={() => setIsManualOpen(true)}
                  className="w-full text-left rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs glass-sheen relative overflow-hidden group hover:border-indigo-400 dark:hover:border-indigo-500/70 hover:shadow-md transition-all flex flex-col justify-between min-h-[142px] cursor-pointer"
                >
                  <Plus
                    className="absolute -right-3 -bottom-3 w-24 h-24 text-indigo-500/10 dark:text-indigo-400/10 pointer-events-none select-none transition-transform group-hover:scale-110 group-hover:rotate-6"
                    strokeWidth={1.5}
                  />
                  <div className="relative z-10 space-y-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Catat Manual
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Tambah target barang impian
                      </p>
                    </div>
                  </div>
                  <div className="relative z-10 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Input Manual</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </div>

            {/* SISI KANAN: Filter Tabs & Grid Wishlist (8 cols) with 100% Height & Glass Sheen */}
            <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between glass-sheen relative overflow-hidden group h-full min-h-[460px]">
              <div className="relative z-10 space-y-4">
                {/* Filter Tabs Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleFilterChange("active")}
                      className={`px-3 py-1.5 rounded-full transition-colors ${
                        filter === "active"
                          ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Aktif ({activeCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFilterChange("achieved")}
                      className={`px-3 py-1.5 rounded-full transition-colors ${
                        filter === "achieved"
                          ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Tercapai ({achievedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFilterChange("all")}
                      className={`px-3 py-1.5 rounded-full transition-colors ${
                        filter === "all"
                          ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      Semua ({items.length})
                    </button>
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {filteredItems.length} item ditemukan
                  </span>
                </div>

                {/* Wishlist Items Grid */}
                {filteredItems.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#111726]/60 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                      <Gift className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Belum ada barang di daftar ini
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Punya barang yang pengen dibeli? Catat sekarang lewat tombol Bicara atau Catat Manual di sisi kiri.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paginatedWishlistItems.map((item) => {
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shrink-0">
                  <span className="text-[11px]">
                    Halaman {safeCurrentPage} dari {totalPages} ({filteredItems.length} item)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#111C2E] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Halaman sebelumnya"
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {safeCurrentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#111C2E] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Halaman berikutnya"
                      aria-label="Halaman berikutnya"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
        onSave={(data) => handleManualSave({ name: data.name, targetPrice: data.targetPrice, priority: 1 })}
      />
    </>
  );
}
