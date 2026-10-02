"use client";

import React from "react";

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

export function ScenarioSlider({
  label,
  description,
  value,
  min,
  max,
  step,
  unit = "IDR",
  onChange,
  formatValue,
}: ScenarioSliderProps) {
  const displayVal = formatValue
    ? formatValue(value)
    : unit === "IDR"
    ? `Rp ${value.toLocaleString("id-ID")}`
    : `${value} ${unit}`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
          {displayVal}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />

      <div className="flex justify-between text-[11px] text-slate-400">
        <span>{formatValue ? formatValue(min) : min.toLocaleString("id-ID")}</span>
        <span>{formatValue ? formatValue(max) : max.toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
}
