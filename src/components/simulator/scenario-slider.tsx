"use client";

import React, { useId } from "react";
import { rupiah } from "@/lib/format";

interface ScenarioSliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

/** One scenario knob printed as a ledger line: label, amount, the slider as an ink rule. */
export function ScenarioSlider({ label, description, value, min, max, step, unit = "IDR", onChange, formatValue }: ScenarioSliderProps) {
  const id = useId();
  const format = formatValue ?? ((v: number) => (unit === "IDR" ? rupiah(v) : `${v} ${unit}`));

  return (
    <div className="py-4 border-b border-ink/15 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <label htmlFor={id} className="text-body font-semibold text-ink">
          {label}
        </label>
        <output htmlFor={id} className="money text-body font-bold text-ink">
          {format(value)}
        </output>
      </div>
      {description && <p className="text-meta text-ink-soft">{description}</p>}
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-11 cursor-pointer accent-[rgb(var(--ink))]"
      />
      <div className="flex justify-between text-meta text-ink-soft money">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
