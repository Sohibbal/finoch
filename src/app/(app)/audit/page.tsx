"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Flame, RefreshCw } from "lucide-react";
import Link from "next/link";
import { LeakAuditSummary } from "@/types/audit-types";
import { auditMicroExpenses, ExpenseAuditCandidate } from "@/lib/financial/audit-engine";
import { expenseStorage } from "@/lib/storage/expense-storage";

import { AuditReceipt } from "@/components/audit/audit-receipt";
import { MONTH_NAMES_ID } from "@/lib/financial/report-engine";
import { ContentSkeleton, EMPTY_ACTION_CLASS, EmptyState, PageHeader, ProfileGate } from "@/components/layout/page-header";
import { useFinancialProfile } from "@/hooks/use-financial-profile";
import { isDemoMode } from "@/lib/storage/local-storage";

export default function AuditPage() {

  const [expenses, setExpenses] = useState<ExpenseAuditCandidate[]>([]);
  const profile = useFinancialProfile();
  const [loaded, setLoaded] = useState(false);

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

  const auditSummary: LeakAuditSummary = useMemo(() => {
    return auditMicroExpenses(expenses, profile.monthlyIncome ?? 0);
  }, [expenses, profile.monthlyIncome]);

  return (
    <>
      <PageHeader
        title="Bocor Halus"
        subtitle="Jajan kecil yang numpuk bulan ini"
        actions={
          <button
            type="button"
            onClick={loadData}
            aria-label="Muat ulang audit"
            className="w-11 h-11 rounded-full border border-ink/30 text-ink hover:bg-ink/5 flex items-center justify-center transition-colors"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
          </button>
        }
      />

      <ProfileGate profile={profile}>
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-10">
        {!loaded ? (
          <ContentSkeleton />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="Belum ada jajan yang bisa diaudit"
            action={
              <Link href="/dashboard" className={EMPTY_ACTION_CLASS}>
                Catat Pengeluaran
              </Link>
            }
          >
            Catat pengeluaran harianmu lewat suara atau foto struk. Finoch akan menandai jajan receh yang diam-diam menggerus uang saku.
          </EmptyState>
        ) : (
          <AuditReceipt summary={auditSummary} monthLabel={`${MONTH_NAMES_ID[new Date().getMonth()]} ${new Date().getFullYear()}`} />
        )}
      </main>
      </ProfileGate>
    </>
  );
}
