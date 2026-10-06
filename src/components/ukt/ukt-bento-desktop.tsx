"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Calendar,
  Sparkles,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { UktPlan, UktMetrics } from "@/types/ukt-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { calculateUktMetrics } from "@/lib/financial/ukt-engine";

interface UktBentoDesktopProps {
  plans: UktPlan[];
  monthlyIncome: number;
  onOpenAddModal: () => void;
  onDeposit: (planId: string, amount: number, note?: string) => void;
  onDelete: (planId: string) => void;
}

export function UktBentoDesktop({
  plans,
  monthlyIncome,
  onOpenAddModal,
  onDeposit,
  onDelete,
}: UktBentoDesktopProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositNote, setDepositNote] = useState<string>("");

  const totalTarget = plans.reduce((acc, p) => acc + p.targetAmount, 0);
  const totalSaved = plans.reduce((acc, p) => acc + p.currentSaved, 0);
  const totalRemaining = Math.max(0, totalTarget - totalSaved);
  const overallPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleQuickDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount.replace(/[^0-9]/g, "")) || 0;
    if (val > 0 && selectedPlanId) {
      onDeposit(selectedPlanId, val, depositNote.trim() || "Setoran manual");
      setDepositAmount("");
      setDepositNote("");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Terkumpul */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-navy-950 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
              Total Dana Terkumpul
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-indigo-300" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-white mb-1">
              {formatRupiah(totalSaved)}
            </div>
            <p className="text-xs text-cream-200/80">
              {overallPercentage}% dari total target {formatRupiah(totalTarget)}
            </p>
          </div>
        </div>

        {/* Sisa Kekurangan */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Sisa Kebutuhan Dana
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {formatRupiah(totalRemaining)}
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              Harus dipenuhi sebelum tenggat bayar
            </p>
          </div>
        </div>

        {/* Jumlah Rencana Aktif */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Pos Kebutuhan Kampus
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-navy-950 dark:text-cream-50">
              {plans.length} Pos Aktif
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              UKT, praktikum, KKN & skripsi
            </p>
          </div>
        </div>

        {/* Status Tabungan */}
        <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Disiplin Alokasi
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              Sinking Fund
            </div>
            <p className="text-[11px] text-navy-500 dark:text-cream-400 mt-1">
              Bebas panik saat tanggal bayar tiba
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Plans Grid (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-950 dark:text-cream-50">
              Daftar Pos Dana Kampus & Semesteran ({plans.length})
            </h2>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Target UKT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const metrics = calculateUktMetrics(plan, monthlyIncome);

              return (
                <div
                  key={plan.id}
                  className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden transition-all hover:scale-[1.01]"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        {plan.category.toUpperCase()}
                      </span>
                      <h3 className="font-bold text-base text-navy-950 dark:text-cream-50">
                        {plan.name}
                      </h3>
                      <span className="text-xs text-navy-500 dark:text-cream-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Tenggat: {plan.deadline} ({metrics.daysRemaining} hari lagi)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          metrics.isCompleted
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : metrics.feasibilityStatus === "aman"
                            ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {metrics.isCompleted ? "Lunas" : `${metrics.progressPercentage}%`}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus rencana "${plan.name}"?`)) onDelete(plan.id);
                        }}
                        className="p-1 rounded-lg text-navy-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Hapus Target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-navy-500 dark:text-cream-400 block">
                          Terkumpul:
                        </span>
                        <span className="text-xl font-black text-navy-950 dark:text-cream-50">
                          {formatRupiah(plan.currentSaved)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-navy-500 dark:text-cream-400 block">
                          Target:
                        </span>
                        <span className="text-xs font-bold text-navy-700 dark:text-cream-300">
                          {formatRupiah(plan.targetAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-cream-100 dark:bg-navy-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          metrics.isCompleted
                            ? "bg-emerald-500"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        }`}
                        style={{ width: `${metrics.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Daily Target Recommendation */}
                  {!metrics.isCompleted && (
                    <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs">
                      <div className="flex justify-between text-indigo-900 dark:text-indigo-200 font-bold mb-0.5">
                        <span>Target Harian:</span>
                        <span>{formatRupiah(metrics.dailyTarget)} /hari</span>
                      </div>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-300/80 leading-snug">
                        {metrics.advice}
                      </p>
                    </div>
                  )}

                  {/* 1-Tap Quick Deposit Row */}
                  {!metrics.isCompleted && (
                    <div className="pt-2 border-t border-cream-200 dark:border-navy-800 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-navy-500 dark:text-cream-400">
                        Setor:
                      </span>
                      {[25000, 50000, 100000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => onDeposit(plan.id, amt, "Setoran cepat")}
                          className="px-2.5 py-1 rounded-xl bg-cream-100 dark:bg-navy-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 text-[11px] font-bold text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700 transition-colors"
                        >
                          +{amt / 1000}k
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Setor Cepat Widget & Deposit History (Span 1) */}
        <div className="space-y-6">
          {/* Quick Deposit Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-950 dark:text-cream-50">
              Setor Tabungan UKT Hari Ini
            </h3>

            <form onSubmit={handleQuickDepositSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
                  Pilih Target UKT:
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50 dark:bg-navy-800 text-xs font-medium text-navy-900 dark:text-cream-50 focus:ring-2 focus:ring-indigo-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
                  Nominal Setoran (Rp):
                </label>
                <input
                  type="number"
                  min="5000"
                  step="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full min-h-[44px] px-3 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50 dark:bg-navy-800 text-xs font-semibold text-navy-900 dark:text-cream-50 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
                  Catatan Setoran:
                </label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="Contoh: Sisa jajan minggu ini"
                  className="w-full min-h-[44px] px-3 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50 dark:bg-navy-800 text-xs text-navy-900 dark:text-cream-50 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
              >
                Simpan Setoran
              </button>
            </form>
          </div>

          {/* Deposit History */}
          <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-cream-200 dark:border-navy-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-navy-600 dark:text-cream-400" />
              <h3 className="font-bold text-sm text-navy-950 dark:text-cream-50">
                Riwayat Setoran Terbaru
              </h3>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {plans.flatMap((p) => p.deposits).length === 0 ? (
                <p className="text-xs text-navy-500 dark:text-cream-400 py-3 text-center">
                  Belum ada catatan setoran.
                </p>
              ) : (
                plans
                  .flatMap((p) => p.deposits)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((dep) => (
                    <div
                      key={dep.id}
                      className="p-2.5 rounded-xl bg-cream-50 dark:bg-navy-800/60 border border-cream-200 dark:border-navy-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-navy-900 dark:text-cream-50 block">
                          {dep.note}
                        </span>
                        <span className="text-[10px] text-navy-500 dark:text-cream-400">
                          {new Date(dep.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        +{formatRupiah(dep.amount)}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
