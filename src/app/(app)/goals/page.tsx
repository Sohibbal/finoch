"use client";

import React, { useEffect, useState } from "react";
import { Check, Clock, Plus, Target, TrendingUp, Trash2, X, type LucideIcon } from "lucide-react";
import { calculateGoalProjection } from "@/lib/financial/financial-engine";
import { FinancialGoal } from "@/types/financial-types";
import { EMPTY_ACTION_CLASS, EmptyState, PageHeader, ProfileGate } from "@/components/layout/page-header";
import { useFinancialProfile } from "@/hooks/use-financial-profile";
import { addGoal, deleteGoal, getGoals } from "@/lib/storage/goal-storage";
import { getBills } from "@/lib/storage/bill-storage";
import { monthLedger } from "@/lib/financial/month-ledger";
import type { RecurringBill } from "@/types/bill-types";
import { localDateKey, localDateKeyFromNow, parseDate } from "@/lib/date";
import { Note } from "@/components/press/note";
import { Serial } from "@/components/press/serial";
import { DENOMS, type Denom } from "@/components/press/denom";
import { StateLabel } from "@/components/press/kampus-press";
import { rupiah } from "@/lib/format";
import { printDate } from "@/components/press/print-date";

const DAY_MS = 86400000;

/** Whole months left until the deadline (at least 1, so an overdue goal still gets a status). */
function monthsUntil(targetDate: string | Date): number {
  const ms = new Date(targetDate).getTime() - Date.now();
  return Number.isFinite(ms) ? Math.max(1, Math.ceil(ms / (30 * DAY_MS))) : 1;
}

/** Each kind of goal is printed in its own note colour, with a one-line personality in anak-kost voice. */
const GOAL_KIND: Record<string, { denom: Denom; label: string; personality: string }> = {
  emergency_fund: { denom: "teal", label: "Dana darurat", personality: "penjaga tanggal tua, jangan dicolek buat jajan" },
  gadget: { denom: "blue", label: "Gadget", personality: "sabar dulu, HP lama masih bisa buat absen" },
  travel: { denom: "violet", label: "Liburan", personality: "healing-nya nanti, nabungnya sekarang" },
  vehicle: { denom: "slate", label: "Kendaraan", personality: "biar nggak nebeng teman kos terus" },
  education: { denom: "teal", label: "Pendidikan", personality: "satu-satunya tabungan yang nggak bisa dicuri maling kos" },
  other: { denom: "slate", label: "Impian", personality: "pelan-pelan asal kelakon" },
};

// Projection words, not stamps: stamps are kept for money status (Aman · Mepet · Habis).
const STATUS: Record<string, { label: string; icon: LucideIcon }> = {
  on_track: { label: "Tepat sasaran", icon: Target },
  at_risk: { label: "Perlu dipercepat", icon: TrendingUp },
  behind_target: { label: "Ketinggalan", icon: Clock },
  achieved: { label: "Tercapai", icon: Check },
};

const FIELD =
  "w-full min-h-11 px-3 bg-paper border border-ink/30 text-body text-ink placeholder:text-ink-soft focus-visible:outline-offset-0";

/** Local YYYY-MM-DD of a stored deadline (a date key, an ISO string or a Date). */
function dueKey(value: string | Date): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = value instanceof Date ? value : parseDate(value);
  return d ? localDateKey(d) : "";
}

const emptyGoalForm = () => ({
  name: "",
  targetAmount: 5000000,
  currentAmount: 0,
  targetDate: localDateKeyFromNow(365),
  category: "gadget",
});

