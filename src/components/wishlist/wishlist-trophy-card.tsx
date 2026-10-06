"use client";

import React from "react";
import { Trophy, Sparkles, ShieldCheck, HeartHandshake } from "lucide-react";
import { WishlistSummary } from "@/types/wishlist-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface WishlistTrophyCardProps {
  summary: WishlistSummary;
}

export function WishlistTrophyCard({ summary }: WishlistTrophyCardProps) {
  return (
    <div className="bg-gradient-to-br from-amber-500/20 via-cream-100 to-amber-500/10 dark:from-amber-950/40 dark:via-navy-950 dark:to-navy-900 border border-amber-500/30 rounded-3xl p-5 shadow-sm space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
            <Trophy className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Benteng Anti-Impulsif Mahasiswa
            </span>
            <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
              Total Uang yang Berhasil Diselamatkan
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white shadow-sm">
          {summary.savedMoneyCount} Nafsu Tertahan
        </span>
      </div>

      <div className="flex items-baseline gap-2 pt-1">
        <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
          {formatRupiah(summary.totalMoneySaved)}
        </span>
        <span className="text-xs text-navy-600 dark:text-cream-300/70 font-semibold">
          tetap aman di tabunganmu
        </span>
      </div>

      <p className="text-xs text-navy-700 dark:text-cream-200/90 leading-relaxed border-t border-amber-500/20 pt-2.5">
        Berkat <strong>Aturan Tunda 7 Hari</strong>, kamu berhasil menghindari checkout barang yang cuma nafsu sesaat di e-commerce & medsos.
      </p>
    </div>
  );
}
