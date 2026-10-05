"use client";

import React, { useState } from "react";
import {
  Receipt,
  Share2,
  Copy,
  Check,
  BookmarkCheck,
  Send,
  User,
} from "lucide-react";
import { SplitBillResult, SplitBillConfig } from "@/types/split-bill-types";
import {
  formatRupiah,
  formatWhatsAppSplitBillMessage,
  generateWhatsAppShareUrl,
} from "@/lib/financial/split-bill-engine";

interface SplitSummaryCardProps {
  result: SplitBillResult;
  config: SplitBillConfig;
  onSaveToTransactionsAndTalangan: () => void;
  isSaved?: boolean;
}

export function SplitSummaryCard({
  result,
  config,
  onSaveToTransactionsAndTalangan,
  isSaved = false,
}: SplitSummaryCardProps) {
  const [copied, setCopied] = useState(false);

  const fullMessage = formatWhatsAppSplitBillMessage(result, config);
  const waUrl = generateWhatsAppShareUrl(fullMessage);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Gagal menyalin pesan:", err);
    }
  };

  const copyIndividualShare = async (name: string, amount: number) => {
    const text = `Halo ${name}, patungan makan di ${config.restaurantName || "Resto"}: *${formatRupiah(
      amount
    )}* yaa.\nTransfer ke: ${config.paymentNote || "BCA / E-Wallet"}\nMakasih! 🙌`;
    try {
      await navigator.clipboard.writeText(text);
      alert(`Rincian untuk ${name} berhasil disalin ke clipboard!`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 transition-colors">
      <div className="flex items-center justify-between border-b border-cream-200 dark:border-navy-800 pb-3">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-navy-950 dark:text-cream-50">
            Hasil Rincian Patungan
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          {config.mode === "itemized" ? "Bagi per Menu" : "Bagi Rata"}
        </span>
      </div>

      {/* Bill Overview Card */}
      <div className="bg-gradient-to-br from-cream-100 to-cream-50 dark:from-navy-950 dark:to-navy-900 border border-cream-200 dark:border-navy-800 rounded-xl p-4 space-y-2.5">
        <div className="flex justify-between items-center text-xs text-navy-600 dark:text-cream-300/80">
          <span>Subtotal Makanan</span>
          <span className="font-semibold text-navy-950 dark:text-cream-50">
            {formatRupiah(result.subtotal)}
          </span>
        </div>

        {result.totalTax > 0 && (
          <div className="flex justify-between items-center text-xs text-navy-600 dark:text-cream-300/80">
            <span>Pajak Restoran (PB1 {config.taxPercentage}%)</span>
            <span className="font-semibold text-navy-950 dark:text-cream-50">
              +{formatRupiah(result.totalTax)}
            </span>
          </div>
        )}

        {result.totalService > 0 && (
          <div className="flex justify-between items-center text-xs text-navy-600 dark:text-cream-300/80">
            <span>Service Charge ({config.servicePercentage}%)</span>
            <span className="font-semibold text-navy-950 dark:text-cream-50">
              +{formatRupiah(result.totalService)}
            </span>
          </div>
        )}

        {result.totalDiscount > 0 && (
          <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Potongan Diskon</span>
            <span>-{formatRupiah(result.totalDiscount)}</span>
          </div>
        )}

        <div className="border-t border-cream-300 dark:border-navy-800 pt-2 flex justify-between items-baseline">
          <span className="text-xs sm:text-sm font-bold text-navy-950 dark:text-cream-50">
            Total Tagihan Kasir
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
            {formatRupiah(result.grandTotal)}
          </span>
        </div>
      </div>

      {/* Shares List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-navy-600 dark:text-cream-300/70 uppercase tracking-wider">
          Nominal per Orang ({result.shares.length})
        </h3>

        {result.shares.map((share) => (
          <div
            key={share.participantId}
            className={`p-3.5 rounded-xl border transition-all ${
              share.isUser
                ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 shadow-sm"
                : "bg-cream-50/50 dark:bg-navy-950/50 border-cream-200 dark:border-navy-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    share.isUser
                      ? "bg-emerald-600 text-white"
                      : "bg-cream-300 dark:bg-navy-800 text-navy-800 dark:text-cream-200"
                  }`}
                >
                  {share.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-navy-950 dark:text-cream-50">
                      {share.name}
                    </span>
                    {share.isUser && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                        Porsi Saya
                      </span>
                    )}
                  </div>
                  {config.mode === "itemized" && share.items.length > 0 && (
                    <p className="text-[11px] text-navy-500 dark:text-cream-300/60 line-clamp-1">
                      {share.items.map((i) => i.itemName).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <span className="block font-black text-xs sm:text-sm text-navy-950 dark:text-cream-50">
                    {formatRupiah(share.finalAmount)}
                  </span>
                  {config.rounding > 0 && (
                    <span className="text-[10px] text-navy-400 dark:text-cream-300/40">
                      Bulat {config.rounding}
                    </span>
                  )}
                </div>

                {!share.isUser && (
                  <button
                    type="button"
                    onClick={() => copyIndividualShare(share.name, share.finalAmount)}
                    className="p-1.5 text-navy-400 hover:text-navy-700 dark:hover:text-cream-200 hover:bg-cream-200/50 dark:hover:bg-navy-800 rounded-lg transition-colors"
                    title={`Salin tagihan khusus ${share.name}`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Copy Message Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Rincian Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Pesan Rincian</span>
              </>
            )}
          </button>

          {/* Direct WhatsApp Share Button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Kirim via WhatsApp</span>
          </a>
        </div>

        {/* Save to Finoch Transactions & Talangan */}
        <button
          type="button"
          onClick={onSaveToTransactionsAndTalangan}
          disabled={isSaved || result.grandTotal <= 0}
          className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl border transition-all ${
            isSaved
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 cursor-default"
              : "bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-900 dark:text-cream-100 border-cream-300 dark:border-navy-700 active:scale-95"
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Tersimpan di Pengeluaran & Buku Talangan!</span>
            </>
          ) : (
            <>
              <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Simpan Porsi Saya & Catat Talangan Teman</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
