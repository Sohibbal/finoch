"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function readTheme(): Theme | null {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem("finoch_theme");
    if (saved === null) {
      saved = localStorage.getItem("voicash_theme") || localStorage.getItem("finra_theme");
      if (saved === "light" || saved === "dark") {
        localStorage.setItem("finoch_theme", saved);
      }
    }
  } catch {
    // Storage may be unavailable; keep the theme usable for this session.
  }
  return saved === "light" || saved === "dark" ? saved : null;
}

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = readTheme();
    if (saved) document.documentElement.classList.toggle("dark", saved === "dark");
    const syncTheme = () => setIsDark(document.documentElement.classList.contains("dark"));
    syncTheme();
    setMounted(true);
    window.addEventListener("finoch-theme-change", syncTheme);
    return () => window.removeEventListener("finoch-theme-change", syncTheme);
  }, []);

  const toggleTheme = () => {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    setIsDark(nextDark);
    try {
      localStorage.setItem("finoch_theme", nextDark ? "dark" : "light");
    } catch {
      // Applying the theme must not depend on storage permissions.
    }
    window.dispatchEvent(new Event("finoch-theme-change"));
  };

  return { isDark, mounted, toggleTheme };
}
