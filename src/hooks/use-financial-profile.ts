"use client";

import { useEffect, useState } from "react";
import { getStorage, getStorageScope } from "@/lib/storage/local-storage";

export interface FinancialProfileValues {
  monthlyIncome: number;
  fixedExpenses: number;
  savings: number;
}

// Last good profile per user, so a cold start offline (the "airplane mode" demo) still has numbers.
const PROFILE_CACHE_KEY = "finoch_financial_profile";

function readCachedProfile(): FinancialProfileValues | null {
  try {
    const raw = getStorage()?.getItem(PROFILE_CACHE_KEY);
    return raw ? (JSON.parse(raw) as FinancialProfileValues) : null;
  } catch {
    return null;
  }
}

function writeCachedProfile(profile: FinancialProfileValues | null): void {
  try {
    if (profile) getStorage()?.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    else getStorage()?.removeItem(PROFILE_CACHE_KEY);
  } catch {
    // Storage full or blocked: the live value still works for this load.
  }
}

// One request per app load and user; a failed request is dropped so the next mount retries.
let cached: { scope: string; promise: Promise<FinancialProfileValues | null> } | null = null;

/** The user's onboarding profile from GET /api/profile; null when they have not onboarded yet. */
export function loadFinancialProfile(): Promise<FinancialProfileValues | null> {
  const scope = getStorageScope();
  if (cached?.scope === scope) return cached.promise;
  const promise = fetch("/api/profile")
    .then(async (res) => {
      if (!res.ok) throw new Error(`Gagal memuat profil (HTTP ${res.status})`);
      const { profile } = await res.json();
      const values = profile
        ? {
            monthlyIncome: Number(profile.monthlyIncome) || 0,
            fixedExpenses: Number(profile.monthlyFixedExpenses) || 0,
            savings: Number(profile.currentSavings) || 0,
          }
        : null;
      writeCachedProfile(values);
      return values;
    })
    .catch((err) => {
      // Offline or server error: fall back to the last profile this user loaded on this device.
      const fallback = readCachedProfile();
      if (fallback) return fallback;
      throw err;
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
