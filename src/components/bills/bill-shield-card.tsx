"use client";

import React from "react";
import { BillSummary } from "@/types/bill-types";
import { rupiah } from "@/lib/format";
import type { MonthFigures } from "@/lib/financial/month-ledger";

interface BillShieldCardProps {
  summary: BillSummary;
  /** The real uang saku from the profile; the share line is left out when it is unknown. */
  monthlyIncome?: number;
  /** The month ledger, once the profile is known: the bills total is its fixed costs. */
  month?: MonthFigures;
  /** The profile's own fixed-cost number, named when it differs so it never silently contradicts this page. */
  profileFixedCosts?: number;
}

/** What this month's bills still hold back, as one ledger line. */
export function billIncomeShare(totalMonthlyBills: number, monthlyIncome?: number): number | null {
  return monthlyIncome && monthlyIncome > 0 ? Math.round((totalMonthlyBills / monthlyIncome) * 100) : null;
}

export function BillShieldCard({ summary, monthlyIncome, month, profileFixedCosts }: BillShieldCardProps) {
  const share = billIncomeShare(summary.totalMonthlyBills, monthlyIncome);
  const late = summary.overdueBills.length;
  const soon = summary.criticalUpcomingBills.length;

  return (
    <section aria-labelledby="tagihan-total-title" className="border-y border-ink/20 py-4 space-y-3">
      <h2 id="tagihan-total-title" className="text-body text-ink-soft">
        Belum dibayar bulan ini
      </h2>
      <p className="font-display text-head font-bold text-ink money">{rupiah(summary.unpaidAmountThisMonth)}</p>
      <dl className="grid grid-cols-3 gap-3 border-t border-ink/10 pt-3">
        <div className="min-w-0">
          <dt className="text-meta text-ink-soft">Total sebulan (dari tagihan)</dt>
          <dd className="money text-body font-semibold text-ink break-words">{rupiah(summary.totalMonthlyBills)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-meta text-ink-soft">Sudah dibayar bulan ini</dt>
          <dd className="money text-body font-semibold text-ink break-words">{rupiah(summary.paidAmountThisMonth)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-meta text-ink-soft">Lunas</dt>
          <dd className="money text-body font-semibold text-ink">
            {summary.paidCount} dari {summary.paidCount + summary.unpaidCount}
          </dd>
        </div>
      </dl>
      {share !== null && (
        <p className="text-body text-ink">
          Tagihan rutin makan <span className="money font-semibold">{share}%</span> uang saku bulananmu.
        </p>
      )}
      {month?.fixedCostSource === "tagihan" && (
        <p className="text-meta text-ink-soft">
          Total ini jadi pengeluaran tetap bulan ini: uang saku <span className="money">{rupiah(month.income)}</span> (dari
          profil) − tagihan <span className="money">{rupiah(month.fixedCosts)}</span> ={" "}
          <span className="money">{rupiah(month.spendable)}</span> yang bisa dibelanjakan, dasar jatah harian dan amplop.
          {profileFixedCosts !== undefined && profileFixedCosts !== month.fixedCosts && (
            <> Angka pengeluaran tetap di Profil (<span className="money">{rupiah(profileFixedCosts)}</span>) tidak dipakai selama ada tagihan.</>
          )}
        </p>
      )}
      {late > 0 && (
        <p className="text-body font-semibold text-habis-ink">
          {late} tagihan lewat jatuh tempo ({summary.overdueBills.map((b) => b.name).join(", ")}). Lunasi dulu biar nggak
          kena denda.
        </p>
      )}
      {soon > 0 && (
        <p className="text-body text-mepet-ink font-semibold">
          {soon} tagihan jatuh tempo sebentar lagi ({summary.criticalUpcomingBills.map((b) => b.name).join(", ")}). Sisihkan
          uangnya dari sekarang.
        </p>
      )}
    </section>
  );
}
