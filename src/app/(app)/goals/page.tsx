"use client";

import React, { useEffect, useState } from "react";
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Laptop,
  Shield,
  Plane,
  Car,
  X,
  Trash2,
} from "lucide-react";
import { calculateGoalProjection } from "@/lib/financial/financial-engine";
import { FinancialGoal } from "@/types/financial-types";
import { PageHeader, ProfileGate } from "@/components/layout/page-header";
import { useFinancialProfile } from "@/hooks/use-financial-profile";
import { addGoal, deleteGoal, getGoals } from "@/lib/storage/goal-storage";
import { localDateKeyFromNow } from "@/lib/date";

const DAY_MS = 86400000;

/** Whole months left until the deadline (at least 1, so an overdue goal still gets a status). */
function monthsUntil(targetDate: string | Date): number {
  const ms = new Date(targetDate).getTime() - Date.now();
  return Number.isFinite(ms) ? Math.max(1, Math.ceil(ms / (30 * DAY_MS))) : 1;
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
  useEffect(() => setGoals(getGoals()), []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(emptyGoalForm);

  // What is left of the allowance after fixed costs; the status of every goal is measured against it.
  const monthlySavingCapacity = (profile.monthlyIncome ?? 0) - (profile.fixedExpenses ?? 0);

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "emergency_fund":
        return <Shield className="w-5 h-5 text-navy-800 dark:text-cream-200" />;
      case "gadget":
        return <Laptop className="w-5 h-5 text-navy-800 dark:text-cream-200" />;
      case "travel":
        return <Plane className="w-5 h-5 text-navy-800 dark:text-cream-200" />;
      case "vehicle":
        return <Car className="w-5 h-5 text-navy-800 dark:text-cream-200" />;
      default:
        return <Target className="w-5 h-5 text-navy-800 dark:text-cream-200" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on_track":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tepat Sasaran
          </span>
        );
      case "at_risk":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Perlu Dipercepat
          </span>
        );
      case "behind_target":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            <Clock className="w-3.5 h-3.5" />
            Tertunda
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cream-200 text-navy-950 dark:bg-navy-900 dark:text-cream-100">
            Tercapai
          </span>
        );
    }
  };

  return (
    <>
      <PageHeader
        title="Target Tabungan (Goals)"
        subtitle="Kelola target tabungan masa depan dan pantau kelayakan pencapaian"
        actions={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Target</span>
            </button>
          </>
        }
      />

      {/* Main Content */}
      <ProfileGate profile={profile}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
        <div>
          <h2 className="text-xl font-black text-navy-950 dark:text-cream-50">
            Target Tabungan & Proyeksi Pencapaian
          </h2>
          <p className="text-xs text-navy-600 dark:text-cream-300/70 mt-1">
            Status dihitung dari kapasitas nabungmu: Rp {Math.max(0, monthlySavingCapacity).toLocaleString("id-ID")}/bulan (pemasukan dikurangi pengeluaran tetap).
          </p>
        </div>

        {goals.length === 0 && (
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cream-100 dark:bg-navy-900 flex items-center justify-center">
              <Target className="w-5 h-5 text-navy-700 dark:text-cream-200" />
            </div>
            <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">Belum ada target tabungan</h3>
            <p className="text-xs text-navy-600 dark:text-cream-300/70">
              Mulai dari satu tujuan: dana darurat, laptop kuliah, atau biaya wisuda. Finoch hitung apakah tenggatnya realistis.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 font-bold text-xs"
            >
              Buat Target Pertama
            </button>
          </div>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((g) => {
            const progress = Math.min(
              100,
              Math.round((g.currentAmount / g.targetAmount) * 100)
            );
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div
                key={g.id}
                className="bg-white dark:bg-[#070E1A] rounded-2xl p-6 shadow-sm border border-cream-300 dark:border-navy-800 space-y-4 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cream-100 dark:bg-navy-900 rounded-xl">
                      {getCategoryIcon(g.category)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                        {g.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-navy-500 dark:text-cream-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Tenggat: {String(g.targetDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {getStatusBadge(projectStatus(g))}
                    <button
                      type="button"
                      onClick={() => g.id && handleDeleteGoal(g.id)}
                      className="p-1.5 rounded-lg text-navy-400 hover:text-rose-600 dark:text-cream-400/60 dark:hover:text-rose-400"
                      aria-label={`Hapus target ${g.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-600 dark:text-cream-300/80">Progres Tercapai</span>
                    <span className="font-bold text-navy-950 dark:text-cream-50">{progress}%</span>
                  </div>
                  <div className="w-full bg-cream-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-navy-900 dark:bg-cream-100 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Amounts */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-cream-200 dark:border-navy-800/80 text-xs">
                  <div>
                    <span className="text-navy-500 dark:text-cream-400">Terkumpul:</span>
                    <div className="font-extrabold text-navy-950 dark:text-cream-50 mt-0.5">
                      Rp {g.currentAmount.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-navy-500 dark:text-cream-400">Target Total:</span>
                    <div className="font-extrabold text-navy-950 dark:text-cream-50 mt-0.5">
                      Rp {g.targetAmount.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cream-50/70 dark:bg-navy-900/50 border border-cream-200 dark:border-navy-800/60 text-xs text-navy-600 dark:text-cream-300/70">
                  Sisa dana yang dibutuhkan: <span className="font-bold text-navy-950 dark:text-cream-50">Rp {remaining.toLocaleString("id-ID")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      </ProfileGate>

      {/* Modal Add Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#070E1A] rounded-3xl max-w-md w-full p-6 border border-cream-300 dark:border-navy-800 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
              <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                Tambah Target Finansial Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-navy-500 hover:text-navy-950 dark:text-cream-400 dark:hover:text-cream-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                  Nama Target
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Misal: Beli Laptop Baru"
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                  Target Nominal (Rp)
                </label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                  Saldo Awal Tersimpan (Rp)
                </label>
                <input
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 dark:text-cream-200 mb-1.5">
                  Tenggat Target (Tanggal)
                </label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-900/60 text-navy-950 dark:text-cream-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-cream-200"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 text-xs font-semibold hover:bg-cream-100 dark:hover:bg-navy-900 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold transition shadow-sm"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
