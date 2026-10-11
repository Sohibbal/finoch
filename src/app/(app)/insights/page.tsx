"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Lightbulb,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import { detectSpendingPatterns, getMonthlyCategoryTotals } from "@/lib/insights/pattern-detector";
import { AiInsightCard } from "@/types/financial-types";
import { PageHeader } from "@/components/layout/page-header";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { getBills } from "@/lib/storage/bill-storage";

export default function InsightsPage() {
  // null while loading: the user's own expenses (this vs last month) and recurring bills.
  const [insights, setInsights] = useState<AiInsightCard[] | null>(null);

  useEffect(() => {
    let active = true;
    expenseStorage
      .getExpenses()
      .catch((err) => {
        console.warn("Gagal memuat pengeluaran lokal:", err);
        return [];
      })
      .then((expenses) => {
        if (!active) return;
        setInsights(
          detectSpendingPatterns({
            ...getMonthlyCategoryTotals(expenses),
            recurringExpenses: getBills().map((b) => ({ name: b.name, amount: b.amount, frequency: b.frequency })),
          })
        );
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Wawasan Finansial (AI Insights)"
        subtitle="Setiap wawasan didukung bukti angka konkret dan rencana aksi nyata"
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
        <div>
          <h2 className="text-xl font-black text-navy-950 dark:text-cream-50">
            Deteksi Pola & Rekomendasi Finansial
          </h2>
          <p className="text-xs text-navy-600 dark:text-cream-300/70 mt-1">
            Evaluasi kebiasaan belanja untuk mencegah kebocoran kas bulanan secara cerdas.
          </p>
        </div>

        {insights === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true">
            <div className="h-56 rounded-2xl bg-cream-200/70 dark:bg-navy-900/70 animate-pulse" />
            <div className="h-56 rounded-2xl bg-cream-200/70 dark:bg-navy-900/70 animate-pulse" />
          </div>
        )}

        {insights?.length === 0 && (
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cream-100 dark:bg-navy-900 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-navy-700 dark:text-cream-200" />
            </div>
            <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">Belum cukup data untuk wawasan</h3>
            <p className="text-xs text-navy-600 dark:text-cream-300/70">
              Wawasan muncul setelah ada pengeluaran bulan lalu dan bulan ini untuk dibandingkan, atau tagihan rutin yang tercatat.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-5 py-2.5 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs"
            >
              Catat Pengeluaran
            </Link>
          </div>
        )}

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights?.map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#070E1A] rounded-2xl p-6 shadow-sm border border-cream-300 dark:border-navy-800 space-y-4 flex flex-col justify-between transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      card.type === "spending_increase"
                        ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                        : card.type === "spending_decrease"
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "bg-cream-100 text-navy-800 dark:bg-navy-900 dark:text-cream-200"
                    }`}
                  >
                    {card.type === "spending_increase" ? (
                      <ShieldAlert className="w-3.5 h-3.5" />
                    ) : card.type === "spending_decrease" ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {card.type.replace("_", " ")}
                  </span>
                  <span className="text-xs text-navy-400 dark:text-cream-400/60">
                    Akurasi: {Math.round((card.confidence || 0.95) * 100)}%
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                  {card.title}
                </h3>
                <p className="text-xs text-navy-600 dark:text-cream-300/80 leading-relaxed">
                  {card.description}
                </p>

                {/* Evidence Box */}
                <div className="p-3 rounded-xl bg-cream-50/70 dark:bg-navy-900/50 border border-cream-200 dark:border-navy-800/60 text-xs text-navy-700 dark:text-cream-300">
                  <div className="font-semibold text-navy-950 dark:text-cream-50 mb-1">
                    Bukti Angka:
                  </div>
                  <pre className="text-[11px] font-mono text-navy-500 dark:text-cream-400/70 overflow-x-auto">
                    {JSON.stringify(card.evidence, null, 2)}
                  </pre>
                </div>

                {/* Impact Statement */}
                <div className="text-xs font-medium text-navy-700 dark:text-cream-300">
                  <span className="font-bold text-navy-950 dark:text-cream-50">Dampak: </span>
                  {card.impact}
                </div>
              </div>

              {/* Recommendation Action */}
              <div className="pt-3 border-t border-cream-200 dark:border-navy-800/80">
                <div className="p-3 rounded-xl bg-cream-100 dark:bg-navy-900 border border-cream-200 dark:border-navy-800 text-xs text-navy-900 dark:text-cream-100 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-navy-800 dark:text-cream-200" />
                  <div>
                    <span className="font-bold">Rekomendasi Aksi: </span>
                    {card.recommendation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
