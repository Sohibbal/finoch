"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Lightbulb,
  ShieldAlert,
  CheckCircle,
} from "lucide-react";
import { detectSpendingPatterns } from "@/lib/insights/pattern-detector";
import { AiInsightCard } from "@/types/financial-types";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function InsightsPage() {
  const [insights] = useState<AiInsightCard[]>(() =>
    detectSpendingPatterns({
      currentCategoryTotals: {
        Food: 920000,
        Groceries: 450000,
        Entertainment: 350000,
      },
      previousCategoryTotals: {
        Food: 720000,
        Groceries: 580000,
        Entertainment: 310000,
      },
      recurringExpenses: [
        { name: "Netflix", amount: 65000, frequency: "monthly" },
        { name: "Spotify Family", amount: 45000, frequency: "monthly" },
        { name: "Sewa Kost", amount: 900000, frequency: "monthly" },
      ],
    })
  );

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-navy-950 text-navy-900 dark:text-cream-100 flex flex-col md:flex-row transition-colors">
      {/* Desktop Left Sidebar */}
      <DashboardSidebar className="hidden md:flex" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-cream-300 dark:border-navy-800 px-4 sm:px-6 py-3.5 transition-colors">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="md:hidden flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-navy-950 dark:text-cream-50">
                  finoch<span className="text-emerald-500">.id</span>
                </span>
              </div>
              <div className="hidden md:block">
                <Breadcrumbs className="mb-1" />
                <h1 className="text-sm font-bold text-navy-950 dark:text-cream-50">
                  Wawasan Finansial (AI Insights)
                </h1>
                <p className="text-[11px] text-navy-600 dark:text-cream-300/70">
                  Setiap wawasan didukung bukti angka konkret dan rencana aksi nyata
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 w-full">
          <div>
            <h2 className="text-xl font-black text-navy-950 dark:text-cream-50">
              Deteksi Pola & Rekomendasi Finansial
            </h2>
            <p className="text-xs text-navy-600 dark:text-cream-300/70 mt-1">
              Evaluasi kebiasaan belanja untuk mencegah kebocoran kas bulanan secara cerdas.
            </p>
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((card, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#070E1A] rounded-2xl p-6 shadow-sm border border-cream-300 dark:border-navy-800 space-y-4 flex flex-col justify-between transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        card.type === "spending_increase"
                          ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          : card.type === "spending_decrease"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-cream-100 text-navy-800 dark:bg-navy-900 dark:text-cream-200"
                      }`}
                    >
                      {card.type === "spending_increase" ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : card.type === "spending_decrease" ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {card.type.replace("_", " ")}
                    </span>
                    <span className="text-xs text-navy-400 dark:text-cream-400/60">
                      Akurasi: {Math.round((card.confidence || 0.95) * 100)}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy-950 dark:text-cream-50">
                    {card.title}
                  </h3>
                  <p className="text-xs text-navy-600 dark:text-cream-300/80 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Evidence Box */}
                  <div className="p-3 rounded-xl bg-cream-50/70 dark:bg-navy-900/50 border border-cream-200 dark:border-navy-800/60 text-xs text-navy-700 dark:text-cream-300">
                    <div className="font-semibold text-navy-950 dark:text-cream-50 mb-1">
                      Bukti Angka:
                    </div>
                    <pre className="text-[11px] font-mono text-navy-500 dark:text-cream-400/70 overflow-x-auto">
                      {JSON.stringify(card.evidence, null, 2)}
                    </pre>
                  </div>

                  {/* Impact Statement */}
                  <div className="text-xs font-medium text-navy-700 dark:text-cream-300">
                    <span className="font-bold text-navy-950 dark:text-cream-50">Dampak: </span>
                    {card.impact}
                  </div>
                </div>

                {/* Recommendation Action */}
                <div className="pt-3 border-t border-cream-200 dark:border-navy-800/80">
                  <div className="p-3 rounded-xl bg-cream-100 dark:bg-navy-900 border border-cream-200 dark:border-navy-800 text-xs text-navy-900 dark:text-cream-100 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-navy-800 dark:text-cream-200" />
                    <div>
                      <span className="font-bold">Rekomendasi Aksi: </span>
                      {card.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onOpenVoice={() => {}} />
    </div>
  );
}
