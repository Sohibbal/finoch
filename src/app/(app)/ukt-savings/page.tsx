"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { UktPlan } from "@/types/ukt-types";
import {
  getUktPlans,
  addUktPlan,
  depositToUktPlan,
  deleteUktPlan,
} from "@/lib/storage/ukt-storage";
import { calculateUktMetrics } from "@/lib/financial/ukt-engine";
import { rupiah } from "@/lib/format";
import { printDate } from "@/components/press/print-date";
import { localDateKey } from "@/lib/date";

import { UktPlanNote } from "@/components/ukt/ukt-plan-note";
import { UktModal } from "@/components/ukt/ukt-modal";
import { EMPTY_ACTION_CLASS, EmptyState, PageHeader, ProfileGate } from "@/components/layout/page-header";
import { useFinancialProfile } from "@/hooks/use-financial-profile";
import { Guilloche } from "@/components/press/guilloche";
import { Note } from "@/components/press/note";
import { useRolledNumber } from "@/components/press/rolling-numeral";
import { PRIMARY_CLASS } from "@/components/press/kampus-press";

export default function UktSavingsPage() {

  const [plans, setPlans] = useState<UktPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const profile = useFinancialProfile();
  const monthlyIncome = profile.monthlyIncome ?? 0;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = useCallback(() => {
    const loadedPlans = getUktPlans();
    setPlans(loadedPlans);
    setLoaded(true);
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
  const overall = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const rolledTotal = useRolledNumber(totalSaved);
  const planName = new Map(plans.map((p) => [p.id, p.name]));
  const recentDeposits = plans
    .flatMap((p) => p.deposits.map((d) => ({ ...d, planId: p.id })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const today = localDateKey(new Date());

  return (
    <>
      <PageHeader title="Tabungan UKT" subtitle="Nyicil biaya semesteran sedikit-sedikit tiap hari" />

      <ProfileGate profile={profile}>
        <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-10 space-y-8">
          {loaded && plans.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Belum ada tabungan kampus"
              action={
                <button type="button" onClick={() => setIsAddModalOpen(true)} className={EMPTY_ACTION_CLASS}>
                  Tambah tabungan UKT
                </button>
              }
            >
              Pecah biaya UKT, praktikum, KKN, atau wisuda jadi setoran harian kecil supaya tidak kaget di akhir semester.
            </EmptyState>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-5 items-end">
                <Note
                  as="section"
                  aria-labelledby="ukt-total-title"
                  microtext
                  className="lg:col-span-2 overflow-hidden"
                >
                  <div className="relative flex items-center gap-6 px-5 sm:px-8 pt-6 pb-4">
                    <Guilloche seed={0x0b17} size={150} className="hidden sm:block shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <h2 id="ukt-total-title" className="text-body font-semibold text-ink-soft">
                        Total tabungan kampus
                      </h2>
                      <p className="font-display font-bold text-ink money flex flex-wrap items-baseline gap-x-2">
                        <span className="text-head">Rp</span>
                        <span className="text-numeral" aria-hidden="true">
                          {rolledTotal.toLocaleString("id-ID")}
                        </span>
                        <span className="sr-only">{totalSaved.toLocaleString("id-ID")}</span>
                      </p>
                      <p className="text-body text-ink">
                        dari target <span className="money font-semibold">{rupiah(totalTarget)}</span> ·{" "}
                        <span className="money">{overall}%</span> · {plans.length} tabungan
                      </p>
                    </div>
                  </div>
                </Note>
                <div className="space-y-3">
                  <p className="text-body text-ink-soft">
                    Setor dikit tiap hari, jangan nunggu akhir semester. Bolong sehari, setoran harian sisanya ikut naik.
                  </p>
                  <button type="button" onClick={() => setIsAddModalOpen(true)} className={`${PRIMARY_CLASS} w-full`}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Tambah tabungan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-10 gap-y-8 items-start">
                <section aria-labelledby="ukt-plans-title" className="lg:col-span-2 space-y-3">
                  <h2 id="ukt-plans-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
                    Pos biaya kampus
                  </h2>
                  <ul className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {plans.map((plan) => (
                      <li key={plan.id}>
                        <UktPlanNote
                          plan={plan}
                          metrics={calculateUktMetrics(plan, monthlyIncome)}
                          onDeposit={handleDeposit}
                          onDelete={handleDelete}
                        />
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="ukt-history-title" className="space-y-3">
                  <h2 id="ukt-history-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
                    Setoran terbaru
                  </h2>
                  {recentDeposits.length === 0 ? (
                    <p className="text-body text-ink-soft">Belum ada setoran. Mulai dari 10 ribu juga sudah jalan.</p>
                  ) : (
                    <ol className="space-y-2">
                      {recentDeposits.map((dep) => (
                        <li key={dep.id} className="relative flex items-start gap-3 pl-4 pr-3 py-3 bg-paper-sheet border border-ink/15">
                          {/* Perforation where the stub was torn off. */}
                          <span aria-hidden="true" className="absolute left-1.5 top-2 bottom-2 border-l border-dotted border-ink/40" />
                          <div className="min-w-0 flex-1">
                            <p className="text-body font-semibold text-ink break-words">{dep.note}</p>
                            <p className="text-meta text-ink-soft break-words">
                              {planName.get(dep.planId)} · {printDate(new Date(dep.createdAt))}
                            </p>
                          </div>
                          <p className="money text-body font-bold text-aman-ink whitespace-nowrap">+{rupiah(dep.amount)}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
      </ProfileGate>

      <UktModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveNewPlan} />
    </>
  );
}
