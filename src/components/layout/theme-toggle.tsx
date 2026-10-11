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

  if (!mounted) {
    return (
      <div
        className={`w-11 h-11 rounded-full border border-ink/20 bg-transparent ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      className={`inline-flex items-center justify-center gap-2 min-w-11 h-11 px-3 rounded-full text-ink hover:bg-ink/5 border border-ink/20 transition-colors ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 shrink-0" />
      ) : (
        <Moon className="w-4 h-4 shrink-0" />
      )}
      {showLabel && (
        <span className="text-meta font-medium">
          {isDark ? "Mode Terang" : "Mode Gelap"}
        </span>
      )}
    </button>
  );
}
