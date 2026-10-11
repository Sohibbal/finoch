"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Flame } from "lucide-react";
import Link from "next/link";
import { StreakSummary } from "@/types/streak-types";
import { calculateStreakMetrics, StreakExpenseCandidate } from "@/lib/financial/streak-engine";
import { expenseStorage } from "@/lib/storage/expense-storage";

import { StreakBadgeCard } from "@/components/streak/streak-badge-card";
import { StreakPunchCard } from "@/components/streak/streak-punch-card";
import { ContentSkeleton, EMPTY_ACTION_CLASS, EmptyState, PageHeader, ProfileGate } from "@/components/layout/page-header";
import { useFinancialProfile } from "@/hooks/use-financial-profile";
import { isDemoMode } from "@/lib/storage/local-storage";

export default function StreakPage() {

  const [expenses, setExpenses] = useState<StreakExpenseCandidate[]>([]);
  const profile = useFinancialProfile();
  const [loaded, setLoaded] = useState(false);
  const dailyLimit = Math.round((profile.monthlyIncome ?? 0) / 30);

  const loadData = useCallback(async () => {
    try {
      // Demo mode shows only local demo rows; the server holds the real expenses.
      const res = isDemoMode() ? null : await fetch("/api/expenses");
      if (res?.ok) {
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
    } finally {
      setLoaded(true);
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
      <PageHeader title="Streak Hemat" subtitle="Hari tanpa jajan dicap di kartu bulan ini" />

      <ProfileGate profile={profile}>
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-10 space-y-8">
          {!loaded ? (
            <ContentSkeleton />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={Flame}
              title="Streak belum dimulai"
              action={
                <Link href="/dashboard" className={EMPTY_ACTION_CLASS}>
                  Catat Pengeluaran
                </Link>
              }
            >
              Streak puasa jajan dihitung dari catatan pengeluaranmu. Catat pengeluaran pertama, lalu tantang dirimu untuk hari tanpa jajan.
            </EmptyState>
          ) : (
            <>
              <StreakBadgeCard summary={summary} />
              <StreakPunchCard summary={summary} />
              <p className="text-meta text-ink-soft max-w-prose">
                Batas harian di kartu ini dihitung dari uang saku bulanan dibagi 30. Hari tanpa jajan keinginan dicap puasa jajan.
              </p>
            </>
          )}
        </main>
      </ProfileGate>
    </>
  );
}
