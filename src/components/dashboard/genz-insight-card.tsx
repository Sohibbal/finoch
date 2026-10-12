"use client";

import React from "react";
import type { GenZInsightResult } from "@/lib/financial/genz-insight-engine";
import { TypewriterText } from "@/components/ui/typewriter-text";

interface GenZInsightCardProps {
  nickname: string;
  insight: GenZInsightResult;
  className?: string;
}

/**
 * Full-height FinBot logo emblem on the left side with looping fade/breathe effect
 */
function FinBotFullHeightLogo({ mood }: { mood: "hype" | "happy" | "warning" }) {
  const accentColor =
    mood === "warning"
      ? "#D97706" // amber 600
      : mood === "hype"
      ? "#2563EB" // blue 600
      : "#059669"; // emerald 600

  return (
    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center finbot-fade-loop select-none">
      {/* Ambient Looping Aura Glow */}
      <div
        className="absolute inset-0 rounded-2xl blur-md opacity-35 dark:opacity-45 transition-colors"
        style={{ backgroundColor: accentColor }}
      />

      {/* Modern FinBot Logo Emblem */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-md flex items-center justify-center">
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 sm:w-8 sm:h-8"
          aria-hidden="true"
        >
          {/* Robot & Wallet hybrid visor frame */}
          <rect
            x="6"
            y="8"
            width="32"
            height="28"
            rx="7"
            stroke={accentColor}
            strokeWidth="2.2"
          />
          {/* Folded Cantilever Flap */}
          <path
            d="M6 14L22 24L38 14"
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central AI Interactive Pulse Node */}
          <circle cx="22" cy="24" r="3.5" fill={accentColor} />
          {/* Acoustic nodes */}
          <circle cx="14" cy="30" r="1.5" fill={accentColor} fillOpacity="0.8" />
          <circle cx="30" cy="30" r="1.5" fill={accentColor} fillOpacity="0.8" />
        </svg>
      </div>
    </div>
  );
}

export function GenZInsightCard({ nickname, insight, className = "" }: GenZInsightCardProps) {
  const isWarning = insight.mood === "warning";
  const isHype = insight.mood === "hype";

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] backdrop-blur-xl border shadow-xs transition-all glass-sheen min-h-[178px] flex flex-row items-stretch before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.08] dark:before:via-white/[0.03] before:to-transparent before:pointer-events-none after:absolute after:top-0 after:left-7 after:w-10 after:h-1 after:rounded-b-md after:bg-slate-300/80 dark:after:bg-slate-700/80 after:shadow-sm ${
        isWarning
          ? "bg-amber-500/[0.05] dark:bg-amber-950/25 border-amber-300/70 dark:border-amber-800/60"
          : isHype
          ? "bg-blue-500/[0.05] dark:bg-blue-950/25 border-blue-300/70 dark:border-blue-800/60"
          : "bg-white/80 dark:bg-[#111C2E]/80 border-slate-200/80 dark:border-slate-800"
      } ${className}`}
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

      {/* SISI KIRI: FinBot Logo Emblem dengan tinggi full sesuai card dan efek memudar looping */}
      <div className="w-20 sm:w-28 shrink-0 self-stretch flex items-center justify-center border-r border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-800/30 relative z-10 p-3">
        <FinBotFullHeightLogo mood={insight.mood} />
      </div>

      {/* SISI KANAN: Konten Insight dengan Animasi Mengetik Profesional */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between min-w-0 relative z-10 space-y-2">
        <div className="flex items-center justify-between gap-3">
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

          <div className="hidden sm:flex items-center gap-1.5 text-right">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
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

