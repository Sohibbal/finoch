"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Flame,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { LeakAuditSummary } from "@/types/audit-types";
import { auditMicroExpenses, ExpenseAuditCandidate } from "@/lib/financial/audit-engine";
import { expenseStorage } from "@/lib/storage/expense-storage";

import { AuditCardMobile } from "@/components/audit/audit-card-mobile";
import { AuditBentoDesktop } from "@/components/audit/audit-bento-desktop";
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
        title="Detektor Bocor Halus"
        subtitle="Audit pengeluaran receh & jajan siluman anak kost"
        actions={
          <>
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-200 text-xs font-semibold hover:bg-cream-100 dark:hover:bg-navy-900 flex items-center gap-1.5 transition-all"
              title="Refresh Data Audit"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </>
        }
      />

      {/* Page Body */}
      <ProfileGate profile={profile}>
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-6">
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
        <>
        {/* MOBILE PWA VIEW (md:hidden) */}
        <div className="md:hidden space-y-4">
          <AuditCardMobile summary={auditSummary} />
        </div>

        {/* DESKTOP BENTO GRID VIEW (hidden md:block) */}
        <div className="hidden md:block">
          <AuditBentoDesktop summary={auditSummary} />
        </div>
        </>
        )}
      </main>
      </ProfileGate>
    </>
  );
}
