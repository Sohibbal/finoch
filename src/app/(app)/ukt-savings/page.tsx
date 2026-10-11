"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
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

import { UktCardMobile } from "@/components/ukt/ukt-card-mobile";
import { UktBentoDesktop } from "@/components/ukt/ukt-bento-desktop";
import { UktModal } from "@/components/ukt/ukt-modal";
import { PageHeader } from "@/components/layout/page-header";
import { ACTION_BAR_BOTTOM } from "@/components/layout/insets";

export default function UktSavingsPage() {

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
    <>
      <PageHeader
        title="Sinking Fund UKT & Biaya Kampus"
        subtitle="Alokasi otomatis harian untuk biaya semester, praktikum, KKN & skripsi"
      />

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
          <div className={`fixed ${ACTION_BAR_BOTTOM} md:bottom-20 left-4 right-4 z-30 flex items-center justify-center`}>
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

      {/* Modal */}
      <UktModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewPlan}
      />
    </>
  );
}
