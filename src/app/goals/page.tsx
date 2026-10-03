"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { calculateGoalProjection } from "@/lib/financial/financial-engine";
import { FinancialGoal } from "@/types/financial-types";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<FinancialGoal[]>([
    {
      id: "goal-1",
      userId: "user-1",
      name: "Dana Darurat (3 Bulan)",
      targetAmount: 9000000,
      currentAmount: 4500000,
      targetDate: "2026-12-31",
      category: "emergency_fund",
      status: "on_track",
    },
    {
      id: "goal-2",
      userId: "user-1",
      name: "Beli Laptop Kerja",
      targetAmount: 14000000,
      currentAmount: 3500000,
      targetDate: "2027-06-30",
      category: "gadget",
      status: "at_risk",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: 5000000,
    currentAmount: 500000,
    targetDate: "2027-01-01",
    category: "gadget",
  });

  const monthlySavingCapacity = 850000; // kapasitas tabungan riil dari profil/dashboard

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name.trim()) return;

    const monthsToTarget = 12;
    const proj = calculateGoalProjection({
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount,
      monthlySaving: monthlySavingCapacity,
      targetMonths: monthsToTarget,
    });

    const goalItem: FinancialGoal = {
      id: `goal-${Date.now()}`,
      userId: "user-1",
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: newGoal.currentAmount,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      status: proj.status,
    };

    setGoals([...goals, goalItem]);
    setIsModalOpen(false);
    setNewGoal({
      name: "",
      targetAmount: 5000000,
      currentAmount: 500000,
      targetDate: "2027-01-01",
      category: "gadget",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "emergency_fund":
        return <Shield className="w-5 h-5 text-emerald-500" />;
      case "gadget":
        return <Laptop className="w-5 h-5 text-blue-500" />;
      case "travel":
        return <Plane className="w-5 h-5 text-purple-500" />;
      case "vehicle":
        return <Car className="w-5 h-5 text-amber-500" />;
      default:
        return <Target className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "on_track":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Tepat Sasaran
          </span>
        );
      case "at_risk":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            Perlu Dipercepat
          </span>
        );
      case "behind_target":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <Clock className="w-3.5 h-3.5" />
            Tertunda
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            Tercapai
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex min-h-screen sticky top-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0c1322]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Left: Mobile Brand & Page Title */}
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0f274a] dark:bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Target className="w-4 h-4 text-blue-300 dark:text-white" />
                </div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  FINRA
                </span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                  Target Finansial (Goals)
                </h1>
                <p className="text-[11px] text-slate-500">
                  Kelola target tabungan masa depan dan pantau kelayakan pencapaian
                </p>
              </div>
            </div>

            {/* Right: Theme Toggle & Add Goal */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Target</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Target Tabungan & Proyeksi Pencapaian
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Status pencapaian dihitung otomatis dari tabungan bulanan Digital Twin Anda.
            </p>
          </div>

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
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {getCategoryIcon(g.category)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {g.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Tenggat: {String(g.targetDate)}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(g.status)}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Terkumpul</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {progress}% (Rp {g.currentAmount.toLocaleString("id-ID")})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats Row */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Target Total</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      Rp {g.targetAmount.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Sisa Dibutuhkan</span>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Rp {remaining.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Tambah Target Finansial Baru
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Dana Darurat, Beli HP"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Nominal Target (IDR)
                </label>
                <input
                  type="number"
                  required
                  value={newGoal.targetAmount}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      targetAmount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Tabungan Awal Saat Ini (IDR)
                </label>
                <input
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={(e) =>
                    setNewGoal({
                      ...newGoal,
                      currentAmount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Target Tanggal Tercapai
                </label>
                <input
                  type="date"
                  required
                  value={newGoal.targetDate}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, targetDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0f274a] hover:bg-[#183664] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} />
    </div>
  );
}