export default function GoalsPage() {
  const profile = useFinancialProfile();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  useEffect(() => {
    setGoals(getGoals());
    setBills(getBills());
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(emptyGoalForm);

  // What is left of the allowance after fixed costs, from the same month ledger as every other page;
  // the status of every goal is measured against it.
  const monthlySavingCapacity = monthLedger({
    monthlyIncome: profile.monthlyIncome ?? 0,
    profileFixedCosts: profile.fixedExpenses ?? 0,
    bills,
    transactions: [],
  }).spendable;

  const projectStatus = (goal: Pick<FinancialGoal, "targetAmount" | "currentAmount" | "targetDate">) =>
    calculateGoalProjection({
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      monthlySaving: monthlySavingCapacity,
      targetMonths: monthsUntil(goal.targetDate),
    }).status;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name.trim() || !(newGoal.targetAmount > 0)) return;

    addGoal({ ...newGoal, name: newGoal.name.trim(), status: projectStatus(newGoal) });
    setGoals(getGoals());
    setIsModalOpen(false);
    setNewGoal(emptyGoalForm());
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    setGoals(getGoals());
  };

  return (
    <>
      <PageHeader
        title="Target Finansial"
        subtitle="Dana darurat, laptop, liburan"
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet dark:text-paper text-body font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Tambah<span className="sr-only"> target</span>
          </button>
        }
      />

      <ProfileGate profile={profile}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-10 space-y-6 w-full">
          <p className="text-body text-ink-soft max-w-prose">
            Status dihitung dari kapasitas nabungmu:{" "}
            <span className="money font-semibold text-ink">{rupiah(Math.max(0, monthlySavingCapacity))}</span>/bulan (uang saku
            dikurangi pengeluaran tetap).
          </p>

          {goals.length === 0 && (
            <EmptyState
              icon={Target}
              title="Belum ada target tabungan"
              action={
                <button type="button" onClick={() => setIsModalOpen(true)} className={EMPTY_ACTION_CLASS}>
                  Buat Target Pertama
                </button>
              }
            >
              Mulai dari satu tujuan: dana darurat, laptop kuliah, atau biaya wisuda. Finoch hitung apakah tenggatnya realistis.
            </EmptyState>
          )}

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((g, idx) => {
              const progress = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
              const remaining = Math.max(0, g.targetAmount - g.currentAmount);
              const kind = GOAL_KIND[g.category] ?? GOAL_KIND.other;
              const denom = DENOMS[kind.denom];
              const status = STATUS[projectStatus(g)] ?? STATUS.achieved;
              const due = dueKey(g.targetDate);

              return (
                <li key={g.id ?? idx}>
                  <Note
                    as="article"
                    aria-label={g.name}
                    serial={<Serial id={g.id ?? g.name} date={due || new Date()} />}
                    className="overflow-hidden"
                  >
                    {/* The note's colour band fills left to right with progress; text never sits on the fill. */}
                    <div aria-hidden="true" className={`h-4 ${denom.soft}`}>
                      <div
                        className={`h-full ${denom.field} motion-safe:transition-[width] motion-safe:duration-700`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div>
                      <div className="px-5 sm:px-8 pt-5 pb-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="font-display text-head font-bold text-ink break-words">{g.name}</h2>
                            <p className="text-meta text-ink">
                              <span className="font-semibold">{kind.label}</span> · {kind.personality}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => g.id && handleDeleteGoal(g.id)}
                            className="-mr-2 -mt-1 w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink-soft hover:text-habis-ink hover:bg-ink/5"
                            aria-label={`Hapus target ${g.name}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-ink money flex flex-wrap items-baseline gap-x-3">
                          <span className="font-display font-bold text-[clamp(2.25rem,10vw,3rem)] leading-none tracking-[-0.02em]">
                            {progress}%
                          </span>
                          <span className="text-body font-semibold">
                            {rupiah(g.currentAmount)} dari {rupiah(g.targetAmount)}
                          </span>
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                          <p className="text-body text-ink">
                            Kurang <span className="money font-semibold">{rupiah(remaining)}</span>
                            {due && <> · tenggat {printDate(due)}</>}
                          </p>
                          <StateLabel icon={status.icon} className="text-ink">
                            {status.label}
                          </StateLabel>
                        </div>
                      </div>
                    </div>
                  </Note>
                </li>
              );
            })}
          </ul>
        </main>
      </ProfileGate>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="goal-form-title"
        >
          <div className="bg-paper-sheet max-w-md w-full px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] border border-ink/20 space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink/20 pb-3">
              <h2 id="goal-form-title" className="font-display text-head font-bold text-ink">
                Target baru
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup"
                className="-mr-2 w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-ink/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <label className="block space-y-1">
                <span className="block text-meta text-ink-soft">Nama target</span>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Misal: Beli Laptop Baru"
                  className={FIELD}
                />
              </label>

              <fieldset>
                <legend className="text-meta text-ink-soft mb-1">Jenis</legend>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(GOAL_KIND).map(([id, k]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={newGoal.category === id}
                      onClick={() => setNewGoal({ ...newGoal, category: id })}
                      className={`inline-flex items-center gap-2 min-h-11 px-3 border text-body ${
                        newGoal.category === id ? "border-ink bg-ink text-paper-sheet dark:text-paper" : "border-ink/30 text-ink hover:bg-ink/5"
                      }`}
                    >
                      <span aria-hidden="true" className={`w-3 h-3 ${DENOMS[k.denom].field}`} />
                      {k.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block space-y-1">
                <span className="block text-meta text-ink-soft">Target nominal (Rp)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                  className={`${FIELD} money`}
                />
              </label>

              <label className="block space-y-1">
                <span className="block text-meta text-ink-soft">Sudah terkumpul (Rp)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                  className={`${FIELD} money`}
                />
              </label>

              <label className="block space-y-1">
                <span className="block text-meta text-ink-soft">Tenggat</span>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className={FIELD}
                />
              </label>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 min-h-11 rounded-full border border-ink/30 text-ink text-body font-semibold hover:bg-ink/5"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-11 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet dark:text-paper text-body font-semibold"
                >
                  Simpan target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
