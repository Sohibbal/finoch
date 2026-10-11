"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { WishlistItem } from "@/types/wishlist-types";
import {
  getWishlist,
  addWishlistItem,
  cancelAndSaveMoney,
  purchaseWishlistItem,
  deleteWishlistItem,
  getWishlistSummary,
} from "@/lib/storage/wishlist-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { useAuthContext } from "@/components/layout/auth-provider";

import { WishlistTag } from "@/components/wishlist/wishlist-tag";
import { WishlistTrophyCard } from "@/components/wishlist/wishlist-trophy-card";
import { WishlistFormModal } from "@/components/wishlist/wishlist-form-modal";
import { PageHeader } from "@/components/layout/page-header";
import { OptionButton, PRIMARY_CLASS } from "@/components/press/kampus-press";
import { rupiah } from "@/lib/format";

type Filter = "active" | "ready" | "saved_money" | "purchased" | "all";

export default function WishlistPage() {
  const { user } = useAuthContext();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Filter>("active");
  // Status line for screen readers when a tag changes state.
  const [notice, setNotice] = useState("");

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
    setNotice(`${target.name} batal dibeli. ${rupiah(target.price)} tetap di dompet.`);
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
        category: "Shopping & Lifestyle",
        userId: user?.id || "guest",
      });
      setNotice(`${target.name} (${rupiah(target.price)}) terbeli dan sudah dicatat ke Pengeluaran.`);
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
    if (selectedStatus === "ready") return item.status === "ready";
    if (selectedStatus === "saved_money") return item.status === "saved_money";
    if (selectedStatus === "purchased") return item.status === "purchased";
    return true; // all
  });

  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "active", label: "Lagi ditunda", count: summary.coolingCount + summary.readyCount },
    { id: "ready", label: "Tunda selesai", count: summary.readyCount },
    { id: "saved_money", label: "Diselamatkan", count: summary.savedMoneyCount },
    { id: "purchased", label: "Terbeli", count: summary.purchasedCount },
    { id: "all", label: "Semua", count: items.length },
  ];

  return (
    <>
      <PageHeader title="Wishlist Tunda" subtitle="Tahan dulu 7 hari sebelum checkout. Masih pengen? Baru beli." />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-5 items-end">
          <div className="lg:col-span-2">
            <WishlistTrophyCard summary={summary} />
          </div>
          <div className="space-y-3">
            <p className="text-body text-ink-soft">
              Lagi ditahan{" "}
              <span className="money font-bold text-ink">{rupiah(summary.totalWishlistValue)}</span> dari{" "}
              {summary.coolingCount + summary.readyCount} barang incaran.
            </p>
            <button type="button" onClick={() => setIsModalOpen(true)} className={`${PRIMARY_CLASS} w-full`}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Tambah incaran
            </button>
          </div>
        </div>

        <section aria-labelledby="wishlist-tags-title" className="space-y-4">
          <h2 id="wishlist-tags-title" className="sr-only">
            Barang incaran
          </h2>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Saring incaran">
            {filters.map((f) => (
              <OptionButton key={f.id} pressed={selectedStatus === f.id} onClick={() => setSelectedStatus(f.id)}>
                {f.label} <span className="money font-normal">{f.count}</span>
              </OptionButton>
            ))}
          </div>

          <p role="status" className="text-body text-ink min-h-[1.4rem]">
            {notice}
          </p>

          {filteredItems.length === 0 ? (
            <div className="py-6 space-y-2 max-w-prose">
              <p className="text-body font-semibold text-ink">Belum ada barang di sini.</p>
              <p className="text-body text-ink-soft">
                Lihat barang yang bikin kepengen di Shopee atau TikTok? Kunci dulu lewat Tambah incaran, lalu tunggu masa tundanya
                lewat.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <WishlistTag
                    item={item}
                    onCancelAndSave={handleCancelAndSave}
                    onPurchase={handlePurchase}
                    onDelete={handleDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <WishlistFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddItem} />
    </>
  );
}
