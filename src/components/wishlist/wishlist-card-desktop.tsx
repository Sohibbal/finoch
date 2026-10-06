"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Trophy,
  Calendar,
} from "lucide-react";
import { WishlistItem } from "@/types/wishlist-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface WishlistCardDesktopProps {
  item: WishlistItem;
  onCancelAndSave: (id: string) => void;
  onPurchase: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WishlistCardDesktop({
  item,
  onCancelAndSave,
  onPurchase,
  onDelete,
}: WishlistCardDesktopProps) {
  const now = new Date();
  const endDate = new Date(item.coolingEndDate);
  const diffTime = endDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const priorityLabels = {
    high: { label: "Prioritas Tinggi", color: "text-rose-600 bg-rose-500/10 border-rose-500/20" },
    medium: { label: "Prioritas Sedang", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
    low: { label: "Prioritas Rendah", color: "text-navy-600 dark:text-cream-300 bg-cream-200 dark:bg-navy-800 border-cream-300 dark:border-navy-700" },
  }[item.priority];

  return (
    <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-0.5 rounded-lg bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-300 font-semibold border border-cream-200 dark:border-navy-700">
            {item.category}
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${priorityLabels.color}`}>
            {priorityLabels.label}
          </span>
        </div>

        {/* Status Badge */}
        {item.status === "cooling" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>Masa Tunda: {daysLeft} Hari Lagi</span>
          </span>
        )}

        {item.status === "ready" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Masa Tunda Selesai!</span>
          </span>
        )}

        {item.status === "saved_money" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>Hemat {formatRupiah(item.price)}</span>
          </span>
        )}

        {item.status === "purchased" && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Terbeli</span>
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-bold text-base text-navy-950 dark:text-cream-50">
            {item.name}
          </h3>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 shrink-0">
            {formatRupiah(item.price)}
          </span>
        </div>

        {item.note && (
          <p className="text-xs text-navy-500 dark:text-cream-300/70 leading-relaxed">
            {item.note}
          </p>
        )}

        {item.status === "cooling" && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            💡 <strong>Aturan Tunda 7 Hari:</strong> Tahan diri {daysLeft} hari lagi. Jika setelah masa tunda selesai kamu masih yakin membutuhkan barang ini dan uang kos aman, barulah dibeli!
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-cream-200 dark:border-navy-800">
        <div className="flex items-center gap-2 text-xs text-navy-400 dark:text-cream-300/50">
          <Calendar className="w-3.5 h-3.5" />
          <span>Dicatat {new Date(item.createdAt).toLocaleDateString("id-ID")}</span>
          {item.linkUrl && (
            <a
              href={item.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 ml-2"
            >
              <span>Link Toko</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-2 text-navy-400 hover:text-rose-500 rounded-xl hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors"
            title="Hapus item"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {(item.status === "cooling" || item.status === "ready") && (
            <>
              {/* Cancel & Save Button */}
              <button
                type="button"
                onClick={() => onCancelAndSave(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold transition-all active:scale-95"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Gak Jadi (Selamatkan Uang)</span>
              </button>

              {/* Purchase Button */}
              <button
                type="button"
                onClick={() => onPurchase(item.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  item.status === "ready"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    : "bg-navy-900 dark:bg-cream-100 text-cream-50 dark:text-navy-950 opacity-90"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Eksekusi Beli</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
