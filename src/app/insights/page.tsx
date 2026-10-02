"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Bot,
  CheckCircle,
} from "lucide-react";
import { detectSpendingPatterns } from "@/lib/insights/pattern-detector";
import { AiInsightCard } from "@/types/financial-types";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-md shadow-amber-500/20">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  FINRA
                </span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  AI Insights
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/simulator" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              What-If Simulator
            </Link>
            <Link href="/goals" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Goals
            </Link>
            <Link href="/copilot" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-emerald-500" />
              AI Copilot
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Wawasan & Deteksi Pola Finansial (AI Insights)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Bukan sekadar saran umum: Setiap wawasan didukung bukti angka konkret dan rencana aksi nyata.
          </p>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((card, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      card.type === "spending_increase"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : card.type === "spending_decrease"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
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
                  <span className="text-xs text-slate-400">
                    Akurasi: {Math.round((card.confidence || 0.95) * 100)}%
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {card.description}
                </p>

                {/* Evidence Box */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    Bukti Angka (Evidence):
                  </div>
                  <pre className="text-[11px] font-mono text-slate-500 overflow-x-auto">
                    {JSON.stringify(card.evidence, null, 2)}
                  </pre>
                </div>

                {/* Impact Statement */}
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white">Dampak: </span>
                  {card.impact}
                </div>
              </div>

              {/* Recommendation Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
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
  );
}
