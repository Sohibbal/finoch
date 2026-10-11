import React from "react";
import { MonthlyReportSummary } from "@/types/report-types";
import { ExpenseRecord } from "@/lib/financial/report-engine";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Note } from "@/components/press/note";
import { Serial, formatSerial } from "@/components/press/serial";
import { categoryLabel, rupiah } from "@/lib/format";
import { localDateKey, parseDate } from "@/lib/date";
import { BILL_PAYMENT_PREFIX } from "@/lib/financial/month-ledger";

interface ReportPrintableDocumentProps {
  summary: MonthlyReportSummary;
  expenses: ExpenseRecord[];
  studentName?: string;
  campusName?: string;
  /** Where the fixed costs come from ("dari tagihan" / "dari profil"). */
  fixedCostLabel?: string;
}

const TH = "py-2 pr-3 text-meta font-semibold text-ink-soft text-left";
const TD = "py-2 pr-3 text-body text-ink align-baseline";

// Printing in dark mode would put cream ink on white paper: the printed sheet always uses the light inks.
const PRINT_INKS =
  "print:[--ink:11_25_44] print:[--ink-soft:70_96_127] print:[--paper-sheet:255_255_255] print:[--aman-ink:43_117_80] print:[--habis-ink:180_53_44]";

/** The month's expenses oldest first, each with the balance left after it, like a bank statement. */
export function statementRows(expenses: ExpenseRecord[], summary: MonthlyReportSummary) {
  // Opens at what is spendable after fixed costs; bill payments are already inside those costs.
  let saldo = summary.totalIncome - (summary.fixedCosts ?? 0);
  return expenses
    .map((e) => ({ e, d: parseDate(e.createdAt) }))
    .filter(({ e, d }) => d && d.getMonth() + 1 === summary.month && d.getFullYear() === summary.year && !(summary.fixedCosts > 0 && e.itemName?.startsWith(BILL_PAYMENT_PREFIX)))
    .sort((a, b) => a.d!.getTime() - b.d!.getTime())
    .map(({ e, d }, i) => {
      saldo -= e.amount || 0;
      const day = localDateKey(d!);
      return { id: e.id ?? `row-${i}`, day, item: e.itemName || "Pengeluaran", category: e.category, amount: e.amount || 0, saldo };
    });
}

