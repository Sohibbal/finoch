"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { detectSpendingPatterns, getMonthlyCategoryTotals } from "@/lib/insights/pattern-detector";
import { AiInsightCard } from "@/types/financial-types";
import { EMPTY_ACTION_CLASS, EmptyState, PageHeader } from "@/components/layout/page-header";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { getBills } from "@/lib/storage/bill-storage";
import { Cap, type CapTone } from "@/components/press/denom";
import { formatSerial } from "@/components/press/serial";
import { categoryLabel, rupiah } from "@/lib/format";
import { localDateKey } from "@/lib/date";

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

/** The detector writes stored (English) category names into its sentences; print the Indonesian label. */
function localize(card: AiInsightCard, text: string): string {
  const cat = card.evidence.category;
  return typeof cat === "string" && cat ? text.split(cat).join(categoryLabel(cat)) : text;
}

/** What each slip prints: a headline in Indonesian labels, its stamp, and the figures behind it. */
function slip(card: AiInsightCard): { title: string; stamp: string; tone: CapTone; figures: Array<[string, string]> } {
  const e = card.evidence;
  if (card.type === "spending_increase" || card.type === "spending_decrease") {
    const up = card.type === "spending_increase";
    const label = categoryLabel(String(e.category ?? ""));
    return {
      title: `${label} ${up ? "naik" : "turun"} ${Math.abs(Math.round(num(e.changePercent)))}% dari bulan lalu`,
      stamp: up ? "Naik" : "Hemat",
      tone: up ? "habis" : "aman",
      figures: [
        ["Bulan lalu", rupiah(num(e.previous))],
        ["Bulan ini", rupiah(num(e.current))],
        ["Selisih", rupiah(num(e.diffAmount))],
      ],
    };
  }
  if (card.type === "recurring") {
    const items = Array.isArray(e.items) ? e.items.map(String) : [];
    return {
      title: `${num(e.count)} tagihan rutin tiap bulan`,
      stamp: "Rutin",
      tone: "ink",
      figures: [
        ["Total per bulan", rupiah(num(e.total))],
        ["Isinya", items.join(", ")],
      ],
    };
  }
  return { title: card.title, stamp: "Catatan", tone: "ink", figures: [] };
}

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

  const today = localDateKey(new Date());

  return (
    <>
      <PageHeader title="Insight" subtitle="Pola belanjamu bulan ini dibanding bulan lalu" />

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
              const s = slip(card);
              return (
                <li key={idx} className="py-6 border-b border-ink/20 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display text-head font-bold text-ink">{s.title}</h2>
                    <Cap tone={s.tone} tilt={idx % 2 ? 5 : -5} className="mt-1">
                      {s.stamp}
                    </Cap>
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
                  <p className="text-body text-ink">{localize(card, card.impact)}</p>
                  <p className="text-body text-ink">
                    <span className="font-semibold">Coba: </span>
                    {localize(card, card.recommendation)}
                  </p>
                  <p className="money text-meta tracking-[0.12em] text-ink-soft">{formatSerial(`insight-${card.type}-${idx}`, today)}</p>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </>
  );
}
