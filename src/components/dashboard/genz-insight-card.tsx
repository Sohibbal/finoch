"use client";

import React from "react";
import type { GenZInsightResult } from "@/lib/financial/genz-insight-engine";

interface GenZInsightCardProps {
  nickname: string;
  insight: GenZInsightResult;
}

/** Original FinBot vector emblem - custom geometric wallet & pulse emblem (Zero generic AI icon) */
function FinBotVectorMark({ mood }: { mood: "hype" | "happy" | "warning" }) {
  const accentColor =
    mood === "warning"
      ? "#D97706" // amber 600
      : mood === "hype"
      ? "#2563EB" // blue 600
      : "#059669"; // emerald 600

  return (
    <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7"
        aria-hidden="true"
      >
        {/* Wallet envelope folded geometry */}
        <rect
          x="7"
          y="10"
          width="30"
          height="24"
          rx="5"
          stroke={accentColor}
          strokeWidth="2"
          className="opacity-90"
        />
        {/* Wallet flap fold lines */}
        <path
          d="M7 14L22 23L37 14"
          stroke={accentColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        />
        {/* Central financial pulse node */}
        <circle cx="22" cy="23" r="3" fill={accentColor} />
        {/* Tactile stitching dash at base */}
        <path
          d="M12 30H32"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeDasharray="2 3"
          strokeLinecap="round"
          className="opacity-70"
        />
      </svg>
    </div>
  );
}

export function GenZInsightCard({ nickname, insight }: GenZInsightCardProps) {
  const isWarning = insight.mood === "warning";
  const isHype = insight.mood === "hype";

  return (
    <div
      className={`relative overflow-hidden p-6 rounded-3xl backdrop-blur-xl border shadow-sm transition-all glass-sheen before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.08] dark:before:via-white/[0.03] before:to-transparent before:pointer-events-none after:absolute after:top-0 after:left-7 after:w-10 after:h-1 after:rounded-b-md after:bg-slate-300/80 dark:after:bg-slate-700/80 after:shadow-sm ${
        isWarning
          ? "bg-amber-500/[0.05] dark:bg-amber-950/25 border-amber-300/70 dark:border-amber-800/60"
          : isHype
          ? "bg-blue-500/[0.05] dark:bg-blue-950/25 border-blue-300/70 dark:border-blue-800/60"
          : "bg-white/80 dark:bg-[#111C2E]/80 border-slate-200/80 dark:border-slate-800"
      }`}
    >
      {/* Background Transparent Watermark */}
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute -right-6 -bottom-6 w-36 h-36 opacity-[0.04] dark:opacity-[0.07] text-slate-900 dark:text-white pointer-events-none select-none"
        aria-hidden="true"
      >
        <rect x="7" y="10" width="30" height="24" rx="5" stroke="currentColor" strokeWidth="2" />
        <path d="M7 14L22 23L37 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="23" r="3" fill="currentColor" />
        <path d="M12 30H32" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" strokeLinecap="round" />
      </svg>

      <div className="flex items-start gap-4 relative z-10">
        <FinBotVectorMark mood={insight.mood} />

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isWarning
                    ? "bg-amber-500"
                    : isHype
                    ? "bg-blue-500"
                    : "bg-emerald-500"
                }`}
              />
              <span>FinBot Daily Insight</span>
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {insight.headline}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {insight.body}
          </p>
        </div>
      </div>
    </div>
  );
}
