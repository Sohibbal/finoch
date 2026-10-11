"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Flame,
  Calendar,
  Sparkles,
  Trophy,
  TrendingDown,
} from "lucide-react";
import { StreakSummary } from "@/types/streak-types";
import { calculateStreakMetrics, StreakExpenseCandidate } from "@/lib/financial/streak-engine";
import { expenseStorage } from "@/lib/storage/expense-storage";

import { StreakBadgeCard } from "@/components/streak/streak-badge-card";
import { StreakStripMobile } from "@/components/streak/streak-strip-mobile";
import { StreakCalendarDesktop } from "@/components/streak/streak-calendar-desktop";
import { PageHeader } from "@/components/layout/page-header";

export default function StreakPage() {

  const [expenses, setExpenses] = useState<StreakExpenseCandidate[]>([]);
  const [dailyLimit, setDailyLimit] = useState<number>(50000);

  const loadData = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData?.profile?.monthlyIncome) {
          const allowance = Number(pData.profile.monthlyIncome);
          setDailyLimit(Math.round(allowance / 30));
        }
      }
    } catch {
      // fallback
    }

    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.expenses) && data.expenses.length > 0) {
          setExpenses(data.expenses);
          return;
        }
      }

      const local = await expenseStorage.getExpenses();
      if (local && local.length > 0) {
        setExpenses(
          local.map((e) => ({
            id: e.id,
            itemName: e.itemName,
            amount: e.amount,
            category: e.category,
            createdAt: e.createdAt,
          }))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary: StreakSummary = useMemo(() => {
    return calculateStreakMetrics(expenses, dailyLimit, new Date());
  }, [expenses, dailyLimit]);

  return (
    <>
      <PageHeader
        title="Streak Puasa Jajan & Kalender Kas"
        subtitle="Tantangan No-Spend Day & visualisasi arus kas bulanan mahasiswa"
      />

      {/* Page Body */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-6">
        {/* Gamified Badge Banner */}
        <StreakBadgeCard summary={summary} />

        {/* MOBILE PWA VIEW (md:hidden) */}
        <div className="md:hidden space-y-4">
          <StreakStripMobile summary={summary} />

          {/* Mobile Month Points List */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-cream-400 px-1">
              Catatan Harian Bulan Ini ({summary.totalDaysEvaluated} Hari)
            </span>

            {summary.monthlyPoints
              .filter((pt) => !pt.isFuture)
              .reverse()
              .map((pt) => (
                <div
                  key={pt.date}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-navy-950 dark:text-cream-50">
                        {pt.dayName}, {pt.dayNumber} Oktober
                      </span>
                      {pt.isToday && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950">
                          Hari Ini
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-navy-500 dark:text-cream-400">
                      {pt.transactionsCount} transaksi tercatat
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-xs text-navy-950 dark:text-cream-50 block">
                      Rp {pt.totalSpent.toLocaleString("id-ID")}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        pt.status === "no_spend"
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : pt.status === "disciplined"
                          ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          : "bg-rose-500/20 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {pt.status === "no_spend"
                        ? "🟢 Puasa Jajan"
                        : pt.status === "disciplined"
                        ? "🟡 Disiplin"
                        : "🔴 Overbudget"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* DESKTOP VIEW (hidden md:block) */}
        <div className="hidden md:block">
          <StreakCalendarDesktop summary={summary} />
        </div>
      </main>
    </>
  );
}
