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
    <div className="bg-white dark:bg-[#070E1A] rounded-2xl p-5 border border-cream-300 dark:border-navy-800 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs sm:text-sm font-bold text-navy-950 dark:text-cream-50">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-navy-600 dark:text-cream-300/70 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <div className="text-xs font-black text-navy-950 dark:text-cream-50 bg-cream-100 dark:bg-navy-900 px-3 py-1 rounded-full border border-cream-300 dark:border-navy-800">
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
        className="w-full h-2 bg-cream-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-navy-900 dark:accent-cream-100"
      />

      <div className="flex justify-between text-[11px] text-navy-400 dark:text-cream-400/60 font-medium">
        <span>{formatValue ? formatValue(min) : min.toLocaleString("id-ID")}</span>
        <span>{formatValue ? formatValue(max) : max.toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
}