/** Monthly statement printed as a rekening koran: summary, mutasi with running balance, categories, signatures. */
export function ReportPrintableDocument({
  summary,
  expenses,
  studentName = "Mahasiswa Finoch",
  campusName = "Perguruan Tinggi",
  fixedCostLabel,
}: ReportPrintableDocumentProps) {
  const isSurplus = summary.netSavings >= 0;
  const rows = statementRows(expenses, summary);
  const period = `${summary.monthName} ${summary.year}`;

  return (
    <Note
      as="article"
      aria-labelledby="statement-title"
      microtext
      serial={<Serial id={`laporan-${summary.year}-${summary.month}`} date={new Date(summary.year, summary.month - 1, 1)} />}
      className={`max-w-4xl mx-auto print:border-none ${PRINT_INKS}`}
    >
      <div id="printable-report" className="px-5 sm:px-10 pt-7 pb-6 space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 border-b-2 border-ink pb-5">
          <div className="space-y-2">
            <BrandLogo variant="full" className="h-6 w-auto" />
            <h2 id="statement-title" className="font-display text-head font-bold text-ink">
              Rekening Koran Uang Saku
            </h2>
            <p className="text-body text-ink">Periode {period}</p>
          </div>
          <dl className="text-body text-ink grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
            <dt className="text-ink-soft">Nama</dt>
            <dd className="font-semibold break-words">{studentName}</dd>
            <dt className="text-ink-soft">Institusi</dt>
            <dd className="break-words">{campusName}</dd>
            <dt className="text-ink-soft">Dicetak</dt>
            <dd>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</dd>
          </dl>
        </header>

        <section aria-label="Ringkasan bulan ini" className="space-y-3">
          <dl className="divide-y divide-ink/15 border-y border-ink/15">
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-body text-ink">Uang saku masuk</dt>
              <dd className="money text-body font-semibold text-ink">{rupiah(summary.totalIncome)}</dd>
            </div>
            {summary.fixedCosts > 0 && (
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-body text-ink">
                  Pengeluaran tetap {fixedCostLabel && <span className="text-meta text-ink-soft">· {fixedCostLabel}</span>}
                </dt>
                <dd className="money text-body font-semibold text-ink">{rupiah(-summary.fixedCosts)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-body text-ink">
                Total keluar <span className="text-meta text-ink-soft">· {summary.totalTransactions} transaksi</span>
              </dt>
              <dd className="money text-body font-semibold text-ink">{rupiah(-summary.totalExpenses)}</dd>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
              <dt className="text-body font-bold text-ink flex items-center gap-3">
                Saldo akhir bulan ini
                <span className="text-meta font-semibold text-ink-soft">{isSurplus ? "lebih" : "kurang"}</span>
              </dt>
              <dd className="money font-display text-head font-bold text-ink">{rupiah(summary.netSavings)}</dd>
            </div>
          </dl>
          <p className="text-meta text-ink-soft">
            Rasio tabungan {summary.savingsRate}% · dengan laju belanja sekarang, sisa saldo cukup sekitar {summary.runwayDays} hari
          </p>
        </section>

        <section aria-labelledby="mutasi-title" className="space-y-2">
          <h3 id="mutasi-title" className="font-display text-head font-bold text-ink">
            Mutasi
          </h3>
          {rows.length === 0 ? (
            <p className="text-body text-ink-soft">Belum ada pengeluaran tercatat di {period}.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead className="border-b border-ink/40">
                <tr>
                  <th scope="col" className={TH}>Tgl</th>
                  <th scope="col" className={TH}>Keterangan</th>
                  <th scope="col" className={`${TH} text-right`}>Keluar</th>
                  <th scope="col" className={`${TH} text-right pr-0 hidden sm:table-cell print:table-cell`}>Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-ink/25">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className={`${TD} money whitespace-nowrap`}>{r.day.slice(8, 10)}/{r.day.slice(5, 7)}</td>
                    <td className={`${TD} break-words`}>
                      {r.item}
                      <span className="block text-meta text-ink-soft">
                        {categoryLabel(r.category)} · <span className="money">{formatSerial(r.id, r.day)}</span>
                      </span>
                    </td>
                    <td className={`${TD} money text-right whitespace-nowrap`}>{rupiah(r.amount)}</td>
                    <td className={`${TD} money text-right whitespace-nowrap pr-0 text-ink-soft hidden sm:table-cell print:table-cell`}>
                      {rupiah(r.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 print:grid-cols-2">
          <section aria-labelledby="kategori-title" className="space-y-2">
            <h3 id="kategori-title" className="font-display text-head font-bold text-ink">
              Per kategori
            </h3>
            <ul className="divide-y divide-ink/15 border-y border-ink/15">
              {summary.topCategories.map((cat) => (
                <li key={cat.category} className="py-2 grid grid-cols-[1fr_auto] gap-x-4 items-baseline">
                  <span className="text-body text-ink">
                    {categoryLabel(cat.category)}{" "}
                    <span className="text-meta text-ink-soft">
                      · {cat.transactionCount}x · {cat.percentage}%
                    </span>
                  </span>
                  <span className="money text-body font-semibold text-ink">{rupiah(cat.amount)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="pos-title" className="space-y-2">
            <h3 id="pos-title" className="font-display text-head font-bold text-ink">
              Pos 50/30/20
            </h3>
            <ul className="divide-y divide-ink/15 border-y border-ink/15">
              {[
                { label: "Kebutuhan pokok", note: "makan, kos, tagihan, transport", amount: summary.needsAmount, pct: summary.needsPercentage },
                { label: "Keinginan", note: "nongkrong, hiburan, jajan tambahan", amount: summary.wantsAmount, pct: summary.wantsPercentage },
                { label: "Tabungan", note: "dana darurat & setoran tabungan", amount: summary.savingsAmount, pct: summary.savingsPercentage },
              ].map((p) => (
                <li key={p.label} className="py-2 grid grid-cols-[1fr_auto] gap-x-4 items-baseline">
                  <span className="text-body text-ink">
                    {p.label} <span className="text-meta text-ink-soft">· {p.pct}%</span>
                    <span className="block text-meta text-ink-soft">{p.note}</span>
                  </span>
                  <span className="money text-body font-semibold text-ink">{rupiah(p.amount)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="pt-6 grid grid-cols-2 gap-6 text-center">
          <div>
            <p className="text-meta text-ink-soft mb-14">Disiapkan dengan jujur oleh</p>
            <p className="text-body font-bold text-ink underline underline-offset-4 break-words">{studentName}</p>
            <p className="text-meta text-ink-soft">Mahasiswa / penerima dana</p>
          </div>
          <div>
            <p className="text-meta text-ink-soft mb-14">Mengetahui</p>
            <p aria-hidden="true" className="border-b border-ink mx-4 h-6" />
            <p className="text-meta text-ink-soft">Orang tua / pengelola beasiswa</p>
          </div>
        </div>

        <p className="text-meta text-ink-soft text-center">Disusun otomatis dari catatan pengeluaran di finoch.id.</p>
      </div>
    </Note>
  );
}
