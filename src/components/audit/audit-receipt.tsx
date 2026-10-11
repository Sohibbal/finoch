import React from "react";
import { Cap } from "@/components/press/analisis-press";
import { Serial, formatSerial } from "@/components/press/serial";
import { rupiah, shortDate } from "@/lib/format";
import { localDateKey, parseDate } from "@/lib/date";
import type { LeakAuditSummary } from "@/types/audit-types";

// The receipt lists the latest items; the category totals below always cover all of them.
const ITEM_LIMIT = 12;

const dayKey = (iso: string) => {
  const d = parseDate(iso);
  return d ? localDateKey(d) : "";
};

/**
 * This month's micro leaks printed as a warung receipt: every leak struck through as
 * "bisa dicoret", the biggest one circled, a doubled total rule, then the warteg count.
 */
export function AuditReceipt({ summary, monthLabel }: { summary: LeakAuditSummary; monthLabel: string }) {
  const items = [...summary.items].sort((a, b) => b.date.localeCompare(a.date));
  const shown = items.slice(0, ITEM_LIMIT);
  const biggest = items.reduce<(typeof items)[number] | null>((top, i) => (!top || i.amount > top.amount ? i : top), null)?.id;
  const clean = summary.leakCount === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,26rem)_1fr] gap-x-12 gap-y-10 items-start">
      <article
        aria-labelledby="nota-title"
        className="relative bg-paper-sheet border-x border-t border-ink/20 mx-auto w-full max-w-md lg:mx-0"
      >
        <div className="px-5 pt-6 pb-4 text-center space-y-1 border-b border-dashed border-ink/40">
          <h2 id="nota-title" className="font-display text-head font-bold text-ink">
            Nota Bocor Halus
          </h2>
          <p className="text-meta text-ink-soft">{monthLabel} · jajan kecil yang diam-diam numpuk</p>
          <Serial id={`nota-${monthLabel}`} date={new Date()} className="block" />
        </div>

        {clean ? (
          <div className="px-5 py-8 text-center space-y-3">
            <Cap tone="aman">Bersih</Cap>
            <p className="text-body text-ink">Belum ada jajan receh yang bocor bulan ini. Pertahankan.</p>
          </div>
        ) : (
          <>
            <ol className="px-5 py-3 divide-y divide-dotted divide-ink/30">
              {shown.map((item) => (
                <li key={item.id} className="py-2.5 grid grid-cols-[1fr_auto] gap-x-3 items-baseline">
                  <div className="min-w-0">
                    <p className="text-body text-ink break-words line-through decoration-habis-ink/70 decoration-2">
                      {item.name}
                    </p>
                    <p className="text-meta text-ink-soft">
                      {[shortDate(dayKey(item.date)), item.categoryLabel].filter(Boolean).join(" · ")}
                      <span className="sr-only"> · {formatSerial(item.id, dayKey(item.date))}</span>
                    </p>
                  </div>
                  <p
                    className={`money text-body font-semibold text-ink whitespace-nowrap ${
                      item.id === biggest ? "px-2 -mx-2 rounded-[50%] border-2 border-habis-ink -rotate-3" : ""
                    }`}
                  >
                    {rupiah(item.amount)}
                    {item.id === biggest && <span className="sr-only"> (paling besar)</span>}
                  </p>
                </li>
              ))}
            </ol>
            {items.length > ITEM_LIMIT && (
              <p className="px-5 pb-2 text-meta text-ink-soft">+{items.length - ITEM_LIMIT} item lain ikut dihitung di total</p>
            )}

            <div className="mx-5 border-t-4 border-double border-ink/70 pt-3 pb-1 flex items-baseline justify-between gap-3">
              <span className="text-body font-bold text-ink">Total bocor · {summary.leakCount} item</span>
              <span className="money text-head font-bold text-ink whitespace-nowrap">{rupiah(summary.totalLeakedAmount)}</span>
            </div>
            <p className="px-5 text-meta text-ink-soft">{summary.percentageOfAllowance}% dari uang saku bulan ini</p>

            <div className="px-5 pt-6 pb-7 text-center">
              <p className="text-body text-ink">setara</p>
              <p className="font-display font-bold text-ink money leading-none">
                <span className="text-numeral">{summary.wartegEquivalence}</span>
              </p>
              <p className="text-body text-ink">porsi warteg komplit</p>
              <p className="mt-1 text-meta text-ink-soft">dihitung Rp 15.000 per porsi</p>
            </div>
          </>
        )}
        {/* Torn edge where the receipt left the printer. */}
        <div aria-hidden="true" className="h-3 -mx-px bg-paper-sheet [clip-path:polygon(0_0,100%_0,100%_40%,96%_100%,92%_40%,88%_100%,84%_40%,80%_100%,76%_40%,72%_100%,68%_40%,64%_100%,60%_40%,56%_100%,52%_40%,48%_100%,44%_40%,40%_100%,36%_40%,32%_100%,28%_40%,24%_100%,20%_40%,16%_100%,12%_40%,8%_100%,4%_40%,0_100%)]" />
      </article>

      {!clean && (
        <div className="space-y-10 min-w-0">
          <section aria-labelledby="pos-title" className="space-y-3">
            <h2 id="pos-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
              Bocornya dari mana
            </h2>
            <ul className="space-y-4">
              {summary.leaksByCategory.map((cat) => (
                <li key={cat.category} className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1">
                  <span className="text-body text-ink">
                    {cat.label} <span className="text-meta text-ink-soft">· {cat.count}x</span>
                  </span>
                  <span className="money text-body font-semibold text-ink">{rupiah(cat.amount)}</span>
                  <span aria-hidden="true" className="col-span-2 h-1.5 bg-habis/80" style={{ width: `${Math.max(2, cat.percentage)}%` }} />
                  <span className="col-span-2 text-meta text-ink-soft">
                    {summary.items.find((i) => i.category === cat.category)?.substitutionTip}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tambal-title" className="space-y-3">
            <h2 id="tambal-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
              Cara nambal bulan depan
            </h2>
            <ol className="space-y-2 list-decimal pl-5 marker:text-ink-soft marker:font-semibold">
              {summary.actionChecklist.map((tip) => (
                <li key={tip} className="text-body text-ink pl-1">
                  {tip}
                </li>
              ))}
            </ol>
            <p className="text-body text-ink-soft">
              Kalau semua dicoret, ada <span className="money font-semibold text-ink">{rupiah(summary.totalLeakedAmount)}</span> yang
              balik ke dompet tiap bulan.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
