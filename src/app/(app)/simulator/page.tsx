"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ScenarioSlider } from "@/components/simulator/scenario-slider";
import { SimulationResultCard } from "@/components/simulator/simulation-result-card";
import { simulateWhatIfScenario } from "@/lib/financial/financial-engine";
import { dailyJatah, mergeExpenses, toTransaction } from "@/components/dashboard/dashboard-data";
import { PageHeader, ProfileGate } from "@/components/layout/page-header";
import { useFinancialProfile } from "@/hooks/use-financial-profile";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { isDemoMode } from "@/lib/storage/local-storage";
import { getBills } from "@/lib/storage/bill-storage";
import { fixedCostScope } from "@/lib/financial/month-ledger";
import { localDateKey } from "@/lib/date";
import { rupiah } from "@/lib/format";
import type { TransactionCandidate } from "@/types/financial-types";
import type { RecurringBill } from "@/types/bill-types";

type Preset = "default" | "cut_coffee" | "internship" | "delayed_allowance" | "rent_hike";

const PRESETS: Array<{ id: Exclude<Preset, "default">; title: string; note: string; cuts: number; add: number }> = [
  { id: "cut_coffee", title: "Pangkas Kopi & Jajanan Sore", note: "Hemat Rp200.000/bln", cuts: 200000, add: 0 },
  { id: "internship", title: "Dapat Job Magang / Freelance", note: "+Rp600.000/bln", cuts: 0, add: 600000 },
  { id: "delayed_allowance", title: "Uang Kiriman Ortu Terlambat", note: "Survive 1 Minggu (-Rp500rb)", cuts: 0, add: -500000 },
  { id: "rent_hike", title: "Sewa Kos Naik / Iuran WiFi", note: "+Rp150.000/bln", cuts: -150000, add: 0 },
];

export default function SimulatorPage() {
  // Baseline: uang saku from the profile, fixed costs from the month ledger (Tagihan, else the profile).
  const profile = useFinancialProfile();
  const baselineMonthlyIncome = profile.monthlyIncome ?? 0;

  // Interactive scenario variables
  const [expenseCuts, setExpenseCuts] = useState(200000); // hemat jajan kopi/sore 200rb
  const [incomeAddition, setIncomeAddition] = useState(0); // job magang/freelance
  const [goalAmount, setGoalAmount] = useState(6000000); // Laptop Kuliah / Dana Darurat Kos

  // This month's expenses and bills, the same rows the dashboard reads, so both notes print the dashboard's jatah.
  const [transactions, setTransactions] = useState<TransactionCandidate[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  useEffect(() => {
    let active = true;
    setBills(getBills());
    Promise.all([
      // Demo mode shows only sample data: the server holds the user's real expenses.
      isDemoMode()
        ? []
        : fetch("/api/expenses")
            .then(async (res) => (res.ok ? (await res.json()).expenses : []))
            .catch(() => []),
      expenseStorage.getExpenses().catch(() => []),
    ]).then(([server, local]) => {
      if (!active) return;
      setTransactions(mergeExpenses(Array.isArray(server) ? server : [], local).map((e) => toTransaction(e, "manual")));
    });
    return () => {
      active = false;
    };
  }, []);

  const applyPreset = (preset: Preset) => {
    const p = PRESETS.find((x) => x.id === preset);
    setExpenseCuts(p?.cuts ?? 0);
    setIncomeAddition(p?.add ?? 0);
  };

  const today = useMemo(() => localDateKey(new Date()), []);
  const before = dailyJatah({
    monthlyIncome: baselineMonthlyIncome,
    monthlyFixedExpenses: profile.fixedExpenses ?? 0,
    bills,
    transactions,
  });
  const baselineMonthlyExpense = before.month.fixedCosts;
  const baselineNetSavings = before.month.spendable;
  const after = dailyJatah({
    monthlyIncome: baselineMonthlyIncome + incomeAddition,
    monthlyFixedExpenses: Math.max(0, baselineMonthlyExpense - expenseCuts),
    transactions,
  });

  // Run deterministic calculation
  const simulation = simulateWhatIfScenario({
    currentMonthlyIncome: baselineMonthlyIncome,
    currentMonthlyExpense: baselineMonthlyExpense,
    expenseCuts,
    incomeAddition,
    remainingGoalAmount: goalAmount,
  });

  const baselineMonthsToGoal = baselineNetSavings > 0 ? Math.ceil(goalAmount / baselineNetSavings) : Infinity;

  return (
    <>
      <PageHeader
        title="Simulator Kas"
        subtitle="Coba skenario, lihat jatah harianmu berubah"
        actions={
          <button
            type="button"
            onClick={() => applyPreset("default")}
            aria-label="Reset skenario"
            className="w-11 h-11 rounded-full border border-ink/30 text-ink hover:bg-ink/5 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        }
      />

      <ProfileGate profile={profile}>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-10 space-y-10 w-full">
          <SimulationResultCard
            result={simulation}
            before={before}
            after={after}
            baselineNetSavings={baselineNetSavings}
            baselineMonthsToGoal={baselineMonthsToGoal}
            today={today}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            <section aria-labelledby="preset-title" className="space-y-3">
              <h2 id="preset-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
                Skenario cepat
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESETS.map((p) => {
                  const active = expenseCuts === p.cuts && incomeAddition === p.add;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => applyPreset(p.id)}
                        className={`relative w-full h-full min-h-11 text-left pl-5 pr-3 py-3 border transition-colors ${
                          active ? "bg-ink text-paper-sheet dark:text-paper border-ink" : "bg-paper-sheet text-ink border-ink/25 hover:border-ink/60"
                        }`}
                      >
                        {/* Perforation: each scenario is a ticket torn off the pad. */}
                        <span aria-hidden="true" className="absolute left-2 top-2 bottom-2 border-l border-dotted border-current opacity-50" />
                        <span className="block text-body font-semibold">{p.title}</span>
                        <span className="block text-meta money opacity-80">{p.note}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="text-meta text-ink-soft">
                Titik awal: uang saku {rupiah(baselineMonthlyIncome)}/bulan (dari profil), pengeluaran tetap{" "}
                {rupiah(baselineMonthlyExpense)}/bulan ({fixedCostScope(before.month.fixedCostSource)}).
              </p>
            </section>

            <section aria-labelledby="knob-title">
              <h2 id="knob-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
                Atur sendiri
              </h2>
              <ScenarioSlider
                label="Hemat per bulan"
                description="Kurangi jajan kopi atau masak di kos. Minus berarti pengeluaran naik."
                value={expenseCuts}
                min={-500000}
                max={1000000}
                step={25000}
                onChange={setExpenseCuts}
              />
              <ScenarioSlider
                label="Tambahan pemasukan per bulan"
                description="Magang atau freelance. Minus kalau kiriman ortu tersendat."
                value={incomeAddition}
                min={-1000000}
                max={2000000}
                step={50000}
                onChange={setIncomeAddition}
              />
              <ScenarioSlider
                label="Target tabungan"
                description="Laptop kuliah, dana darurat kos, atau sertifikasi."
                value={goalAmount}
                min={500000}
                max={20000000}
                step={250000}
                onChange={setGoalAmount}
              />
            </section>
          </div>
        </main>
      </ProfileGate>
    </>
  );
}
