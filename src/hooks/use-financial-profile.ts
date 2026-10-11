"use client";

import { useEffect, useState } from "react";
import { getStorageScope } from "@/lib/storage/local-storage";

export interface FinancialProfileValues {
  monthlyIncome: number;
  fixedExpenses: number;
  savings: number;
}

// One request per app load and user; a failed request is dropped so the next mount retries.
let cached: { scope: string; promise: Promise<FinancialProfileValues | null> } | null = null;

/** The user's onboarding profile from GET /api/profile; null when they have not onboarded yet. */
export function loadFinancialProfile(): Promise<FinancialProfileValues | null> {
  const scope = getStorageScope();
  if (cached?.scope === scope) return cached.promise;
  const promise = fetch("/api/profile").then(async (res) => {
    if (!res.ok) throw new Error(`Gagal memuat profil (HTTP ${res.status})`);
    const { profile } = await res.json();
    if (!profile) return null;
    return {
      monthlyIncome: Number(profile.monthlyIncome) || 0,
      fixedExpenses: Number(profile.monthlyFixedExpenses) || 0,
      savings: Number(profile.currentSavings) || 0,
    };
  });
  promise.catch(() => {
    if (cached?.promise === promise) cached = null;
  });
  cached = { scope, promise };
  return promise;
}

/** Call after the profile is saved so pages pick up the new numbers. */
export function invalidateFinancialProfile(): void {
  cached = null;
}

/**
 * Numbers stay null while loading, when the user has no profile, or when the request failed:
 * pages show skeletons / an onboarding link instead of made-up amounts.
 */
export function useFinancialProfile() {
  const [state, setState] = useState<{ loading: boolean; profile: FinancialProfileValues | null; error: boolean }>({
    loading: true,
    profile: null,
    error: false,
  });

  useEffect(() => {
    let active = true;
    loadFinancialProfile().then(
      (profile) => active && setState({ loading: false, profile, error: false }),
      () => active && setState({ loading: false, profile: null, error: true })
    );
    return () => {
      active = false;
    };
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    hasProfile: state.profile !== null,
    monthlyIncome: state.profile?.monthlyIncome ?? null,
    fixedExpenses: state.profile?.fixedExpenses ?? null,
    savings: state.profile?.savings ?? null,
  };
}
