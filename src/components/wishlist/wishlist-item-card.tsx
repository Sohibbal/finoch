"use client";

import React from "react";
import { CheckCircle2, Trash2, Calendar, Clock } from "lucide-react";
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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-meta font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Tercapai</span>
        </span>
      );
    }

    if (projectionStatus === "achievable_now") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-meta font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Tercapai</span>
        </span>
      );
    }

    if (projectionStatus === "delayed") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-meta font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5" />
          <span>Tertunda</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-meta font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 whitespace-nowrap">
        <Calendar className="w-3.5 h-3.5" />
        <span>{`~${estimatedDays} hari`}</span>
      </span>
    );
  };

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border transition-all glass-sheen relative overflow-hidden group shadow-xs ${
        item.isAchieved
          ? "bg-white/60 dark:bg-[#111726]/60 border-slate-200/60 dark:border-slate-800/60 opacity-75"
          : "bg-white dark:bg-[#111726] border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3
              className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white ${
                item.isAchieved ? "line-through text-slate-400 dark:text-slate-500" : ""
              }`}
            >
              {item.name}
            </h3>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white money mt-0.5">
              {rupiah(item.targetPrice)}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Prioritas: <span className="font-semibold text-slate-800 dark:text-slate-200">Bintang {item.priority}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleAchieved(item.id)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                item.isAchieved
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{item.isAchieved ? "Batalkan" : "Tercapai!"}</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
