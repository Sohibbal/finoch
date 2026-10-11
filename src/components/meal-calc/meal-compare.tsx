"use client";

import React from "react";
import { MealCalcConfig, MealCalcResult } from "@/types/meal-calc-types";
import { rupiah } from "@/lib/format";
import { Guilloche } from "@/components/press/guilloche";
import { useRolledNumber } from "@/components/press/rolling-numeral";
import { DENOM, LABEL_CLASS, OptionButton, Perforation, Stamp } from "@/components/press/kampus-press";

interface MealCompareProps {
  config: MealCalcConfig;
  result: MealCalcResult;
  onChangeMealsPerDay: (count: number) => void;
  onChangeOutsideCost: (cost: number) => void;
}

const WARTEG_PRICES = [
  { cost: 12000, label: "12rb", hint: "warteg" },
  { cost: 16000, label: "16rb", hint: "standar" },
  { cost: 22000, label: "22rb", hint: "geprek/kafe" },
];

const MEAL_PREP_TIPS = [
  "Masak nasi 1 cup tiap pagi di magic com kos.",
  "Rebus 8 telur sekaligus, simpan di kulkas buat sarapan kilat.",
  "Siang beli sayur warteg tanpa nasi biar gizinya tetap imbang.",
];

function NotaLine({ label, amount, strong = false }: { label: React.ReactNode; amount: number; strong?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 text-body">
      <dt className={`min-w-0 break-words ${strong ? "font-bold text-ink" : "text-ink"}`}>{label}</dt>
      <span aria-hidden="true" className="flex-1 min-w-4 border-b border-dotted border-ink/40 translate-y-[-4px]" />
      <dd className={`money whitespace-nowrap ${strong ? "font-bold text-ink" : "text-ink"}`}>{rupiah(amount)}</dd>
    </div>
  );
}

function Nota({ title, meta, children }: { title: string; meta: string; children: React.ReactNode }) {
  return (
    <article className="bg-paper-sheet border border-ink/20 flex flex-col" aria-label={title}>
      <div className="px-5 pt-5 pb-3 text-center border-b-[3px] border-double border-ink/40">
        <h3 className="font-display text-head font-bold text-ink">{title}</h3>
        <p className="text-meta text-ink-soft">{meta}</p>
      </div>
      <dl className="flex-1 px-5 py-4 space-y-1.5">{children}</dl>
      <Perforation />
      <div className="h-3" />
    </article>
  );
}

