"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { LeakAuditSummary } from "@/types/audit-types";
import { auditMicroExpenses, ExpenseAuditCandidate } from "@/lib/financial/audit-engine";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { useAuth } from "@/hooks/use-auth";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

import { AuditCardMobile } from "@/components/audit/audit-card-mobile";
import { AuditBentoDesktop } from "@/components/audit/audit-bento-desktop";

export default function AuditPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseAuditCandidate[]>([]);
  const [monthlyAllowance, setMonthlyAllowance] = useState<number>(2000000);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData?.profile?.monthlyIncome) {
          setMonthlyAllowance(Number(pData.profile.monthlyIncome));
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
          setLoading(false);
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const auditSummary: LeakAuditSummary = useMemo(() => {
    return auditMicroExpenses(expenses, monthlyAllowance);
  }, [expenses, monthlyAllowance]);

  return (
    <div className="min-h-[100dvh] bg-cream-50 dark:bg-[#030712] text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors selection:bg-navy-900 selection:text-white">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4 pb-2">
          <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all">
            {/* Left: Mobile Back Button & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-navy-700 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-white/10 transition-colors"
                aria-label="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <Breadcrumbs className="hidden md:flex mb-0.5" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide">
                  Detektor Bocor Halus
                </h1>
                <p className="text-[10px] text-navy-500 dark:text-cream-400 hidden sm:block">
                  Audit pengeluaran receh & jajan siluman anak kost
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              <button
                onClick={loadData}
                className="px-3.5 py-1.5 rounded-full border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-200 text-xs font-semibold hover:bg-cream-100 dark:hover:bg-navy-900 flex items-center gap-1.5 transition-all"
                title="Refresh Data Audit"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-6">
          {/* MOBILE PWA VIEW (md:hidden) */}
          <div className="md:hidden space-y-4">
            <AuditCardMobile summary={auditSummary} />
          </div>

          {/* DESKTOP BENTO GRID VIEW (hidden md:block) */}
          <div className="hidden md:block">
            <AuditBentoDesktop summary={auditSummary} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />
    </div>
  );
}
