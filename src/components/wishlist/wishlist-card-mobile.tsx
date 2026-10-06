"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trophy,
} from "lucide-react";
import { WishlistItem } from "@/types/wishlist-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface WishlistCardMobileProps {
  item: WishlistItem;
  onCancelAndSave: (id: string) => void;
  onPurchase: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WishlistCardMobile({
  item,
  onCancelAndSave,
  onPurchase,
  onDelete,
}: WishlistCardMobileProps) {
  // Calculate remaining days
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
    <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl p-4 shadow-sm space-y-3 transition-colors">
      {/* Top Meta: Category & Cooling Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-cream-300 font-semibold border border-cream-200 dark:border-navy-700">
            {item.category}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold border ${priorityLabels.color}`}>
            {priorityLabels.label}
          </span>
        </div>

        {/* Status Badge */}
        {item.status === "cooling" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Tahan {daysLeft} Hari Lagi</span>
          </span>
        )}

        {item.status === "ready" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Masa Tunda Selesai</span>
          </span>
        )}

        {item.status === "saved_money" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-sm">
            <Trophy className="w-3 h-3" />
            <span>Hemat {formatRupiah(item.price)}</span>
          </span>
        )}

        {item.status === "purchased" && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
            <ShoppingBag className="w-3 h-3" />
            <span>Terbeli</span>
          </span>
        )}
      </div>

      {/* Title & Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-navy-950 dark:text-cream-50 truncate">
            {item.name}
          </h3>
          {item.note && (
            <p className="text-[11px] text-navy-500 dark:text-cream-300/60 line-clamp-1 mt-0.5">
              {item.note}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
            {formatRupiah(item.price)}
          </span>
        </div>
      </div>

      {/* Cooling-off Notice Banner if cooling */}
      {item.status === "cooling" && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          💡 <strong>Aturan Tunda 7 Hari:</strong> Tahan diri selama {daysLeft} hari lagi. Jika setelah {daysLeft} hari kamu masih merasa butuh dan uang saku aman, barulah beli!
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between pt-2 border-t border-cream-200 dark:border-navy-800 gap-2">
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="p-2 text-navy-400 hover:text-rose-500 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          title="Hapus dari wishlist"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Action Buttons for Cooling or Ready */}
        {(item.status === "cooling" || item.status === "ready") && (
          <div className="flex items-center gap-2">
            {/* Cancel & Save Money */}
            <button
              type="button"
              onClick={() => onCancelAndSave(item.id)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold transition-all active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Gak Jadi (Hemat!)</span>
            </button>

            {/* Purchase Button */}
            <button
              type="button"
              onClick={() => onPurchase(item.id)}
              className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                item.status === "ready"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  : "bg-navy-900 dark:bg-cream-100 text-cream-50 dark:text-navy-950 opacity-90"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Beli</span>
            </button>
          </div>
        )}

        {item.status === "saved_money" && (
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Nafsu belanja berhasil ditahan!</span>
          </span>
        )}

        {item.status === "purchased" && (
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sudah dicatat ke Pengeluaran</span>
          </span>
        )}
      </div>
    </div>
  );
}
