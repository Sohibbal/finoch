"use client";

import React from "react";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { isDark, mounted, toggleTheme } = useTheme();

  const baseClasses = showLabel
    ? "inline-flex items-center justify-center gap-2 h-9 px-3 rounded-xl border border-blue-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs"
    : "inline-flex items-center justify-center w-9 h-9 rounded-xl border border-blue-200/70 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-2xs";

  if (!mounted) {
    return (
      <div
        className={`${baseClasses} opacity-0 pointer-events-none ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      className={`${baseClasses} ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 shrink-0" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? "Mode Terang" : "Mode Gelap"}
        </span>
      )}
    </button>
  );
}

