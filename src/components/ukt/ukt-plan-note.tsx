"use client";

import React, { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { UktCategory, UktMetrics, UktPlan } from "@/types/ukt-types";
import { rupiah, shortDate } from "@/lib/format";
import { Guilloche } from "@/components/press/guilloche";
import { formatSerial } from "@/components/press/serial";
import { StatusStamp } from "@/components/press/status-stamp";
import { useRolledNumber } from "@/components/press/rolling-numeral";
import { DENOM, type Denom, FIELD_CLASS, LABEL_CLASS, Stamp } from "@/components/press/kampus-press";

interface UktPlanNoteProps {
  plan: UktPlan;
  metrics: UktMetrics;
  onDeposit: (planId: string, amount: number, note?: string) => void;
  onDelete: (planId: string) => void;
}

// Every kind of campus cost is printed in its own denomination color.
export const UKT_DENOM: Record<UktCategory, Denom> = {
  ukt: "blue",
  praktikum: "violet",
  kkn: "teal",
  skripsi: "slate",
  wisuda: "teal",
};

// One line of personality per plan, from its category (plans have no free-text field for it).
export const UKT_PERSONALITY: Record<UktCategory, string> = {
  ukt: "Tamu paling ditakuti tiap awal semester.",
  praktikum: "Jas lab, modul, fotokopi. Kecil-kecil tapi rame.",
  kkn: "Dua bulan di desa, dompet ikut mengabdi.",
  skripsi: "Print revisi ke-7 juga butuh ongkos.",
  wisuda: "Toga, foto studio, makan sekeluarga. Senyumnya mahal.",
};

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000];

const QUICK = "min-h-11 px-3 rounded-full border border-ink/30 text-body font-semibold text-ink hover:bg-ink/5 transition-colors money";

// Each plan gets its own rosette.
const seedOf = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0x0b1);

function deadlineLabel(deadline: string): string {
  const d = new Date(`${deadline}T00:00:00`);
  if (isNaN(d.getTime())) return deadline;
  return d.getFullYear() === new Date().getFullYear() ? shortDate(d) : `${shortDate(d)} ${d.getFullYear()}`;
}

/** A sinking-fund plan as a note whose denomination color fills up toward the target. */
export function UktPlanNote({ plan, metrics, onDeposit, onDelete }: UktPlanNoteProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const denom = DENOM[UKT_DENOM[plan.category] ?? "blue"];
  const saved = useRolledNumber(plan.currentSaved);
  const formId = `ukt-custom-${plan.id}`;

  const handleCustomDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmount.replace(/[^0-9]/g, "")) || 0;
    if (val > 0) {
      onDeposit(plan.id, val, customNote.trim() || "Setoran mandiri");
      setCustomAmount("");
      setCustomNote("");
      setShowCustom(false);
    }
  };

  return (
    <article className="relative flex bg-paper-sheet border border-ink/20" aria-labelledby={`${formId}-name`}>
      {/* The print fills from the bottom as the fund grows: empty paper at 0%, a full color field at Lunas. */}
      <div aria-hidden="true" className="relative w-16 sm:w-24 shrink-0 border-r border-ink/20 overflow-hidden">
        <div
          className={`absolute inset-x-0 bottom-0 ${denom.field} motion-safe:transition-[height] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]`}
          style={{ height: `${Math.min(100, Math.max(0, metrics.progressPercentage))}%` }}
        />
        <Guilloche seed={seedOf(plan.id)} size={140} families={3} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60" />
      </div>

      <div className="flex-1 min-w-0 px-4 sm:px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 id={`${formId}-name`} className="text-body font-bold text-ink break-words">
              {plan.name}
            </h3>
            <p className="text-meta text-ink-soft italic">{UKT_PERSONALITY[plan.category]}</p>
          </div>
          {metrics.isCompleted ? (
            <Stamp label="Lunas" tone="aman" icon={Check} solid />
          ) : metrics.feasibilityStatus === "aman" ? (
            <StatusStamp status="aman" />
          ) : metrics.feasibilityStatus === "moderat" ? (
            <StatusStamp status="mepet" />
          ) : (
            <Stamp label="Berat" tone="habis" />
          )}
        </div>

        <div>
          <p className="font-display font-bold text-ink money">
            <span className="text-head" aria-hidden="true">
              {rupiah(saved)}
            </span>
            <span className="sr-only">Terkumpul {rupiah(plan.currentSaved)}</span>
          </p>
          <p className="text-body text-ink-soft">
            dari <span className="money font-semibold text-ink">{rupiah(plan.targetAmount)}</span> ·{" "}
            <span className="money">{metrics.progressPercentage}%</span>
            {!metrics.isCompleted && (
              <>
                {" "}
                · kurang <span className="money font-semibold text-ink">{rupiah(metrics.remainingAmount)}</span>
              </>
            )}
          </p>
          <p className="text-meta text-ink-soft">
            Tenggat {deadlineLabel(plan.deadline)} · {metrics.daysRemaining} hari lagi
          </p>
        </div>

        {!metrics.isCompleted && (
          <>
            <p className="text-body text-ink">
              Sisihkan <span className="money font-bold">{rupiah(metrics.dailyTarget)}</span>/hari atau{" "}
              <span className="money font-semibold">{rupiah(metrics.weeklyTarget)}</span>/minggu.
            </p>
            <p className="text-meta text-ink-soft max-w-prose">{metrics.advice}</p>

            <div className="space-y-2 border-t border-dashed border-ink/25 pt-3">
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Setor cepat ke ${plan.name}`}>
                {QUICK_AMOUNTS.map((amt) => (
                  <button key={amt} type="button" onClick={() => onDeposit(plan.id, amt, "Setoran cepat")} className={QUICK}>
                    +{amt / 1000}rb
                  </button>
                ))}
                <button
                  type="button"
                  aria-expanded={showCustom}
                  aria-controls={formId}
                  onClick={() => setShowCustom((v) => !v)}
                  className="min-h-11 px-3 text-body font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
                >
                  Nominal lain
                </button>
              </div>

              {showCustom && (
                <form id={formId} onSubmit={handleCustomDeposit} className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`${formId}-amount`} className={LABEL_CLASS}>
                      Nominal (Rp)
                    </label>
                    <input
                      id={`${formId}-amount`}
                      type="number"
                      inputMode="numeric"
                      min="1000"
                      step="1000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="75000"
                      className={`${FIELD_CLASS} money`}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-note`} className={LABEL_CLASS}>
                      Catatan
                    </label>
                    <input
                      id={`${formId}-note`}
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="Sisa jajan minggu ini"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <button
                    type="submit"
                    className="col-span-2 min-h-11 rounded-full border-2 border-ink text-ink text-body font-semibold hover:bg-ink/5 transition-colors"
                  >
                    Setor ke {plan.name}
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-ink/15 pt-1">
          <span className="money text-meta tracking-[0.12em] text-ink-soft">{formatSerial(plan.id, plan.deadline)}</span>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Hapus rencana "${plan.name}"?`)) onDelete(plan.id);
            }}
            aria-label={`Hapus rencana ${plan.name}`}
            className="-mr-2 w-11 h-11 rounded-full flex items-center justify-center text-ink-soft hover:text-habis-ink hover:bg-ink/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
