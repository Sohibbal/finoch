"use client";

import React from "react";
import { Guilloche } from "@/components/press/guilloche";
import { Note } from "@/components/press/note";
import { Seal } from "@/components/press/seal";
import { Serial } from "@/components/press/serial";
import { useRolledNumber } from "@/components/press/rolling-numeral";
import { rupiah } from "@/lib/format";
import { fixedCostScope } from "@/lib/financial/month-ledger";
import type { DailyJatah } from "./dashboard-data";

interface JatahNoteProps {
  jatah: DailyJatah;
  /** Local YYYY-MM-DD of today; prints the note's serial. */
  today: string;
  /** Rosette rotation; bumped on every log so the note visibly re-prints. */
  turn: number;
  onCatat: () => void;
}

function statusLine({ status, sisaHariIni }: DailyJatah): string {
  if (status === "habis") {
    return sisaHariIni < 0
      ? `Lewat ${rupiah(-sisaHariIni)} dari jatah. Besok jatahnya dihitung ulang dari sisa bulan ini.`
      : "Jatah hari ini sudah terpakai semua. Tahan jajan dulu sampai besok.";
  }
  if (status === "mepet") return "Tinggal sedikit. Rem jajan sore biar besok jatahnya tetap utuh.";
  return "Masih aman. Catat tiap jajan biar angkanya tetap jujur.";
}

/** Today's jatah printed as one note: rosette, giant numeral, serial, status thread. */
export function JatahNote({ jatah, today, turn, onCatat }: JatahNoteProps) {
  const left = Math.max(0, jatah.sisaHariIni);
  const rolled = useRolledNumber(left);

  return (
    <>
    <Note
      as="section"
      aria-labelledby="jatah-label"
      thread={jatah.status}
      microtext
      serial={<Serial id={`jatah-${today}`} date={today} />}
      className="overflow-hidden md:overflow-visible"
    >
      <div className="relative flex items-center gap-8 px-5 sm:px-8 pt-8 pb-6 pr-14 sm:pr-20 min-h-[46svh] md:min-h-0">
        <Guilloche
          seed={0xc4a3}
          turn={turn}
          size={220}
          className="absolute -left-20 top-6 opacity-50 sm:static sm:opacity-100 sm:w-44 sm:h-44 lg:w-52 lg:h-52 shrink-0"
        />
        <div className="relative min-w-0 space-y-3">
          <h2 id="jatah-label" className="text-body font-semibold text-ink-soft">
            Sisa jatah hari ini
          </h2>
          <p className="font-display font-bold text-ink money flex items-baseline gap-2">
            <span className="text-head">Rp</span>
            <span className="text-numeral" aria-hidden="true">{rolled.toLocaleString("id-ID")}</span>
            <span className="sr-only">{left.toLocaleString("id-ID")}</span>
          </p>
          <p className="text-body text-ink-soft">
            Sisa bulan ini <span className="money font-semibold text-ink">{rupiah(jatah.sisaBulanIni)}</span> ·{" "}
            {jatah.daysLeft === 1 ? "hari terakhir bulan ini" : `${jatah.daysLeft} hari lagi`}
          </p>
          {/* A warning carries an amount and a next step; when all is well the stamp says it. */}
          {jatah.status !== "aman" && <p className="text-body text-ink max-w-prose">{statusLine(jatah)}</p>}
        </div>
      </div>
      {/* Phones get the seal in the bottom bar; here it overlaps the note's lower edge. */}
      <div className="hidden md:block absolute -bottom-10 right-16 z-10">
        <Seal onClick={onCatat} size={80} />
      </div>
    </Note>
    {/* Where the figures come from, one tap away, so the note itself stays a glance. */}
    <details className="mt-3 text-meta text-ink-soft max-w-prose">
      <summary className="cursor-pointer min-h-11 inline-flex items-center font-semibold text-ink underline underline-offset-2 decoration-ink/40">
        Cara hitung jatah
      </summary>
      <p className="mt-1">
        Jatah hari ini <span className="money">{rupiah(jatah.jatah)}</span> · terpakai hari ini{" "}
        <span className="money">{rupiah(jatah.spentToday)}</span>.
      </p>
      <p className="mt-1">
        Uang saku <span className="money">{rupiah(jatah.month.income)}</span> − pengeluaran tetap{" "}
        <span className="money">{rupiah(jatah.month.fixedCosts)}</span> ({fixedCostScope(jatah.month.fixedCostSource)}) −
        terpakai bulan ini <span className="money">{rupiah(jatah.month.spent)}</span>, dibagi sisa hari.
      </p>
    </details>
    </>
  );
}
