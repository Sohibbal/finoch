"use client";

import React from "react";
import { Sliders, Percent, Store, CreditCard } from "lucide-react";
import { SplitBillConfig } from "@/types/split-bill-types";

interface TaxDiscountConfigProps {
  config: SplitBillConfig;
  onChange: (updated: Partial<SplitBillConfig>) => void;
}

export function TaxDiscountConfig({ config, onChange }: TaxDiscountConfigProps) {
  const taxPresets = [0, 10, 11];
  const servicePresets = [0, 5, 7];
  const roundingPresets = [
    { label: "Pas (0)", value: 0 },
    { label: "100", value: 100 },
    { label: "500", value: 500 },
    { label: "1.000", value: 1000 },
  ];

  return (
    <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs sm:text-sm font-bold text-navy-950 dark:text-cream-50 uppercase tracking-wider">
            Pengaturan Pajak & Tagihan
          </h2>
        </div>
      </div>

      <div className="space-y-3">
        {/* Restaurant Name */}
        <div>
          <label className="block text-[11px] font-bold text-navy-600 dark:text-cream-300/80 mb-1">
            Nama Tempat / Resto
          </label>
          <div className="relative">
            <Store className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 dark:text-cream-400" />
            <input
              type="text"
              value={config.restaurantName}
              onChange={(e) => onChange({ restaurantName: e.target.value })}
              placeholder="Contoh: Bebek Sinjay / Kopi Nako"
              className="w-full pl-9 pr-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 placeholder:text-navy-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>

        {/* Mode Split: Itemized vs Equal */}
        <div>
          <label className="block text-[11px] font-bold text-navy-600 dark:text-cream-300/80 mb-1">
            Metode Pembagian
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChange({ mode: "itemized" })}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                config.mode === "itemized"
                  ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                  : "bg-cream-50 dark:bg-navy-950 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-800 hover:bg-cream-100 dark:hover:bg-navy-800"
              }`}
            >
              Bagi per Menu (Adil)
            </button>
            <button
              type="button"
              onClick={() => onChange({ mode: "equal" })}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                config.mode === "equal"
                  ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                  : "bg-cream-50 dark:bg-navy-950 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-800 hover:bg-cream-100 dark:hover:bg-navy-800"
              }`}
            >
              Bagi Rata (Equal)
            </button>
          </div>
        </div>

        {/* Tax PB1 & Service Charge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Tax PB1 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-navy-600 dark:text-cream-300/80 flex items-center gap-1">
                <Percent className="w-3 h-3" /> Pajak Resto (PB1)
              </span>
              <span className="text-xs font-bold text-navy-950 dark:text-cream-50">
                {config.taxPercentage}%
              </span>
            </div>
            <div className="flex gap-1.5">
              {taxPresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onChange({ taxPercentage: pct })}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    config.taxPercentage === pct
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-cream-50 dark:bg-navy-950 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-800"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Service Charge */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-navy-600 dark:text-cream-300/80 flex items-center gap-1">
                <Percent className="w-3 h-3" /> Service Charge
              </span>
              <span className="text-xs font-bold text-navy-950 dark:text-cream-50">
                {config.servicePercentage}%
              </span>
            </div>
            <div className="flex gap-1.5">
              {servicePresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => onChange({ servicePercentage: pct })}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    config.servicePercentage === pct
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-cream-50 dark:bg-navy-950 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-800"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Discount & Rounding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Diskon */}
          <div>
            <label className="block text-[11px] font-bold text-navy-600 dark:text-cream-300/80 mb-1">
              Potongan Diskon / Promo (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={config.discountAmount || ""}
              onChange={(e) => onChange({ discountAmount: Number(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 placeholder:text-navy-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Rounding */}
          <div>
            <label className="block text-[11px] font-bold text-navy-600 dark:text-cream-300/80 mb-1">
              Bulatkan Nominal Transfer Ke
            </label>
            <div className="flex gap-1">
              {roundingPresets.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => onChange({ rounding: r.value })}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    config.rounding === r.value
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-cream-50 dark:bg-navy-950 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-800"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Account Note */}
        <div className="pt-1">
          <label className="block text-[11px] font-bold text-navy-600 dark:text-cream-300/80 mb-1">
            Rekening / E-Wallet Tujuan (Tercantum di pesan WhatsApp)
          </label>
          <div className="relative">
            <CreditCard className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 dark:text-cream-400" />
            <input
              type="text"
              value={config.paymentNote || ""}
              onChange={(e) => onChange({ paymentNote: e.target.value })}
              placeholder="Contoh: BCA 1234567890 a.n Diki / GoPay 081234567890"
              className="w-full pl-9 pr-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 placeholder:text-navy-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
