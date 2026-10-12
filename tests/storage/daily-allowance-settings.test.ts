import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  DEFAULT_DAILY_ALLOWANCE,
  DAILY_ALLOWANCE_STORAGE_KEY,
  DAILY_ALLOWANCE_CHANGED_EVENT,
  getDailyAllowanceSetting,
  setDailyAllowanceSetting,
} from "@/lib/storage/daily-allowance-settings";

describe("Daily Allowance Settings Storage", () => {
  let store: Map<string, string>;
  let eventListeners: Record<string, ((e: Event) => void)[]>;

  beforeEach(() => {
    store = new Map<string, string>();
    eventListeners = {};

    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
    });

    vi.stubGlobal("window", {
      dispatchEvent: (event: Event) => {
        const listeners = eventListeners[event.type] || [];
        listeners.forEach((fn) => fn(event));
        return true;
      },
      addEventListener: (type: string, fn: (e: Event) => void) => {
        if (!eventListeners[type]) eventListeners[type] = [];
        eventListeners[type].push(fn);
      },
      removeEventListener: (type: string, fn: (e: Event) => void) => {
        if (!eventListeners[type]) return;
        eventListeners[type] = eventListeners[type].filter((cb) => cb !== fn);
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns default daily allowance when not configured", () => {
    expect(getDailyAllowanceSetting()).toBe(DEFAULT_DAILY_ALLOWANCE);
  });

  it("saves and retrieves user configured daily allowance", () => {
    setDailyAllowanceSetting(75000);
    expect(getDailyAllowanceSetting()).toBe(75000);
  });

  it("enforces minimum allowance limit of 1000", () => {
    setDailyAllowanceSetting(-500);
    expect(getDailyAllowanceSetting()).toBe(1000);
  });

  it("handles invalid storage values gracefully by returning default", () => {
    store.set(DAILY_ALLOWANCE_STORAGE_KEY, "invalid-amount");
    expect(getDailyAllowanceSetting()).toBe(DEFAULT_DAILY_ALLOWANCE);
  });

  it("dispatches change event when setting updated", () => {
    let capturedEvent: CustomEvent | null = null;
    const listener = (e: Event) => {
      capturedEvent = e as CustomEvent;
    };

    window.addEventListener(DAILY_ALLOWANCE_CHANGED_EVENT, listener);
    setDailyAllowanceSetting(120000);

    expect(capturedEvent).not.toBeNull();
    expect(capturedEvent?.detail?.allowance).toBe(120000);

    window.removeEventListener(DAILY_ALLOWANCE_CHANGED_EVENT, listener);
  });
});
