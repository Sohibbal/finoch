import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { renderHook, resetHooks, unmountHooks } from "./react-harness";
vi.mock("react", () => import("./react-harness"));
import { useFinancialProfile, loadFinancialProfile, invalidateFinancialProfile } from "@/hooks/use-financial-profile";
import { setStorageScope } from "@/lib/storage/local-storage";

const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
const profileResponse = (profile: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: async () => ({ profile }) });
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resetHooks(); invalidateFinancialProfile();
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) });
  setStorageScope("user-1");
  fetchMock = vi.fn(() => profileResponse({ monthlyIncome: 3200000, monthlyFixedExpenses: 1100000, currentSavings: 750000 }));
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => { unmountHooks(); vi.unstubAllGlobals(); });

it("loads the profile once per app load and exposes the real numbers", async () => {
  expect(renderHook(useFinancialProfile)).toMatchObject({ loading: true, monthlyIncome: null });
  await flush();
  expect(renderHook(useFinancialProfile)).toEqual({
    loading: false, error: false, hasProfile: true, monthlyIncome: 3200000, fixedExpenses: 1100000, savings: 750000,
  });
  await loadFinancialProfile();
  await loadFinancialProfile();
  expect(fetchMock).toHaveBeenCalledOnce();
});

it("refetches for another user and after the profile is saved", async () => {
  await loadFinancialProfile();
  setStorageScope("user-2");
  await loadFinancialProfile();
  invalidateFinancialProfile();
  await loadFinancialProfile();
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

it("never falls back to made-up numbers when the request fails, and retries next time", async () => {
  fetchMock.mockImplementationOnce(() => profileResponse(null, 500));
  renderHook(useFinancialProfile);
  await flush();
  expect(renderHook(useFinancialProfile)).toEqual({
    loading: false, error: true, hasProfile: false, monthlyIncome: null, fixedExpenses: null, savings: null,
  });
  await expect(loadFinancialProfile()).resolves.toMatchObject({ monthlyIncome: 3200000 });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it("reports a user without a profile so pages can link to onboarding", async () => {
  fetchMock.mockImplementation(() => profileResponse(null));
  renderHook(useFinancialProfile);
  await flush();
  expect(renderHook(useFinancialProfile)).toMatchObject({ loading: false, error: false, hasProfile: false, monthlyIncome: null });
});
