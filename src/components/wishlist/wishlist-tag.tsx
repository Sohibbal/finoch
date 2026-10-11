"use client";

import React from "react";
import { Check, ExternalLink, Hourglass, PiggyBank, ShoppingBag, Trash2 } from "lucide-react";
import { WishlistItem } from "@/types/wishlist-types";
import { rupiah } from "@/lib/format";
import { printDate } from "@/components/press/print-date";
import { formatSerial } from "@/components/press/serial";
import { StateLabel } from "@/components/press/kampus-press";

interface WishlistTagProps {
  item: WishlistItem;
  onCancelAndSave: (id: string) => void;
  onPurchase: (id: string) => void;
  onDelete: (id: string) => void;
  now?: Date;
}

export const CATEGORY_LABELS: Record<string, string> = {
  Fashion: "Fashion & pakaian",
  Gadget: "Gadget & aksesoris",
  Buku: "Buku & kuliah",
  Hobi: "Hobi & gaming",
  Kosmetik: "Skincare & kosmetik",
  Lainnya: "Lainnya",
};

// One line of personality per tag, from its category (the item has no field for it).
const PERSONALITY: Record<string, string> = {
  Fashion: "Lemari udah penuh, tapi katanya belum ada yang kayak gini.",
  Gadget: "Spesifikasinya bikin ngiler, saldonya bikin mikir.",
  Buku: "Investasi otak, asal beneran dibaca sampai habis.",
  Hobi: "Hiburan itu penting, uang kos lebih penting.",
  Kosmetik: "Glowing boleh, saldo jangan sampai kusam.",
};
const DEFAULT_PERSONALITY = "Tahan dulu. Minggu depan belum tentu masih pengen.";

const PRIORITY_LABELS = { high: "butuh banget", medium: "bagus kalau ada", low: "cuma kepengen" } as const;

// Where the tag stands, in words; only money status gets a stamp.
const STATE_ICON = { cooling: Hourglass, ready: Check, saved_money: PiggyBank, purchased: ShoppingBag } as const;
const STATE_WORD = { cooling: "", ready: "Tunda selesai", saved_money: "Diselamatkan", purchased: "Terbeli" } as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days left in the cooling-off period, never negative. */
export function coolingDaysLeft(item: Pick<WishlistItem, "coolingEndDate">, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((new Date(item.coolingEndDate).getTime() - now.getTime()) / DAY_MS));
}

const ACTION = "inline-flex items-center gap-1.5 min-h-11 px-3 rounded-full border text-body font-semibold transition-colors";

/** A wishlist item as a price tag hanging on a string, labelled with its cooling-off countdown. */
export function WishlistTag({ item, onCancelAndSave, onPurchase, onDelete, now = new Date() }: WishlistTagProps) {
  const daysLeft = coolingDaysLeft(item, now);
  const open = item.status === "cooling" || item.status === "ready";
  const elapsed = Math.min(item.coolingDays, item.coolingDays - daysLeft);

  return (
    <article className="relative ml-4 bg-paper-sheet border border-l-0 border-ink/25" aria-label={`${item.name}, ${rupiah(item.price)}`}>
      {/* The tag's pointed end with its punched string hole. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 100"
        preserveAspectRatio="none"
        className="absolute -left-4 -top-px w-4 h-[calc(100%+2px)] fill-paper-sheet stroke-ink/25"
      >
        <path d="M16.5 0 L0.5 50 L16.5 100" vectorEffect="non-scaling-stroke" />
      </svg>
      <span aria-hidden="true" className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-paper border border-ink/40" />

      <div className="pl-5 pr-4 py-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-body font-bold text-ink break-words min-w-0">{item.name}</h3>
            <StateLabel icon={STATE_ICON[item.status]} className="text-ink">
              {item.status === "cooling" ? `Tunda ${daysLeft} hari lagi` : STATE_WORD[item.status]}
            </StateLabel>
          </div>
          <p className="text-meta text-ink-soft">
            {CATEGORY_LABELS[item.category] ?? item.category} · {PRIORITY_LABELS[item.priority]}
          </p>
          <p className="money font-display text-head font-bold text-ink">{rupiah(item.price)}</p>
          <p className="text-meta text-ink-soft italic">{PERSONALITY[item.category] ?? DEFAULT_PERSONALITY}</p>
        </div>

        {item.note && <p className="text-body text-ink border-l border-ink/30 pl-3 break-words">&ldquo;{item.note}&rdquo;</p>}

        {open && item.coolingDays <= 14 && (
          <div className="space-y-1">
            <div className="flex gap-1" aria-hidden="true">
              {Array.from({ length: item.coolingDays }, (_, i) => (
                <span key={i} className={`h-2 flex-1 max-w-6 border border-ink/50 ${i < elapsed ? "bg-ink" : ""}`} />
              ))}
            </div>
            <p className="text-meta text-ink-soft">
              {item.status === "ready"
                ? `${item.coolingDays} hari sudah lewat. Masih pengen dan uang kos aman? Silakan.`
                : `Hari ke-${elapsed} dari ${item.coolingDays}.`}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-dashed border-ink/25 pt-2">
          <p className="text-meta text-ink-soft">
            <span className="money tracking-[0.12em]">{formatSerial(item.id, item.createdAt)}</span> · dicatat {printDate(new Date(item.createdAt))}
          </p>
          {item.linkUrl && (
            <a
              href={item.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 min-h-11 text-meta font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
            >
              Link toko <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {open && (
            <>
              <button type="button" onClick={() => onCancelAndSave(item.id)} className={`${ACTION} border-2 border-ink text-ink hover:bg-ink/5`}>
                Gak jadi, simpan uangnya
              </button>
              <button type="button" onClick={() => onPurchase(item.id)} className={`${ACTION} border-ink/30 text-ink hover:bg-ink/5`}>
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                Beli
              </button>
            </>
          )}
          {item.status === "saved_money" && <p className="text-meta text-ink-soft">Nafsu belanja berhasil ditahan.</p>}
          {item.status === "purchased" && <p className="text-meta text-ink-soft">Sudah tercatat di Pengeluaran.</p>}
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Hapus ${item.name} dari wishlist`}
            className="ml-auto w-11 h-11 rounded-full flex items-center justify-center text-ink-soft hover:text-habis-ink hover:bg-ink/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
