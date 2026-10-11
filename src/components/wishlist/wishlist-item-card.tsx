"use client";

import React from "react";
import { CheckCircle2, Trash2, Calendar, Clock, Sparkles } from "lucide-react";
import { rupiah } from "@/lib/format";
import type { LocalWishlist } from "@/lib/storage/wishlist-storage";

interface WishlistItemCardProps {
  item: LocalWishlist;
  estimatedDays: number;
  projectionStatus: "on_track" | "delayed" | "achievable_now";
  onToggleAchieved: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WishlistItemCard({
  item,
  estimatedDays,
  projectionStatus,
  onToggleAchieved,
  onDelete,
}: WishlistItemCardProps) {
  const getStatusBadge = () => {
    if (item.isAchieved) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-meta font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Tercapai 🎉</span>
        </span>
      );
    }

    if (projectionStatus === "achievable_now") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-meta font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tabungan Cukup!</span>
        </span>
      );
    }

    if (projectionStatus === "delayed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-meta font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Tertunda (Rem Belanja)</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-meta font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Calendar className="w-3.5 h-3.5" />
        <span>{`~${estimatedDays} hari lagi`}</span>
      </span>
    );
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        item.isAchieved
          ? "bg-paper-sheet/40 dark:bg-navy-900/40 border-ink/10 opacity-70"
          : "bg-paper-sheet dark:bg-navy-900 border-ink/15 dark:border-navy-800 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3
            className={`text-body font-bold text-ink dark:text-white ${
              item.isAchieved ? "line-through text-ink-soft" : ""
            }`}
          >
            {item.name}
          </h3>
          <p className="text-head font-bold text-ink dark:text-white money mt-0.5">
            {rupiah(item.targetPrice)}
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-ink/10 dark:border-navy-800 text-meta">
        <span className="text-ink-soft dark:text-navy-400">
          Prioritas: <span className="font-semibold text-ink dark:text-white">Bintang {item.priority}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleAchieved(item.id)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              item.isAchieved
                ? "bg-ink/5 dark:bg-navy-800 text-ink dark:text-white"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{item.isAchieved ? "Batalkan" : "Tercapai!"}</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-xl text-ink-soft hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Hapus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
