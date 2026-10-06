"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Plus,
  ArrowLeft,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { WishlistItem, WishlistStatus } from "@/types/wishlist-types";
import {
  getWishlist,
  addWishlistItem,
  cancelAndSaveMoney,
  purchaseWishlistItem,
  deleteWishlistItem,
  getWishlistSummary,
} from "@/lib/storage/wishlist-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { useAuth } from "@/hooks/use-auth";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

import { WishlistCardMobile } from "@/components/wishlist/wishlist-card-mobile";
import { WishlistCardDesktop } from "@/components/wishlist/wishlist-card-desktop";
import { WishlistTrophyCard } from "@/components/wishlist/wishlist-trophy-card";
import { WishlistFormModal } from "@/components/wishlist/wishlist-form-modal";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("active");

  const refreshWishlist = () => {
    setItems(getWishlist());
  };

  useEffect(() => {
    refreshWishlist();
  }, []);

  const summary = useMemo(() => getWishlistSummary(), [items]);

  // Handlers
  const handleAddItem = (data: {
    name: string;
    price: number;
    category: string;
    priority: "low" | "medium" | "high";
    coolingDays: number;
    note?: string;
    linkUrl?: string;
  }) => {
    addWishlistItem(data);
    refreshWishlist();
  };

  const handleCancelAndSave = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    cancelAndSaveMoney(id);
    refreshWishlist();
    alert(`Hebat! Kamu berhasil menahan nafsu belanja impulsif dan menyelamatkan ${formatRupiah(target.price)} ke tabungan! 🎉`);
  };

  const handlePurchase = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;

    if (target.status === "cooling") {
      const confirmEarly = confirm(
        `Barang ini masih dalam masa tunda pikir ulang (${target.coolingDays} hari). Yakin ingin membeli sekarang?`
      );
      if (!confirmEarly) return;
    }

    purchaseWishlistItem(id);
    refreshWishlist();

    try {
      await expenseStorage.saveExpense({
        itemName: `Beli Wishlist: ${target.name}`,
        amount: target.price,
        category: "Shopping",
        userId: user?.id || "guest",
      });
      alert(`Selamat! "${target.name}" (${formatRupiah(target.price)}) berhasil dibeli dan otomatis dicatat ke Pengeluaran Finoch! 🛍️`);
    } catch (err) {
      console.error("Gagal auto-record wishlist purchase:", err);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus barang ini dari wishlist?")) {
      deleteWishlistItem(id);
      refreshWishlist();
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedStatus === "active") return item.status === "cooling" || item.status === "ready";
    if (selectedStatus === "cooling") return item.status === "cooling";
    if (selectedStatus === "ready") return item.status === "ready";
    if (selectedStatus === "saved_money") return item.status === "saved_money";
    if (selectedStatus === "purchased") return item.status === "purchased";
    return true; // all
  });

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300 dark:border-navy-800 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="md:hidden p-1.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-200"
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <Breadcrumbs className="hidden md:flex mb-1" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-cream-50 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Wishlist Anti-Impulsif (Aturan Tunda 7 Hari)</span>
                </h1>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70">
                  Kunci godaan belanja online selama masa pikir ulang sebelum checkout
                </p>
              </div>
            </div>

            {/* Right Action */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tambah Incaran</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-5">
          {/* Trophy Banner */}
          <WishlistTrophyCard summary={summary} />

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedStatus("active")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                selectedStatus === "active"
                  ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                  : "bg-cream-50 dark:bg-navy-950 text-navy-600 dark:text-cream-300 border-cream-300 dark:border-navy-800"
              }`}
            >
              Sedang Ditunda ({summary.coolingCount + summary.readyCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("ready")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                selectedStatus === "ready"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-cream-50 dark:bg-navy-950 text-navy-600 dark:text-cream-300 border-cream-300 dark:border-navy-800"
              }`}
            >
              Siap Beli ({summary.readyCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("saved_money")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                selectedStatus === "saved_money"
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-cream-50 dark:bg-navy-950 text-navy-600 dark:text-cream-300 border-cream-300 dark:border-navy-800"
              }`}
            >
              Diselamatkan ({summary.savedMoneyCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("purchased")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                selectedStatus === "purchased"
                  ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                  : "bg-cream-50 dark:bg-navy-950 text-navy-600 dark:text-cream-300 border-cream-300 dark:border-navy-800"
              }`}
            >
              Terbeli ({summary.purchasedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                selectedStatus === "all"
                  ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                  : "bg-cream-50 dark:bg-navy-950 text-navy-600 dark:text-cream-300 border-cream-300 dark:border-navy-800"
              }`}
            >
              Semua ({items.length})
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 1. MOBILE VIEW (md:hidden) */}
          {/* ========================================================================= */}
          <div className="md:hidden space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 rounded-2xl border border-cream-200 dark:border-navy-800 bg-white/50 dark:bg-navy-900/50 p-6 space-y-2">
                <Heart className="w-8 h-8 text-rose-400 mx-auto opacity-50" />
                <p className="text-xs font-bold text-navy-900 dark:text-cream-100">
                  Belum ada barang di kategori ini
                </p>
                <p className="text-[11px] text-navy-500 dark:text-cream-300/60">
                  Gunakan tombol Tambah Incaran untuk mengunci barang incaranmu.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <WishlistCardMobile
                  key={item.id}
                  item={item}
                  onCancelAndSave={handleCancelAndSave}
                  onPurchase={handlePurchase}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          {/* ========================================================================= */}
          {/* 2. DESKTOP VIEW (hidden md:grid) */}
          {/* ========================================================================= */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {filteredItems.length === 0 ? (
              <div className="col-span-2 text-center py-16 rounded-2xl border border-cream-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-8 space-y-2">
                <Heart className="w-10 h-10 text-rose-400 mx-auto opacity-40" />
                <p className="text-sm font-bold text-navy-900 dark:text-cream-100">
                  Tidak ada barang incaran pada filter ini
                </p>
                <p className="text-xs text-navy-500 dark:text-cream-300/60">
                  Kunci barang yang ingin kamu beli di e-commerce agar terhindar dari checkout impulsif.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <WishlistCardDesktop
                  key={item.id}
                  item={item}
                  onCancelAndSave={handleCancelAndSave}
                  onPurchase={handlePurchase}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Mobile Floating Bottom Summary Dock */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 px-4 py-2 pointer-events-none">
        <div className="pointer-events-auto max-w-md mx-auto bg-navy-950/90 text-white rounded-2xl p-3 shadow-xl backdrop-blur-md border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-cream-300/70 block uppercase font-bold tracking-wider">
              Total Nilai Incaran
            </span>
            <span className="text-sm font-black text-emerald-400">
              {formatRupiah(summary.totalWishlistValue)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Add Modal */}
      <WishlistFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddItem}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />
    </div>
  );
}
