"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, Send, BookmarkCheck, HandCoins } from "lucide-react";
import { SplitBillResult, SplitBillConfig } from "@/types/split-bill-types";
import {
  formatRupiah,
  formatWhatsAppSplitBillMessage,
  generateWhatsAppShareUrl,
} from "@/lib/financial/split-bill-engine";
import { rupiah } from "@/lib/format";
import { formatSerial } from "@/components/press/serial";
import { Perforation, PRIMARY_CLASS, SECONDARY_CLASS, Stamp } from "@/components/press/kampus-press";

interface SplitSummaryCardProps {
  result: SplitBillResult;
  config: SplitBillConfig;
  onSaveToTransactionsAndTalangan: () => void;
  isSaved?: boolean;
  /** Friends' shares still open in Buku Kasbon. */
  unpaidReceivables?: number;
}

/** Each person's share as a stub torn off the nota, then the send and save actions. */
export function SplitSummaryCard({
  result,
  config,
  onSaveToTransactionsAndTalangan,
  isSaved = false,
  unpaidReceivables = 0,
}: SplitSummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);

  const fullMessage = formatWhatsAppSplitBillMessage(result, config);
  const waUrl = generateWhatsAppShareUrl(fullMessage);
  const hasBill = result.grandTotal > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin pesan:", err);
    }
  };

  const copyIndividualShare = async (id: string, name: string, amount: number) => {
    const text = `Halo ${name}, patungan makan di ${config.restaurantName || "Resto"}: *${formatRupiah(
      amount
    )}* yaa.\nTransfer ke: ${config.paymentNote || "BCA / E-Wallet"}\nMakasih! 🙌`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFor(id);
      setTimeout(() => setCopiedFor((cur) => (cur === id ? null : cur)), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section aria-labelledby="split-shares-title" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/20 pb-2">
        <h2 id="split-shares-title" className="font-display text-head font-bold text-ink">
          Sobekan per orang
        </h2>
        <p className="text-meta text-ink-soft">{config.mode === "itemized" ? "Dibagi per menu" : "Dibagi rata"}</p>
      </div>

      {!hasBill ? (
        <p className="text-body text-ink-soft">Begitu ada menu di nota, tiap orang dapat sobekan dengan jumlah transferannya.</p>
      ) : (
        <ol className="space-y-3">
          {result.shares.map((share) => (
            <li key={share.participantId} className="bg-paper-sheet border border-ink/20">
              <Perforation />
              <div className="px-4 pt-3 pb-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body font-bold text-ink break-words">
                      {share.name}
                      {share.isUser && <span className="font-normal text-ink-soft"> · porsi saya</span>}
                    </p>
                    {config.mode === "itemized" && share.items.length > 0 && (
                      <p className="text-meta text-ink-soft break-words">{share.items.map((i) => i.itemName).join(", ")}</p>
                    )}
                  </div>
                  <p className="money font-display text-head font-bold text-ink whitespace-nowrap">{rupiah(share.finalAmount)}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="money text-meta tracking-[0.12em] text-ink-soft">
                    {formatSerial(share.participantId, config.date)}
                  </span>
                  {share.isUser ? (
                    isSaved && <Stamp label="Tercatat" tone="aman" icon={Check} fresh />
                  ) : (
                    <button
                      type="button"
                      onClick={() => copyIndividualShare(share.participantId, share.name, share.finalAmount)}
                      className="inline-flex items-center gap-1.5 min-h-11 px-3 -mr-3 text-body font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
                    >
                      {copiedFor === share.participantId ? (
                        <>
                          <Check className="w-4 h-4" aria-hidden="true" /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" aria-hidden="true" /> Salin tagihan {share.name}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="space-y-2 pt-1">
        {hasBill && (
          <>
        <button
          type="button"
          onClick={onSaveToTransactionsAndTalangan}
          disabled={isSaved || !hasBill}
          className={`${PRIMARY_CLASS} w-full`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              Tersimpan di Pengeluaran & Buku Kasbon
            </>
          ) : (
            <>
              <BookmarkCheck className="w-4 h-4" aria-hidden="true" />
              Simpan porsi saya & catat kasbon teman
            </>
          )}
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href={hasBill ? waUrl : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!hasBill}
            className={`${SECONDARY_CLASS} ${hasBill ? "" : "pointer-events-none opacity-50"}`}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            Kirim ke WhatsApp
          </a>
          <button type="button" onClick={handleCopy} disabled={!hasBill} className={SECONDARY_CLASS}>
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            {copied ? "Rincian tersalin" : "Salin rincian"}
          </button>
        </div>
          </>
        )}
        <Link
          href="/debts"
          className="inline-flex items-center gap-2 min-h-11 text-body font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
        >
          <HandCoins className="w-4 h-4" aria-hidden="true" />
          Buku Kasbon
          {unpaidReceivables > 0 && <span className="font-normal text-ink-soft">· {unpaidReceivables} piutang belum lunas</span>}
        </Link>
      </div>
    </section>
  );
}
