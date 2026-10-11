"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { comparisonLabels, detectSpendingPatterns, getMonthlyCategoryTotals } from "@/lib/insights/pattern-detector";
import { AiInsightCard } from "@/types/financial-types";
import { EMPTY_ACTION_CLASS, EmptyState, PageHeader } from "@/components/layout/page-header";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { getBills, getMonthlyBillAmount } from "@/lib/storage/bill-storage";
import { isDemoMode } from "@/lib/storage/local-storage";
import { mergeExpenses } from "@/components/dashboard/dashboard-data";
import { categoryLabel, rupiah } from "@/lib/format";
import { localDateKey } from "@/lib/date";

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** What each slip prints: a headline in Indonesian labels, a plain kind label, and the figures behind it. */
function slip(
  card: AiInsightCard,
  ranges: { current: string; previous: string }
): { title: string; kind: string; kindClass: string; figures: Array<[string, string]> } {
  const e = card.evidence;
  if (card.type === "spending_increase" || card.type === "spending_decrease") {
    const up = card.type === "spending_increase";
    const label = categoryLabel(String(e.category ?? ""));
    return {
      title: `${label} ${up ? "naik" : "turun"} ${Math.abs(Math.round(num(e.changePercent)))}% dari tanggal yang sama bulan lalu`,
      kind: up ? "Naik" : "Turun",
      kindClass: "text-ink",
      figures: [
        [ranges.previous, rupiah(num(e.previous))],
        [ranges.current, rupiah(num(e.current))],
        ["Selisih", rupiah(num(e.diffAmount))],
      ],
    };
  }
  if (card.type === "recurring") {
    const items = Array.isArray(e.items) ? e.items.map(String) : [];
    return {
      title: `${num(e.count)} tagihan rutin tiap bulan`,
      kind: "Tagihan rutin",
      kindClass: "text-ink-soft",
      figures: [
        ["Total per bulan (dari tagihan)", rupiah(num(e.total))],
        ["Isinya", items.join(", ")],
      ],
    };
  }
  return { title: card.title, kind: "Catatan", kindClass: "text-ink-soft", figures: [] };
}

export default function InsightsPage() {
  // null while loading: the user's own expenses (equal day ranges of this and last month) and recurring bills.
  const [insights, setInsights] = useState<AiInsightCard[] | null>(null);

  useEffect(() => {
    let active = true;
    // Server rows plus local ones not synced yet: the same rows the dashboard reads.
    Promise.all([
      // Demo mode shows only sample data: the server holds the user's real expenses.
      isDemoMode()
        ? []
        : fetch("/api/expenses")
            .then(async (res) => (res.ok ? (await res.json()).expenses : []))
            .catch(() => []),
      expenseStorage.getExpenses().catch((err) => {
        console.warn("Gagal memuat pengeluaran lokal:", err);
        return [];
      }),
    ]).then(([server, local]) => {
      if (!active) return;
      setInsights(
        detectSpendingPatterns({
          ...getMonthlyCategoryTotals(mergeExpenses(Array.isArray(server) ? server : [], local)),
          recurringExpenses: getBills().map((b) => ({ name: b.name, amount: getMonthlyBillAmount(b), frequency: b.frequency })),
        })
      );
    });
    return () => {
      active = false;
    };
  }, []);

  const now = new Date();
  const today = localDateKey(now);
  const ranges = comparisonLabels(now);

  return (
    <>
      <PageHeader title="Insight" subtitle={`Pola belanjamu ${ranges.current} dibanding ${ranges.previous}`} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-10 w-full">
        {insights === null && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true">
            <div className="h-56 bg-paper-deep motion-safe:animate-pulse" />
            <div className="h-56 bg-paper-deep motion-safe:animate-pulse" />
          </div>
        )}

        {insights?.length === 0 && (
          <EmptyState
            icon={Lightbulb}
            title="Belum cukup data untuk insight"
            action={
              <Link href="/dashboard" className={EMPTY_ACTION_CLASS}>
                Catat Pengeluaran
              </Link>
            }
          >
            Insight muncul setelah ada pengeluaran bulan lalu dan bulan ini untuk dibandingkan, atau tagihan rutin yang tercatat.
          </EmptyState>
        )}

        {insights && insights.length > 0 && (
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-10 border-t border-ink/20">
            {insights.map((card, idx) => {
              const s = slip(card, ranges);
              return (
                <li key={idx} className="py-6 border-b border-ink/20 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display text-head font-bold text-ink">{s.title}</h2>
                    <span className={`shrink-0 mt-1.5 text-meta font-semibold ${s.kindClass}`}>{s.kind}</span>
                  </div>
                  {s.figures.length > 0 && (
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                      {s.figures.map(([k, v]) => (
                        <React.Fragment key={k}>
                          <dt className="text-body text-ink-soft">{k}</dt>
                          <dd className="money text-body font-semibold text-ink text-right break-words">{v}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  )}
                  <p className="text-body text-ink">{card.impact}</p>
                  <p className="text-body text-ink">{card.recommendation}</p>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </>
  );
}
