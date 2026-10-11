"use client";

import React from "react";
import { Check } from "lucide-react";
import { RecurringBill } from "@/types/bill-types";
import { billSchedule, type BillState } from "./bill-schedule";

interface BillCalendarMatrixProps {
  bills: RecurringBill[];
  today: Date;
}

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Same forms as the schedule leaves: filled = telat, doubled = mepet, ticked = lunas (struck means dihapus only).
const DAY: Record<BillState, string> = {
  telat: "bg-habis-ink text-paper-sheet font-bold",
  "hari-ini": "bg-ink text-paper-sheet font-bold",
  mepet: "border-[3px] border-double border-mepet-ink text-ink font-bold",
  nanti: "border border-ink/50 text-ink font-semibold",
  lunas: "gap-0.5 text-aman-ink font-semibold",
};

/** This month printed as a wall calendar, Monday first, with every due day marked by its state. */
export function BillCalendarMatrix({ bills, today }: BillCalendarMatrixProps) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;

  // The most urgent state wins when several bills share a day (schedule order is urgency order).
  const byDay = new Map<number, { state: BillState; names: string[] }>();
  for (const row of billSchedule(bills, today)) {
    const day = byDay.get(row.dueDay);
    if (day) day.names.push(row.bill.name);
    else byDay.set(row.dueDay, { state: row.state, names: [row.bill.name] });
  }

  const cells = [...Array<null>(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <section aria-labelledby="kalender-title" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/20 pb-2">
        <h2 id="kalender-title" className="font-display text-head font-bold text-ink">
          {MONTHS[month]} {year}
        </h2>
        <p className="text-meta text-ink-soft">Hari ini tanggal {today.getDate()}</p>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-meta text-ink-soft py-1">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`lead-${i}`} aria-hidden="true" />;
          const mark = byDay.get(day);
          const isToday = day === today.getDate();
          return (
            <span
              key={day}
              title={mark ? `Tanggal ${day}: ${mark.names.join(", ")}${mark.state === "lunas" ? " (lunas)" : ""}` : undefined}
              className={`money text-meta h-9 flex items-center justify-center ${
                mark ? DAY[mark.state] : "text-ink"
              } ${isToday && (!mark || mark.state !== "hari-ini") ? "outline outline-2 outline-ink -outline-offset-2" : ""}`}
            >
              {day}
              {mark?.state === "lunas" && <Check className="w-3 h-3 shrink-0" strokeWidth={3} aria-hidden="true" />}
              {mark && <span className="sr-only">: {mark.names.join(", ")}{mark.state === "lunas" && ", lunas"}</span>}
            </span>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-meta text-ink-soft">
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-3 h-3 bg-habis-ink" /> Telat
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-3 h-3 border-[3px] border-double border-mepet-ink" /> Mepet
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden="true" className="w-3 h-3 border border-ink/50" /> Nanti
        </li>
        <li className="flex items-center gap-1.5">
          <Check aria-hidden="true" className="w-3 h-3 text-aman-ink" strokeWidth={3} /> Lunas
        </li>
      </ul>
    </section>
  );
}
