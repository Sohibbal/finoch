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
      className={`relative overflow-hidden p-6 rounded-3xl border transition-all ${
        isWarning
          ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20 text-ink dark:text-white"
          : isHype
          ? "bg-primary-500/5 dark:bg-primary-950/20 border-primary-500/20 text-ink dark:text-white"
          : "bg-paper-sheet dark:bg-navy-900 border-ink/15 dark:border-navy-800 text-ink dark:text-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isWarning
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : isHype
              ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          }`}
        >
          {isWarning ? (
            <AlertTriangle className="w-6 h-6" />
          ) : isHype ? (
            <Sparkles className="w-6 h-6" />
          ) : (
            <Smile className="w-6 h-6" />
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
