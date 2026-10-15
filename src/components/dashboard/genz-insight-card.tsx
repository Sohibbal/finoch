"use client";

import React from "react";
import { Bot } from "lucide-react";
import type { GenZInsightResult } from "@/lib/financial/genz-insight-engine";
import { TypewriterText } from "@/components/ui/typewriter-text";

interface GenZInsightCardProps {
  nickname: string;
  insight: GenZInsightResult;
  className?: string;
}

/**
 * Full-height FinBot logo emblem on the left side with looping fade/breathe effect
 * Matching the exact Bot icon used in the sidebar.
 */
function FinBotFullHeightLogo({ mood }: { mood: "hype" | "happy" | "warning" }) {
  const accentColor =
    mood === "warning"
      ? "#D97706" // amber 600
      : mood === "hype"
      ? "#2563EB" // blue 600
      : "#059669"; // emerald 600

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center finbot-fade-loop select-none">
      {/* Ambient Looping Aura Glow */}
      <div
        className="absolute inset-0 rounded-2xl blur-lg opacity-40 dark:opacity-50 transition-colors"
        style={{ backgroundColor: accentColor }}
      />

      {/* Modern FinBot Logo Emblem using Sidebar Bot Icon */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700/80 shadow-lg flex items-center justify-center">
        <Bot
          className="w-9 h-9 sm:w-11 sm:h-11"
          style={{ color: accentColor }}
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export function GenZInsightCard({ nickname, insight, className = "" }: GenZInsightCardProps) {
  const isWarning = insight.mood === "warning";
  const isHype = insight.mood === "hype";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-xs transition-all glass-sheen min-h-[178px] flex flex-row items-stretch before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.08] dark:before:via-white/[0.03] before:to-transparent before:pointer-events-none ${
        isWarning
          ? "bg-amber-500/[0.05] dark:bg-amber-950/25 border-amber-300/70 dark:border-amber-800/60"
          : isHype
          ? "bg-blue-500/[0.05] dark:bg-blue-950/25 border-blue-300/70 dark:border-blue-800/60"
          : "bg-white/80 dark:bg-[#111C2E]/80 border-slate-200/80 dark:border-slate-800"
      } ${className}`}
    >
      {/* Background Transparent Watermark */}
      <Bot
        className="absolute -right-6 -bottom-6 w-36 h-36 opacity-[0.04] dark:opacity-[0.07] text-slate-900 dark:text-white pointer-events-none select-none"
        strokeWidth={1.5}
        aria-hidden="true"
      />

      {/* SISI KIRI: FinBot Logo Emblem dengan tinggi full sesuai card dan efek memudar looping */}
      <div className="w-28 sm:w-36 shrink-0 self-stretch flex items-center justify-center border-r border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-800/30 relative z-10 p-3 sm:p-4">
        <FinBotFullHeightLogo mood={insight.mood} />
      </div>

      {/* SISI KANAN: Konten Insight dengan Animasi Mengetik Profesional */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between min-w-0 relative z-10 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-900/5 dark:bg-white/10 text-slate-700 dark:text-slate-300">
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

          <div className="hidden sm:flex items-center gap-1.5 text-right">
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                isWarning
                  ? "bg-amber-100/80 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                  : isHype
                  ? "bg-blue-100/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                  : "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
              }`}
            >
              {isWarning
                ? "Perlu Perhatian"
                : isHype
                ? "Streak On Fire"
                : "Kondisi Sehat"}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            <TypewriterText text={insight.headline} speed={14} />
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            <TypewriterText text={insight.body} speed={11} delay={180} />
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1">
          <span>Khusus untuk kawan @{nickname}</span>
          <span>Analisis Harian Otomatis</span>
        </div>
      </div>
    </div>
  );
}

