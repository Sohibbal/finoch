// tests/hooks/use-auth.test.ts
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, resetHooks } from "./react-harness";

const calls: string[] = [];
const mocks = vi.hoisted(() => ({
  claimGuestExpenses: vi.fn(),
  setAuthenticated: vi.fn(),
  triggerSync: vi.fn(),
  clearUserSyncState: vi.fn(),
}));
vi.mock("react", () => import("./react-harness"));
vi.mock("@/lib/storage/expense-storage", () => ({ expenseStorage: { claimGuestExpenses: mocks.claimGuestExpenses } }));
vi.mock("@/lib/sync/sync-manager", () => ({
  syncManager: {
    setAuthenticated: mocks.setAuthenticated,
    triggerSync: mocks.triggerSync,
    clearUserSyncState: mocks.clearUserSyncState,
  },
}));

import { useAuth } from "@/hooks/use-auth";
import { getStorageScope } from "@/lib/storage/local-storage";

let store: Map<string, string>;
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

function reply(body: unknown, ok = true) {
  return { ok, status: ok ? 200 : 401, json: async () => body };
}

beforeEach(() => {
  resetHooks();
  calls.length = 0;
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  });
  mocks.claimGuestExpenses.mockReset().mockImplementation(async () => { calls.push(`claim:${getStorageScope()}`); return 0; });
  mocks.setAuthenticated.mockReset().mockImplementation((status: boolean) => calls.push(`auth:${status}:${getStorageScope()}`));
  mocks.triggerSync.mockReset().mockImplementation(async () => { calls.push(`sync:${getStorageScope()}`); return true; });
  mocks.clearUserSyncState.mockReset().mockImplementation(async (userId: string) => { calls.push(`clear:${userId}`); });
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("useAuth", () => {
  it("login claims guest expenses before switching scope and authenticating, with no extra sync", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(reply({ user: null }))
      .mockResolvedValueOnce(reply({ user: { id: "user-a" } }));
    vi.stubGlobal("fetch", fetchMock);
    const auth = renderHook(useAuth);
    await flush();
    calls.length = 0;

    expect(await auth.login("a@x.id", "rahasia")).toBe(true);
    expect(calls).toEqual(["claim:guest", "auth:true:user-a"]);
    expect(getStorageScope()).toBe("user-a");
  });

  it("register follows the same order", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(reply({ user: null }))
      .mockResolvedValueOnce(reply({ user: { id: "user-b" } })));
    const auth = renderHook(useAuth);
    await flush();
    calls.length = 0;

    expect(await auth.register("b@x.id", "rahasia", "B")).toBe(true);
    expect(calls).toEqual(["claim:guest", "auth:true:user-b"]);
  });

  it("logout flushes once, stops sync, clears that user's queue and cursor, then switches to guest", async () => {
    store.set("finoch_storage_scope", "user-a");
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(reply({ user: { id: "user-a" } }))
      .mockResolvedValueOnce(reply({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const auth = renderHook(useAuth);
    await flush();
    calls.length = 0;

    await auth.logout();
    expect(calls).toEqual(["sync:user-a", "auth:false:user-a", "clear:user-a"]);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/auth/logout");
    expect(getStorageScope()).toBe("guest");
  });

  it("session check switches to guest when the server reports no user, but keeps scope when offline", async () => {
    store.set("finoch_storage_scope", "user-a");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    renderHook(useAuth);
    await flush();
    expect(getStorageScope()).toBe("user-a");

    resetHooks();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply({ user: null })));
    renderHook(useAuth);
    await flush();
    expect(getStorageScope()).toBe("guest");
  });
});
