import React from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { WhatIfSimulationResult } from "@/lib/financial/financial-engine";
import type { DailyJatah } from "@/components/dashboard/dashboard-data";
import { Note } from "@/components/press/note";
import { Serial } from "@/components/press/serial";
import { Guilloche } from "@/components/press/guilloche";
import { Cap } from "@/components/press/analisis-press";
import { useRolledNumber } from "@/components/press/rolling-numeral";
import { rupiah } from "@/lib/format";

interface SimulationResultCardProps {
  result: WhatIfSimulationResult;
  /** Today's jatah from the real profile, and the same number under the scenario. */
  before: DailyJatah;
  after: DailyJatah;
  baselineNetSavings: number;
  baselineMonthsToGoal: number;
  today: string;
}

const months = (n: number) => (Number.isFinite(n) && n <= 1200 ? `${n} bulan` : "belum kekejar");

function JatahSheet({
  title,
  jatah,
  savings,
  monthsToGoal,
  serialId,
  today,
  seed,
  stamp,
}: {
  title: string;
  jatah: DailyJatah;
  savings: number;
  monthsToGoal: number;
  serialId: string;
  today: string;
  seed: number;
  stamp?: React.ReactNode;
}) {
  const rolled = useRolledNumber(jatah.jatah, 500);
  return (
    <Note as="section" aria-label={title} thread={jatah.status} serial={<Serial id={serialId} date={today} />} className="overflow-hidden flex-1 min-w-0">
      <div className="relative px-5 sm:px-8 pt-6 pb-5 pr-12 sm:pr-16 space-y-3">
        <Guilloche seed={seed} size={160} families={3} className="absolute -right-10 -top-10 opacity-40" />
        <h2 className="relative text-body font-semibold text-ink-soft">{title}</h2>
        <p className="relative font-display font-bold text-ink money flex items-baseline gap-2">
          <span className="text-head">Rp</span>
          <span className="text-[clamp(2.75rem,12vw,4rem)] leading-none tracking-[-0.03em]" aria-hidden="true">
            {rolled.toLocaleString("id-ID")}
          </span>
          <span className="sr-only">{jatah.jatah.toLocaleString("id-ID")}</span>
        </p>
        <div className="relative flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-body text-ink">jatah per hari · {jatah.daysLeft} hari lagi</p>
          {stamp}
        </div>
        <dl className="relative grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-ink/15 pt-3">
          <dt className="text-body text-ink-soft">Sisa bulan ini</dt>
          <dd className="money text-body font-semibold text-ink text-right">{rupiah(jatah.sisaBulanIni)}</dd>
          <dt className="text-body text-ink-soft">Bisa ditabung per bulan</dt>
          <dd className="money text-body font-semibold text-ink text-right">{rupiah(savings)}</dd>
          <dt className="text-body text-ink-soft">Target kekejar dalam</dt>
          <dd className="text-body font-semibold text-ink text-right">{months(monthsToGoal)}</dd>
        </dl>
      </div>
    </Note>
  );
}

/** What-if as two notes: today's jatah as it is, and the same number reprinted under the scenario. */
export function SimulationResultCard({ result, before, after, baselineNetSavings, baselineMonthsToGoal, today }: SimulationResultCardProps) {
  const delta = after.jatah - before.jatah;
  const faster =
    Number.isFinite(baselineMonthsToGoal) && Number.isFinite(result.simulatedMonthsToGoal)
      ? baselineMonthsToGoal - result.simulatedMonthsToGoal
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-stretch gap-3 md:gap-4">
        <JatahSheet
          title="Sekarang"
          jatah={before}
          savings={baselineNetSavings}
          monthsToGoal={baselineMonthsToGoal}
          serialId="sim-now"
          today={today}
          seed={0xc4a3}
        />
        <div aria-hidden="true" className="flex items-center justify-center text-ink-soft">
          <ArrowDown className="w-5 h-5 md:hidden" />
          <ArrowRight className="w-5 h-5 hidden md:block" />
        </div>
        <JatahSheet
          title="Kalau skenario ini jalan"
          jatah={after}
          savings={result.simulatedNetSavings}
          monthsToGoal={result.simulatedMonthsToGoal}
          serialId="sim-after"
          today={today}
          seed={0x51a7}
          stamp={
            delta !== 0 && (
              <Cap tone={delta > 0 ? "aman" : "habis"} tilt={-7}>
                {delta > 0 ? "+" : "−"}
                {rupiah(Math.abs(delta)).replace("Rp ", "Rp")}/hari
              </Cap>
            )
          }
        />
      </div>
      <p className="text-body text-ink max-w-prose">
        {delta > 0
          ? `Jatahmu naik ${rupiah(delta)} sehari${faster > 0 ? ` dan target kekejar ${faster} bulan lebih cepat` : ""}.`
          : delta < 0
          ? `Jatahmu turun ${rupiah(-delta)} sehari${faster < 0 ? `, target mundur ${-faster} bulan` : ""}. Siapin rem dari sekarang.`
          : "Belum ada perubahan. Geser angka di bawah atau pilih skenario."}
      </p>
    </div>
  );
}
