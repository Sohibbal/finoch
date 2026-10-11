"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { DailyCashflowPoint, DayStatus, StreakSummary } from "@/types/streak-types";
import { rupiah, shortDate } from "@/lib/format";
import { printDate } from "@/components/press/print-date";
import { Note } from "@/components/press/note";
import { Serial } from "@/components/press/serial";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

/**
 * Grid cells for a month of points: blanks before the 1st so each day sits under its weekday
 * (Minggu first), then one cell per point.
 */
export function punchCardCells(points: DailyCashflowPoint[]): (DailyCashflowPoint | null)[] {
  if (points.length === 0) return [];
  const first = new Date(`${points[0].date}T00:00:00`);
  const lead = isNaN(first.getTime()) ? 0 : first.getDay();
  return [...Array<null>(lead).fill(null), ...points];
}

/** "Oktober 2026" from the month's first point. */
export function punchCardMonth(points: DailyCashflowPoint[]): string {
  const d = points.length ? new Date(`${points[0].date}T00:00:00`) : new Date();
  return isNaN(d.getTime()) ? "" : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export const DAY_STATUS_LABEL: Record<DayStatus, string> = {
  no_spend: "Puasa jajan",
  disciplined: "Di bawah batas",
  overspent: "Lewat batas",
};

const compact = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}rb` : String(n));

/** The day's mark: a stamped check, a double ring or a struck X; future days are only dotted. */
function Punch({ pt }: { pt: DailyCashflowPoint }) {
  if (pt.isFuture) return <span className="w-7 h-7 rounded-full border border-dotted border-ink/30" />;
  if (pt.status === "no_spend")
    return (
      <span className="w-7 h-7 rounded-full bg-aman flex items-center justify-center -rotate-6">
        <Check className="w-4 h-4 text-navy-900" strokeWidth={3} aria-hidden="true" />
      </span>
    );
  if (pt.status === "disciplined") return <span className="w-7 h-7 rounded-full border-[3px] border-double border-mepet-ink rotate-3" />;
  return (
    <span className="w-7 h-7 rounded-full border-2 border-dashed border-habis-ink flex items-center justify-center rotate-6">
      <X className="w-4 h-4 text-habis-ink" strokeWidth={3} aria-hidden="true" />
    </span>
  );
}

interface StreakPunchCardProps {
  summary: StreakSummary;
}

/** This month as a punch card: one stamped hole per day, tap a day to read its spending. */
export function StreakPunchCard({ summary }: StreakPunchCardProps) {
  const points = summary.monthlyPoints;
  const [selectedDate, setSelectedDate] = useState<string | null>(() => points.find((p) => p.isToday)?.date ?? null);
  const selected = points.find((p) => p.date === selectedDate) ?? null;
  const cells = punchCardCells(points);
  const month = punchCardMonth(points);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-6 items-start">
      <Note
        as="section"
        aria-labelledby="punch-title"
        serial={points[0] ? <Serial id={`streak-${points[0].date}`} date={points[0].date} /> : undefined}
        className="lg:col-span-2"
      >
        <div className="px-4 sm:px-8 pt-6 pb-4 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="punch-title" className="font-display text-head font-bold text-ink">
              Kartu hemat {month}
            </h2>
            <p className="text-meta text-ink-soft">Ketuk tanggal untuk lihat rinciannya</p>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {WEEKDAYS.map((d) => (
              <div key={d} aria-hidden="true" className="text-center text-meta font-semibold text-ink-soft pb-1">
                {d}
              </div>
            ))}
            {cells.map((pt, i) =>
              pt ? (
                <button
                  key={pt.date}
                  type="button"
                  disabled={pt.isFuture}
                  aria-pressed={pt.date === selectedDate}
                  aria-label={`${shortDate(pt.date)}${pt.isToday ? ", hari ini" : ""}${
                    pt.isFuture ? "" : `: ${DAY_STATUS_LABEL[pt.status]}, ${rupiah(pt.totalSpent)}`
                  }`}
                  onClick={() => setSelectedDate(pt.date)}
                  className={`relative min-h-14 sm:min-h-20 flex flex-col items-center justify-start gap-1 pt-1 border transition-colors disabled:cursor-default ${
                    pt.date === selectedDate ? "border-ink bg-ink/5" : "border-ink/15 hover:border-ink/40"
                  } ${pt.isToday ? "outline outline-2 outline-offset-1 outline-ink" : ""}`}
                >
                  <span className={`money text-meta ${pt.isFuture ? "text-ink-soft" : "text-ink font-semibold"}`}>{pt.dayNumber}</span>
                  <Punch pt={pt} />
                  {!pt.isFuture && <span className="hidden sm:block money text-meta text-ink-soft">{compact(pt.totalSpent)}</span>}
                </button>
              ) : (
                <div key={`blank-${i}`} aria-hidden="true" />
              )
            )}
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-meta text-ink-soft pt-1">
            {(["no_spend", "disciplined", "overspent"] as const).map((status) => (
              <li key={status} className="flex items-center gap-2">
                <span className="scale-75 -my-1 inline-flex">
                  <Punch pt={{ ...points[0], isFuture: false, status }} />
                </span>
                {DAY_STATUS_LABEL[status]}
              </li>
            ))}
          </ul>
        </div>
      </Note>

      <section aria-labelledby="punch-day-title" aria-live="polite" className="space-y-3">
        <h2 id="punch-day-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
          {selected ? printDate(selected.date) : "Pilih tanggal"}
          {selected?.isToday && <span className="font-sans text-body font-normal text-ink-soft"> · hari ini</span>}
        </h2>
        {selected ? (
          <>
            <p className="text-body font-semibold text-ink">{DAY_STATUS_LABEL[selected.status]}</p>
            <dl className="space-y-1.5 text-body">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Total keluar</dt>
                <dd className="money font-bold text-ink">{rupiah(selected.totalSpent)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Jajan keinginan</dt>
                <dd className="money text-ink">{rupiah(selected.wantsSpent)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-soft">Catatan</dt>
                <dd className="money text-ink">{selected.transactionsCount} transaksi</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="text-body text-ink-soft">Ketuk satu tanggal di kartu untuk lihat pengeluaran hari itu.</p>
        )}

        <details className="group border-t border-ink/15 pt-1">
          <summary className="flex items-center min-h-11 cursor-pointer text-body font-semibold text-ink underline underline-offset-4 decoration-ink/40">
            Rincian per hari · {summary.totalDaysEvaluated} hari
          </summary>
          <ol className="divide-y divide-dashed divide-ink/20">
            {points
              .filter((pt) => !pt.isFuture)
              .reverse()
              .map((pt) => (
                <li key={pt.date} className="flex items-baseline justify-between gap-3 py-2 text-body">
                  <span className="min-w-0">
                    <span className="text-ink">{printDate(pt.date)}</span>
                    <span className="block text-meta text-ink-soft">
                      {DAY_STATUS_LABEL[pt.status]} · {pt.transactionsCount} transaksi
                    </span>
                  </span>
                  <span className="money text-ink whitespace-nowrap">{rupiah(pt.totalSpent)}</span>
                </li>
              ))}
          </ol>
        </details>
      </section>
    </div>
  );
}
