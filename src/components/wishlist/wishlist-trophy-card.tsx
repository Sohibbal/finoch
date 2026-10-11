"use client";

import React from "react";
import { WishlistSummary } from "@/types/wishlist-types";
import { rupiah } from "@/lib/format";
import { Guilloche } from "@/components/press/guilloche";
import { DENOM } from "@/components/press/kampus-press";
import { useRolledNumber } from "@/components/press/rolling-numeral";

interface WishlistTrophyCardProps {
  summary: WishlistSummary;
}

const note = DENOM.teal;

/** Money that never left: printed as a teal note that grows with every "gak jadi". */
export function WishlistTrophyCard({ summary }: WishlistTrophyCardProps) {
  const rolled = useRolledNumber(summary.totalMoneySaved);
  return (
    <section aria-labelledby="wishlist-saved-title" className={`relative overflow-hidden ${note.field} ${note.ink} px-5 sm:px-8 py-6`}>
      <Guilloche seed={0x77a1} size={200} families={3} className="absolute -right-12 -top-10 !text-navy-900 opacity-30" />
      <div className="relative space-y-1">
        <h2 id="wishlist-saved-title" className="text-body font-semibold">
          Uang yang batal keluar
        </h2>
        <p className="font-display font-bold money flex items-baseline gap-2">
          <span className="text-head">Rp</span>
          <span className="text-numeral" aria-hidden="true">
            {rolled.toLocaleString("id-ID")}
          </span>
          <span className="sr-only">{summary.totalMoneySaved.toLocaleString("id-ID")}</span>
        </p>
        <p className={`text-body ${note.soft}`}>
          {summary.savedMoneyCount > 0
            ? `${summary.savedMoneyCount} barang ditahan sampai nafsunya lewat. Uangnya tetap di dompet.`
            : "Belum ada yang dibatalkan. Tunda dulu, siapa tahu minggu depan sudah nggak pengen."}
        </p>
      </div>
    </section>
  );
}
