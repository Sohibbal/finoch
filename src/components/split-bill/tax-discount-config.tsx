"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { SplitBillConfig, SplitBillResult } from "@/types/split-bill-types";
import { rupiah } from "@/lib/format";
import { FIELD_CLASS, LABEL_CLASS, OptionButton } from "@/components/press/kampus-press";

interface TaxDiscountConfigProps {
  config: SplitBillConfig;
  onChange: (updated: Partial<SplitBillConfig>) => void;
  result: SplitBillResult;
}

const TAX_PRESETS = [0, 10, 11];
const SERVICE_PRESETS = [0, 5, 7];
const ROUNDING_PRESETS = [
  { label: "Pas", value: 0 },
  { label: "100", value: 100 },
  { label: "500", value: 500 },
  { label: "1.000", value: 1000 },
];

function Line({ label, amount, sign = "" }: { label: string; amount: number; sign?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-body">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="money text-ink">
        {sign}
        {rupiah(amount)}
      </dd>
    </div>
  );
}

/** The nota's footer: PB1 / service / diskon lines and the total, with the knobs folded underneath. */
export function TaxDiscountConfig({ config, onChange, result }: TaxDiscountConfigProps) {
  const settingsSummary = [
    `PB1 ${config.taxPercentage}%`,
    `service ${config.servicePercentage}%`,
    config.discountAmount > 0 ? `diskon ${rupiah(config.discountAmount)}` : null,
    config.rounding > 0 ? `bulat ${config.rounding.toLocaleString("id-ID")}` : "tanpa pembulatan",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-4">
      <dl className="space-y-1.5">
        <Line label="Subtotal" amount={result.subtotal} />
        {result.totalTax > 0 && <Line label={`PB1 ${config.taxPercentage}%`} amount={result.totalTax} sign="+" />}
        {result.totalService > 0 && (
          <Line label={`Service ${config.servicePercentage}%`} amount={result.totalService} sign="+" />
        )}
        {result.totalDiscount > 0 && <Line label="Diskon" amount={result.totalDiscount} sign="−" />}
        <div className="flex items-baseline justify-between gap-3 pt-2 mt-2 border-t-[3px] border-double border-ink/60">
          <dt className="text-body font-bold text-ink">Total ke kasir</dt>
          <dd className="money font-display text-head font-bold text-ink">{rupiah(result.grandTotal)}</dd>
        </div>
        {result.roundingSurplus > 0 && (
          <p className="text-meta text-ink-soft">
            Setelah dibulatkan, jumlah semua sobekan lebih {rupiah(result.roundingSurplus)} dari total kasir.
          </p>
        )}
      </dl>

      <details className="group border-t border-ink/15 pt-1">
        <summary className="flex items-center justify-between gap-3 min-h-11 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="min-w-0">
            <span className="block text-body font-semibold text-ink">Atur pajak, diskon & rekening</span>
            <span className="block text-meta text-ink-soft">{settingsSummary}</span>
          </span>
          <ChevronDown
            className="w-5 h-5 shrink-0 text-ink motion-safe:transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>

        <div className="pt-3 pb-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <fieldset>
              <legend className={LABEL_CLASS}>Pajak resto (PB1)</legend>
              <div className="grid grid-cols-3">
                {TAX_PRESETS.map((pct, i) => (
                  <OptionButton
                    key={pct}
                    pressed={config.taxPercentage === pct}
                    onClick={() => onChange({ taxPercentage: pct })}
                    className={`money ${i ? "-ml-px" : ""}`}
                  >
                    {pct}%
                  </OptionButton>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={LABEL_CLASS}>Service charge</legend>
              <div className="grid grid-cols-3">
                {SERVICE_PRESETS.map((pct, i) => (
                  <OptionButton
                    key={pct}
                    pressed={config.servicePercentage === pct}
                    onClick={() => onChange({ servicePercentage: pct })}
                    className={`money ${i ? "-ml-px" : ""}`}
                  >
                    {pct}%
                  </OptionButton>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="split-discount" className={LABEL_CLASS}>
                Diskon / promo (Rp)
              </label>
              <input
                id="split-discount"
                type="number"
                inputMode="numeric"
                min="0"
                value={config.discountAmount || ""}
                onChange={(e) => onChange({ discountAmount: Number(e.target.value) || 0 })}
                placeholder="0"
                className={`${FIELD_CLASS} money`}
              />
            </div>

            <fieldset>
              <legend className={LABEL_CLASS}>Bulatkan transfer ke</legend>
              <div className="grid grid-cols-4">
                {ROUNDING_PRESETS.map((r, i) => (
                  <OptionButton
                    key={r.value}
                    pressed={config.rounding === r.value}
                    onClick={() => onChange({ rounding: r.value })}
                    className={`money px-1 ${i ? "-ml-px" : ""}`}
                  >
                    {r.label}
                  </OptionButton>
                ))}
              </div>
            </fieldset>
          </div>

          <div>
            <label htmlFor="split-payment-note" className={LABEL_CLASS}>
              Rekening / e-wallet tujuan (ikut di pesan WhatsApp)
            </label>
            <input
              id="split-payment-note"
              type="text"
              value={config.paymentNote || ""}
              onChange={(e) => onChange({ paymentNote: e.target.value })}
              placeholder="BCA 1234567890 a.n. Diki / GoPay 0812…"
              className={FIELD_CLASS}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