/** Warteg nota next to the masak-sendiri shopping nota, with the difference printed as a teal note. */
export function MealCompare({ config, result, onChangeMealsPerDay, onChangeOutsideCost }: MealCompareProps) {
  const savings = useRolledNumber(result.monthlySavingsCooking);
  const portionsPerWeek = config.mealsPerDay * config.daysPerWeek;
  const note = DENOM.teal;

  return (
    <div className="space-y-8">
      <section aria-labelledby="meal-pattern-title" className="flex flex-wrap gap-x-8 gap-y-4 items-end">
        <h2 id="meal-pattern-title" className="sr-only">
          Pola makanmu
        </h2>
        <fieldset>
          <legend className={LABEL_CLASS}>Makan sehari</legend>
          <div className="grid grid-cols-3">
            {[1, 2, 3].map((num, i) => (
              <OptionButton
                key={num}
                pressed={config.mealsPerDay === num}
                onClick={() => onChangeMealsPerDay(num)}
                className={`money min-w-14 ${i ? "-ml-px" : ""}`}
              >
                {num}×
              </OptionButton>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className={LABEL_CLASS}>Sekali makan di luar</legend>
          <div className="grid grid-cols-3">
            {WARTEG_PRICES.map((p, i) => (
              <OptionButton
                key={p.cost}
                pressed={config.outsideMealCost === p.cost}
                onClick={() => onChangeOutsideCost(p.cost)}
                aria-label={`Rp ${p.cost.toLocaleString("id-ID")}, ${p.hint}`}
                className={`leading-tight py-1 ${i ? "-ml-px" : ""}`}
              >
                <span className="money block">{p.label}</span>
                <span className="block text-meta font-normal opacity-80">{p.hint}</span>
              </OptionButton>
            ))}
          </div>
        </fieldset>
      </section>

      <section aria-labelledby="meal-verdict-title" className={`relative overflow-hidden ${note.field} ${note.ink} px-5 sm:px-8 py-6`}>
        <Guilloche seed={0x3a7e} size={220} families={3} className="absolute -right-14 -bottom-16 !text-navy-900 opacity-30" />
        <div className="relative space-y-1">
          <h2 id="meal-verdict-title" className="text-body font-semibold">
            Masak sendiri hemat sebulan
          </h2>
          <p className="font-display font-bold money flex flex-wrap items-baseline gap-x-2">
            <span className="text-head">Rp</span>
            <span className="text-numeral" aria-hidden="true">
              {savings.toLocaleString("id-ID")}
            </span>
            <span className="sr-only">{result.monthlySavingsCooking.toLocaleString("id-ID")}</span>
          </p>
          <p className={`text-body ${note.soft}`}>
            {result.savingsPercentageCooking}% lebih murah dari makan di luar terus · setahun{" "}
            <span className="money font-semibold">{rupiah(result.annualSavingsCooking)}</span>
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <Nota title="Nota warteg" meta={`${config.mealsPerDay}× sehari, beli di luar terus · waktu masak 0 menit`}>
          <NotaLine label="Nasi + lauk, per porsi" amount={result.outsideCostPerMeal} />
          <NotaLine label={`Seminggu · ${portionsPerWeek} porsi`} amount={result.weeklyOutsideSpend} />
          <div className="pt-2 mt-2 border-t-[3px] border-double border-ink/60">
            <NotaLine label="Sebulan" amount={result.monthlyOutsideSpend} strong />
          </div>
        </Nota>

        <Nota title="Belanja masak sendiri" meta="Harga pasar & grosir mini · masak 20–30 menit sehari">
          {config.items.map((item) => (
            <NotaLine
              key={item.id}
              label={
                <>
                  {item.name}
                  <span className="block text-meta text-ink-soft">
                    {rupiah(item.price)} per {item.unit} · {item.servingsYield} porsi
                  </span>
                </>
              }
              amount={Math.round(item.price / Math.max(1, item.servingsYield))}
            />
          ))}
          <div className="pt-2 mt-2 border-t border-dashed border-ink/30 space-y-1.5">
            <NotaLine label="Satu porsi lengkap" amount={result.cookCostPerMeal} />
            <NotaLine label={`Seminggu · ${portionsPerWeek} porsi`} amount={result.weeklyCookSpend} />
          </div>
          <div className="pt-2 mt-2 border-t-[3px] border-double border-ink/60">
            <NotaLine label="Sebulan" amount={result.monthlyCookSpend} strong />
          </div>
        </Nota>
      </div>

      <section aria-labelledby="meal-hybrid-title" className="bg-paper-sheet border border-dashed border-ink/40 px-5 sm:px-8 py-5 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id="meal-hybrid-title" className="font-display text-head font-bold text-ink">
            Jalan tengah anak kos
          </h2>
          <Stamp label={`Hemat ${rupiah(result.monthlySavingsHybrid)}/bln`} tone="aman" />
        </div>
        <p className="text-body text-ink max-w-prose">
          Malas cuci wajan? Masak nasi saja di magic com, lauk dan sayur beli di warteg tanpa nasi. Sekitar 5 menit sehari,{" "}
          <span className="money font-semibold">{rupiah(result.hybridCostPerMeal)}</span> per porsi, sebulan{" "}
          <span className="money font-semibold">{rupiah(result.monthlyHybridSpend)}</span>.
        </p>
      </section>

      <section aria-labelledby="meal-advice-title" className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2">
          <h2 id="meal-advice-title" className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">
            Saran buat kamu
          </h2>
          <p className="text-body text-ink max-w-prose">{result.tacticalAdvice}</p>
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-head font-bold text-ink border-b border-ink/20 pb-2">Meal prep 30 menit akhir pekan</h2>
          <ol className="divide-y divide-dashed divide-ink/20">
            {MEAL_PREP_TIPS.map((tip, i) => (
              <li key={tip} className="flex gap-3 py-2 text-body text-ink">
                <span className="money font-display font-bold text-ink-soft">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
