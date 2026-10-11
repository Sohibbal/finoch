"use client";

import React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { BillCategory, RecurringBill } from "@/types/bill-types";
import { getEffectiveDueDay } from "@/lib/storage/bill-storage";
import { rupiah } from "@/lib/format";
import { Cap } from "@/components/press/uang-denom";

export const BILL_CATEGORY_LABEL: Record<BillCategory, string> = {
  kos: "Kamar kos",
  utilities: "WiFi & listrik",
  subscription: "Langganan",
  education: "Kuliah & buku",
  other: "Lainnya",
};

export type BillState = "telat" | "hari-ini" | "mepet" | "nanti" | "lunas";

export interface ScheduledBill {
  bill: RecurringBill;
  /** This month's due day, clamped to the month length (31 in February is the 28th/29th). */
  dueDay: number;
  /** Days from today to the due day; negative once it has passed. */
  daysLeft: number;
  state: BillState;
}

const ORDER: Record<BillState, number> = { telat: 0, "hari-ini": 1, mepet: 2, nanti: 3, lunas: 4 };

/** This month's bills in the order they need attention: overdue first (oldest first), paid last. */
export function billSchedule(bills: RecurringBill[], today: Date): ScheduledBill[] {
  return bills
    .map((bill) => {
      const dueDay = getEffectiveDueDay(bill, today);
      const daysLeft = dueDay - today.getDate();
      const state: BillState = bill.isPaidThisMonth
        ? "lunas"
        : daysLeft < 0
          ? "telat"
          : daysLeft === 0
            ? "hari-ini"
            : daysLeft <= (bill.reminderDaysBefore || 3)
              ? "mepet"
              : "nanti";
      return { bill, dueDay, daysLeft, state };
    })
    .sort((a, b) => ORDER[a.state] - ORDER[b.state] || a.dueDay - b.dueDay);
}

export function billDueText({ state, daysLeft }: ScheduledBill): string {
  if (state === "lunas") return "Sudah dibayar bulan ini";
  if (state === "telat") return `Telat ${-daysLeft} hari`;
  if (state === "hari-ini") return "Jatuh tempo hari ini";
  return `${daysLeft} hari lagi`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// The date block is the row's calendar leaf: filled when late, doubled when due soon.
const LEAF: Record<BillState, string> = {
  telat: "bg-habis-ink text-paper-sheet border-2 border-habis-ink",
  "hari-ini": "bg-ink text-paper-sheet border-2 border-ink",
  mepet: "border-[4px] border-double border-mepet-ink text-ink",
  nanti: "border border-ink/30 text-ink",
  lunas: "border border-ink/20 text-ink-soft",
};

const ROW_ACTION =
  "inline-flex items-center justify-center w-11 h-11 rounded-full text-ink hover:bg-ink/5 transition-colors";

interface BillScheduleRowProps {
  row: ScheduledBill;
  month: number;
  /** Stamp LUNAS with a thump: this bill was just paid. */
  justPaid?: boolean;
  onMarkPaid: (id: string) => void;
  onEdit: (bill: RecurringBill) => void;
  onDelete: (id: string) => void;
}

/** One bill as a printed schedule line: calendar leaf, name, amount, then Bayar or the LUNAS stamp. */
export function BillScheduleRow({ row, month, justPaid, onMarkPaid, onEdit, onDelete }: BillScheduleRowProps) {
  const { bill, dueDay, state } = row;
  const paid = state === "lunas";
  return (
    <li className="flex items-start gap-3 sm:gap-4 py-4 border-b border-ink/15">
      <div className={`w-14 shrink-0 text-center py-1 ${LEAF[state]}`}>
        <p className="font-display text-head font-bold money leading-none pt-1">{dueDay}</p>
        <p className="text-meta">{MONTHS[month]}</p>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h3 className={`text-body font-semibold break-words ${paid ? "text-ink-soft" : "text-ink"}`}>{bill.name}</h3>
          <p className={`money text-body font-bold whitespace-nowrap ${paid ? "text-ink-soft" : "text-ink"}`}>
            {rupiah(bill.amount)}
            <span className="font-normal text-meta text-ink-soft">{bill.frequency === "weekly" ? " /minggu" : " /bulan"}</span>
          </p>
        </div>
        <p className="text-meta text-ink-soft break-words">
          {[BILL_CATEGORY_LABEL[bill.category] ?? "Lainnya", bill.note].filter(Boolean).join(" · ")}
        </p>
        <p className={`text-meta font-semibold ${state === "telat" ? "text-habis-ink" : state === "mepet" ? "text-mepet-ink" : "text-ink"}`}>
          {billDueText(row)}
        </p>

        <div className="flex items-center gap-1 pt-1">
          {paid ? (
            <Cap tone="aman" tilt={-8} press={justPaid} className="mr-auto">
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
              Lunas
            </Cap>
          ) : (
            <button
              type="button"
              onClick={() => onMarkPaid(bill.id)}
              className="mr-auto inline-flex items-center gap-2 min-h-11 px-4 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet text-body font-semibold transition-colors"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              Tandai lunas
            </button>
          )}
          <button type="button" onClick={() => onEdit(bill)} className={ROW_ACTION} aria-label={`Ubah ${bill.name}`}>
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onDelete(bill.id)} className={ROW_ACTION} aria-label={`Hapus ${bill.name}`}>
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
}
