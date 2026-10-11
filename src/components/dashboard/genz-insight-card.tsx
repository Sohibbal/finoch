"use client";

import React from "react";
import { Sparkles, AlertTriangle, Smile, Bot } from "lucide-react";
import type { GenZInsightResult } from "@/lib/financial/genz-insight-engine";

interface GenZInsightCardProps {
  nickname: string;
  insight: GenZInsightResult;
}

export function GenZInsightCard({ nickname, insight }: GenZInsightCardProps) {
  const isWarning = insight.mood === "warning";
  const isHype = insight.mood === "hype";

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-3xl border shadow-sm transition-all ${
        isWarning
          ? "bg-amber-500/[0.04] dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40"
          : isHype
          ? "bg-blue-500/[0.04] dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40"
          : "bg-white dark:bg-[#111C2E] border-slate-200/80 dark:border-slate-800"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isWarning
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : isHype
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          }`}
        >
          {isWarning ? (
            <AlertTriangle className="w-5 h-5" strokeWidth={1.75} />
          ) : isHype ? (
            <Sparkles className="w-5 h-5" strokeWidth={1.75} />
          ) : (
            <Smile className="w-5 h-5" strokeWidth={1.75} />
          )}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-meta font-semibold bg-ink/5 dark:bg-white/10 text-ink-soft dark:text-navy-300">
              <Bot className="w-3.5 h-3.5" />
              <span>FinBot Daily Insight</span>
            </span>
          </div>

          <h3 className="text-head font-bold tracking-tight text-ink dark:text-white">
            {insight.headline}
          </h3>

          <p className="text-body text-ink-soft dark:text-navy-300 leading-relaxed">
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  );
}
