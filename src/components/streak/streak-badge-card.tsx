"use client";

import React from "react";
import { StreakSummary } from "@/types/streak-types";
import { Guilloche } from "@/components/press/guilloche";
import { Note } from "@/components/press/note";
import { useRolledNumber } from "@/components/press/rolling-numeral";
import { Stamp } from "@/components/press/kampus-press";

interface StreakBadgeCardProps {
  summary: StreakSummary;
}

/** The running streak printed as the page's one big number, with the earned title stamped on. */
export function StreakBadgeCard({ summary }: StreakBadgeCardProps) {
  const streak = useRolledNumber(summary.currentStreak);
  return (
    <Note as="section" aria-labelledby="streak-title" microtext className="overflow-hidden">
      <div className="relative flex items-center gap-8 px-5 sm:px-8 pt-6 pb-4">
        <Guilloche seed={0x57ea} turn={summary.currentStreak * 12} size={160} className="hidden sm:block shrink-0" />
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 id="streak-title" className="text-body font-semibold text-ink-soft">
              Streak hemat
            </h2>
            <Stamp label={summary.badge.title} tone={summary.currentStreak > 0 ? "aman" : "ink"} />
          </div>
          <p className="font-display font-bold text-ink money flex items-baseline gap-2">
            <span className="text-numeral" aria-hidden="true">
              {streak}
            </span>
            <span className="text-head">hari</span>
            <span className="sr-only">{summary.currentStreak} hari berturut-turut</span>
          </p>
          <p className="text-body text-ink max-w-prose">{summary.badge.description}</p>
          <p className="text-body text-ink-soft">
            Rekor <span className="money font-semibold text-ink">{summary.longestStreak} hari</span> · puasa jajan bulan ini{" "}
            <span className="money font-semibold text-ink">{summary.greenDaysCount} hari</span>
          </p>
        </div>
      </div>
    </Note>
  );
}
