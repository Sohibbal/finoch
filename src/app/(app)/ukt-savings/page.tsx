"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  Plus,
  Calendar,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { UktPlan } from "@/types/ukt-types";
import {
  getUktPlans,
  addUktPlan,
  depositToUktPlan,
  deleteUktPlan,
} from "@/lib/storage/ukt-storage";
import { calculateUktMetrics } from "@/lib/financial/ukt-engine";
import { formatRupiah } from "@/lib/financial/split-bill-engine";
import { useAuth } from "@/hooks/use-auth";

import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BrandLogo } from "@/components/brand/brand-logo";

import { UktCardMobile } from "@/components/ukt/ukt-card-mobile";
import { UktBentoDesktop } from "@/components/ukt/ukt-bento-desktop";
import { UktModal } from "@/components/ukt/ukt-modal";

export default function UktSavingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [plans, setPlans] = useState<UktPlan[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(2000000);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData?.profile?.monthlyIncome) {
          setMonthlyIncome(Number(pData.profile.monthlyIncome));
        }
      }
    } catch {
      // fallback
    }

    const loadedPlans = getUktPlans();
    setPlans(loadedPlans);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeposit = (planId: string, amount: number, note?: string) => {
    depositToUktPlan(planId, amount, note);
    loadData();
  };

  const handleDelete = (planId: string) => {
    deleteUktPlan(planId);
    loadData();
  };

  const handleSaveNewPlan = (
    data: Omit<UktPlan, "id" | "currentSaved" | "deposits" | "updatedAt">
  ) => {
    addUktPlan(data);
    loadData();
  };

  const totalTarget = plans.reduce((acc, p) => acc + p.targetAmount, 0);
  const totalSaved = plans.reduce((acc, p) => acc + p.currentSaved, 0);

  return (
    <div className="min-h-[100dvh] bg-cream-50 dark:bg-[#030712] text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors selection:bg-navy-900 selection:text-white">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-32 md:pb-12 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4 pb-2">
          <div className="max-w-6xl mx-auto rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-2xl border border-white/20 dark:border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center justify-between transition-all">
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => router.push("/dashboard")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-navy-700 dark:text-cream-200 hover:bg-cream-200/60 dark:hover:bg-white/10 transition-colors shrink-0"
                aria-label="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="md:hidden shrink-0 flex items-center" aria-label="Finoch Beranda">
                <BrandLogo variant="symbol" className="w-5 h-5 shrink-0" />
              </Link>
              <div className="min-w-0">
                <Breadcrumbs className="hidden md:flex mb-0.5" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-white tracking-wide truncate">
                  Sinking Fund UKT &amp; Biaya Kampus
                </h1>
                <p className="text-[10px] text-navy-500 dark:text-cream-400 hidden sm:block">
                  Alokasi otomatis harian untuk biaya semester, praktikum, KKN &amp; skripsi
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-3 space-y-6">
          {/* MOBILE PWA VIEW (md:hidden) */}
          <div className="md:hidden space-y-4">
            {/* Mobile Summary Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-navy-950 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
                  Total Terkumpul
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-cream-100 font-bold">
                  {plans.length} Pos Kampus
                </span>
              </div>

              <div className="text-3xl font-black tracking-tight text-white mb-2">
                {formatRupiah(totalSaved)}
              </div>

              <div className="flex justify-between text-xs text-white/80 pt-2 border-t border-white/15">
                <span>Dari Total Target:</span>
                <span className="font-bold text-white">{formatRupiah(totalTarget)}</span>
              </div>
            </div>

            {/* Plans Card List */}
            <div className="space-y-3">
              {plans.map((plan) => {
                const metrics = calculateUktMetrics(plan, monthlyIncome);
                return (
                  <UktCardMobile
                    key={plan.id}
                    plan={plan}
                    metrics={metrics}
                    onDeposit={handleDeposit}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>

            {/* Mobile Floating Action Button (Input-First Ergonomics) */}
            <div className="fixed bottom-20 left-4 right-4 z-30 flex items-center justify-center">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full min-h-[50px] rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Target UKT / Kampus</span>
              </button>
            </div>
          </div>

          {/* DESKTOP VIEW (hidden md:block) */}
          <div className="hidden md:block">
            <UktBentoDesktop
              plans={plans}
              monthlyIncome={monthlyIncome}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onDeposit={handleDeposit}
              onDelete={handleDelete}
            />
          </div>
        </main>
      </div>

      {/* Modal */}
      <UktModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewPlan}
      />

      {/* Mobile Bottom Nav */}
      <BottomNav onOpenVoice={() => router.push("/dashboard")} userEmail={user?.email} />
    </div>
  );
}
