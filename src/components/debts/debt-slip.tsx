"use client";

import React from "react";
import { CalendarX, Check, MessageCircle, RotateCcw, Trash2 } from "lucide-react";
import { DebtItem } from "@/types/debt-types";
import { generateWhatsAppDebtReminder } from "@/lib/financial/debt-engine";
import { localDateKey } from "@/lib/date";
import { rupiah, shortDate } from "@/lib/format";
import { Cap, DenomSheet, seedOf } from "@/components/press/denom";
import { formatSerial } from "@/components/press/serial";
import { StateLabel } from "@/components/press/kampus-press";

/** wa.me link for a reminder; Indonesian 08xx numbers become 628xx. */
export function whatsAppUrl(debt: DebtItem): string {
  const text = encodeURIComponent(generateWhatsAppDebtReminder(debt));
  const phone = debt.phone ? debt.phone.replace(/[^0-9]/g, "") : "";
  if (!phone) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${phone.startsWith("0") ? "62" + phone.slice(1) : phone}?text=${text}`;
}

// Phones get the share sheet (pick any chat); elsewhere WhatsApp opens directly.
function remind(debt: DebtItem) {
  const url = whatsAppUrl(debt);
  const touch = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  if (touch && typeof navigator !== "undefined" && navigator.share) {
    navigator.share({ title: "Pengingat Kasbon", text: generateWhatsAppDebtReminder(debt) }).catch(() => window.open(url, "_blank"));
  } else {
    window.open(url, "_blank");
  }
}

/** Unpaid and past the promised day (local calendar day). */
export function isPastPromise(debt: Pick<DebtItem, "status" | "dueDate">, todayKey = localDateKey(new Date())): boolean {
  return debt.status === "unpaid" && !!debt.dueDate && debt.dueDate.slice(0, 10) < todayKey;
}

/** Unpaid slips first (soonest promise first, undated last), settled ones at the back. */
export function sortSlips(debts: DebtItem[]): DebtItem[] {
  const key = (d: DebtItem) => (d.status === "paid" ? "2" : d.dueDate ? `0${d.dueDate}` : "1");
  return [...debts].sort((a, b) => key(a).localeCompare(key(b)) || b.createdAt.localeCompare(a.createdAt));
}

interface DebtSlipProps {
  debt: DebtItem;
  justPaid?: boolean;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

const SLIP_ACTION =
  "inline-flex items-center justify-center gap-2 min-h-11 border border-current text-body font-semibold hover:bg-paper-sheet/15 transition-colors";

/**
 * A kasbon as an IOU slip. Piutang (money coming back to you) prints green, utang ochre;
 * a settled slip goes back to plain paper with a LUNAS stamp.
 */
export function DebtSlip({ debt, justPaid, onTogglePaid, onDelete }: DebtSlipProps) {
  const receivable = debt.type === "receivable";
  const paid = debt.status === "paid";
  const late = isPastPromise(debt);
  const titleId = `kasbon-${debt.id}`;

  const body = (
    <div className="p-5 space-y-3">
      {/* Perforation: the slip was torn off a kasbon book. */}
      <span aria-hidden="true" className="absolute left-3 right-3 top-2 border-t-2 border-dotted border-current opacity-60" />
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="min-w-0">
          <h3 id={titleId} className="font-display text-head font-bold break-words">
            {receivable ? `${debt.personName} utang ke kamu` : `Kamu utang ke ${debt.personName}`}
          </h3>
          <p className="text-meta">{receivable ? "Piutang · uang kembali ke kamu" : "Utang · kamu yang bayar"}</p>
        </div>
        {paid ? (
          <Cap tone="aman" tilt={-10} press={justPaid} className="text-body">
            <Check className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            Lunas
          </Cap>
        ) : late ? (
          <StateLabel icon={CalendarX}>Lewat janji</StateLabel>
        ) : null}
      </div>

      <p className="font-display font-bold money flex items-baseline gap-1.5">
        <span className="text-head">Rp</span>
        <span className="text-[2.75rem] leading-none tracking-[-0.02em]">{Math.round(debt.amount).toLocaleString("id-ID")}</span>
      </p>

      <p className="text-body break-words">{debt.description || "Tanpa keterangan"}</p>
      <p className="text-meta break-words">
        {[
          debt.dueDate && `Janji bayar ${shortDate(debt.dueDate.slice(0, 10))}`,
          paid && debt.settledAt && `lunas ${shortDate(new Date(debt.settledAt))}`,
          debt.phone,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <p className="text-meta money tracking-[0.1em]">{formatSerial(debt.id, new Date(debt.createdAt))}</p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {!paid ? (
          <>
            <button type="button" onClick={() => remind(debt)} className={`${SLIP_ACTION} flex-1 px-3 whitespace-nowrap`}>
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Ingatkan WA
            </button>
            <button type="button" onClick={() => onTogglePaid(debt.id)} className={`${SLIP_ACTION} flex-1 px-3 whitespace-nowrap`}>
              <Check className="w-4 h-4" aria-hidden="true" />
              Tandai lunas
            </button>
          </>
        ) : (
          <button type="button" onClick={() => onTogglePaid(debt.id)} className={`${SLIP_ACTION} flex-1 px-3 whitespace-nowrap`}>
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Batal lunas
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (confirm(`Hapus catatan kasbon "${debt.personName}"?`)) onDelete(debt.id);
          }}
          className={`${SLIP_ACTION} w-11`}
          aria-label={`Hapus kasbon ${debt.personName}`}
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  if (paid) {
    return (
      <li aria-labelledby={titleId} className="relative list-none bg-paper-sheet text-ink border border-ink/20">
        {body}
      </li>
    );
  }
  return (
    <DenomSheet as="li" denom={receivable ? "teal" : "slate"} seed={seedOf(debt.id)} aria-labelledby={titleId} className="list-none">
      {body}
    </DenomSheet>
  );
}
