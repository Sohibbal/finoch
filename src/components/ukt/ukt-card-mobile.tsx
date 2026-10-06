"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { UktPlan, UktMetrics } from "@/types/ukt-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface UktCardMobileProps {
  plan: UktPlan;
  metrics: UktMetrics;
  onDeposit: (planId: string, amount: number, note?: string) => void;
  onDelete: (planId: string) => void;
}

export function UktCardMobile({
  plan,
  metrics,
  onDeposit,
  onDelete,
}: UktCardMobileProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleCustomDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmount.replace(/[^0-9]/g, "")) || 0;
    if (val > 0) {
      onDeposit(plan.id, val, "Setoran mandiri");
      setCustomAmount("");
      setShowCustom(false);
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#070E1A] border border-cream-200 dark:border-navy-800 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-navy-950 dark:text-cream-50 leading-tight">
              {plan.name}
            </h3>
            <span className="text-[10px] text-navy-500 dark:text-cream-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              Tenggat: {plan.deadline} ({metrics.daysRemaining} hari lagi)
            </span>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            metrics.isCompleted
              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : metrics.feasibilityStatus === "aman"
              ? "bg-blue-500/20 text-blue-700 dark:text-blue-300"
              : metrics.feasibilityStatus === "moderat"
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
              : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
          }`}
        >
          {metrics.isCompleted
            ? "Lunas"
            : metrics.feasibilityStatus === "aman"
            ? "Aman"
            : metrics.feasibilityStatus === "moderat"
            ? "Disiplin"
            : "Waspada"}
        </span>
      </div>

      {/* Progress & Target Stats */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
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

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-cream-100 dark:bg-navy-900 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.isCompleted
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            }`}
            style={{ width: `${metrics.progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-navy-600 dark:text-cream-400">
          <span>{metrics.progressPercentage}% Terpenuhi</span>
          <span>Sisa: {formatRupiah(metrics.remainingAmount)}</span>
        </div>
      </div>

      {/* Daily Allocation Advice */}
      {!metrics.isCompleted && (
        <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] block font-bold text-indigo-600 dark:text-indigo-400 uppercase">
              Target Sisihkan:
            </span>
            <span className="font-bold">{formatRupiah(metrics.dailyTarget)} /hari</span>
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            atau {formatRupiah(metrics.weeklyTarget)} /minggu
          </span>
        </div>
      )}

      {/* Quick 1-Tap Deposit Buttons (Touch Target >= 48px) */}
      {!metrics.isCompleted && (
        <div className="space-y-2 pt-1 border-t border-cream-200 dark:border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400 block">
            1-Tap Sisihkan Sekarang:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[10000, 25000, 50000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => onDeposit(plan.id, amt, "1-Tap setoran harian")}
                className="min-h-[48px] rounded-2xl bg-cream-50 dark:bg-navy-900 border border-cream-200 dark:border-navy-700 hover:border-emerald-500 font-bold text-xs text-navy-900 dark:text-cream-50 active:scale-95 transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>{amt / 1000}rb</span>
              </button>
            ))}
          </div>

          {/* Custom Deposit Trigger */}
          {showCustom ? (
            <form onSubmit={handleCustomDeposit} className="pt-2 flex gap-2">
              <input
                type="number"
                min="1000"
                step="1000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Nominal Rp..."
                className="flex-1 min-h-[44px] px-3 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/50 dark:bg-navy-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                className="min-h-[44px] px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs active:scale-95 transition-all"
              >
                Setor
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className="w-full text-center text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 py-1 hover:underline"
            >
              + Masukkan Nominal Lainnya
            </button>
          )}
        </div>
      )}
    </div>
  );
}
