import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createFakeDocumentDb } from "./fake-document-db";

const db = vi.hoisted(() => ({ current: null as any }));
vi.mock("@/lib/prisma", () => ({
  prisma: { userDocument: new Proxy({}, { get: (_t, name) => (...args: any[]) => db.current.userDocument[name](...args) }) },
}));
vi.mock("@/lib/auth/jwt", () => ({ getSessionFromRequest: vi.fn(async () => ({ userId: "user-1" })) }));

import { POST } from "@/app/api/sync/documents/route";
import { SyncManager, syncDocuments } from "@/lib/sync/sync-manager";
import { DATA_PULLED_EVENT } from "@/lib/sync/document-keys";
import { getStorage, readDocumentMeta, setDemoMode, setStorageScope } from "@/lib/storage/local-storage";
import { getEnvelopes } from "@/lib/storage/budget-storage";

const WALLETS = "finoch_student_wallets_v1";
const ENVELOPES = "finoch_budget_envelopes_v1";

/** One device = one localStorage. Switching devices swaps the global the storage helpers read. */
function createDevice() {
  const store = new Map<string, string>();
  return {
    use() {
      vi.stubGlobal("localStorage", {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => void store.set(key, value),
        removeItem: (key: string) => void store.delete(key),
      });
    },
  };
}

/** Two devices of user-1 that each finished their first sync. */
async function twoSyncedDevices() {
  const phone = createDevice();
  const laptop = createDevice();
  for (const device of [phone, laptop]) {
    device.use();
    setStorageScope("user-1");
    await syncDocuments("user-1");
  }
  return { phone, laptop };
}

const events: string[] = [];
let clock = new Date("2026-10-11T10:00:00.000Z").getTime();
function tick(ms = 60_000) {
  clock += ms;
  vi.setSystemTime(clock);
}

function local(key: string) {
  return JSON.parse(localStorage.getItem(`${key}::user-1`)!);
}

function serverDoc(key: string) {
  return db.current.rows.find((r: any) => r.key === key);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(clock);
  db.current = createFakeDocumentDb();
  events.length = 0;
  vi.stubGlobal("window", { dispatchEvent: (e: Event) => events.push(e.type) });
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => POST(new Request(`http://localhost${url}`, init)));
});
afterEach(() => vi.unstubAllGlobals());

describe("dirty tracking in getStorage", () => {
  it("tracks only allowlisted feature keys of a real logged-in user", () => {
    createDevice().use();
    setStorageScope("user-1");
    localStorage.setItem("finoch_doc_cursor::user-1", "2026-10-11T09:00:00.000Z");
    getStorage()!.setItem(WALLETS, "[]");
    getStorage()!.setItem("finoch_financial_profile", "{}");
    expect(readDocumentMeta("user-1")).toEqual({ [WALLETS]: { updatedAt: clock, dirty: true } });

    getStorage()!.removeItem(WALLETS);
    expect(readDocumentMeta("user-1")[WALLETS].dirty).toBe(true);
  });

  it("never tracks guest or demo data", () => {
    createDevice().use();
    setStorageScope(null);
    getStorage()!.setItem(WALLETS, "[]");
    expect(readDocumentMeta("guest")).toEqual({});

    setStorageScope("user-1");
    setDemoMode(true);
    getStorage()!.setItem(WALLETS, "[]");
    expect(readDocumentMeta("user-1")).toEqual({});
  });

  it("stamps writes made before the device's first pull as 0 so the server copy wins", () => {
    createDevice().use();
    setStorageScope("user-1");
    getStorage()!.setItem(WALLETS, "[]");
    expect(readDocumentMeta("user-1")[WALLETS]).toEqual({ updatedAt: 0, dirty: true });
  });
});

describe("syncDocuments across two devices", () => {
  it("uploads existing local data on first login and a fresh device pulls it without clobbering", async () => {
    const phone = createDevice();
    phone.use();
    // Data from before sync existed (or legacy-migrated) is written outside getStorage.
    localStorage.setItem(`${WALLETS}::user-1`, JSON.stringify([{ id: "dompet" }]));
    setStorageScope("user-1");
    getStorage()!.setItem(ENVELOPES, JSON.stringify([{ id: "custom-envelope" }]));
    await syncDocuments("user-1");
    expect(serverDoc(WALLETS).data).toEqual([{ id: "dompet" }]);
    expect(serverDoc(ENVELOPES).data).toEqual([{ id: "custom-envelope" }]);
    expect(Object.values(readDocumentMeta("user-1")).every((m) => !m.dirty)).toBe(true);

    tick();
    createDevice().use();
    setStorageScope("user-1");
    // The budget page seeds its template before the first sync answers.
    expect(getEnvelopes(1_500_000).length).toBeGreaterThan(1);
    await syncDocuments("user-1");

    expect(serverDoc(ENVELOPES).data).toEqual([{ id: "custom-envelope" }]);
    expect(local(ENVELOPES)).toEqual([{ id: "custom-envelope" }]);
    expect(local(WALLETS)).toEqual([{ id: "dompet" }]);
    expect(readDocumentMeta("user-1")[ENVELOPES].dirty).toBe(false);
    expect(events).toContain(DATA_PULLED_EVENT);
  });

  it("an unpushed local edit wins over an older pull, and pulling never re-dirties a key", async () => {
    const { phone, laptop } = await twoSyncedDevices();

    tick();
    phone.use();
    getStorage()!.setItem(WALLETS, JSON.stringify(["phone"]));
    await syncDocuments("user-1");

    // The laptop edited later (unpushed) when it pulls the phone's older copy: its own edit stays and wins.
    tick();
    laptop.use();
    getStorage()!.setItem(WALLETS, JSON.stringify(["laptop"]));
    await syncDocuments("user-1");
    expect(local(WALLETS)).toEqual(["laptop"]);
    expect(serverDoc(WALLETS).data).toEqual(["laptop"]);

    tick();
    phone.use();
    events.length = 0;
    await syncDocuments("user-1");
    expect(local(WALLETS)).toEqual(["laptop"]);
    expect(readDocumentMeta("user-1")[WALLETS].dirty).toBe(false);
    expect(events).toEqual([DATA_PULLED_EVENT]);

    // Nothing dirty after a pull: the next sync pushes nothing and pulls nothing new.
    events.length = 0;
    const before = serverDoc(WALLETS).serverUpdatedAt;
    tick();
    await syncDocuments("user-1");
    expect(serverDoc(WALLETS).serverUpdatedAt).toEqual(before);
    expect(events).toEqual([]);
  });

  it("keeps an unpushed edit when its push fails, even if a pulled copy is newer", async () => {
    const { phone, laptop } = await twoSyncedDevices();

    tick();
    laptop.use();
    getStorage()!.setItem(WALLETS, JSON.stringify(["laptop, unpushed"]));
    tick();
    phone.use();
    getStorage()!.setItem(WALLETS, JSON.stringify(["phone"]));
    await syncDocuments("user-1");

    tick();
    laptop.use();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const findUnique = db.current.userDocument.findUnique;
    db.current.userDocument.findUnique = async () => {
      throw new Error("db down");
    };
    await syncDocuments("user-1");
    db.current.userDocument.findUnique = findUnique;

    expect(local(WALLETS)).toEqual(["laptop, unpushed"]);
    expect(readDocumentMeta("user-1")[WALLETS].dirty).toBe(true);
  });

  it("an older offline edit loses to the newer server copy and receives it", async () => {
    const { phone, laptop } = await twoSyncedDevices();

    tick();
    phone.use();
    getStorage()!.setItem(WALLETS, JSON.stringify(["phone, offline"]));
    tick();
    laptop.use();
    getStorage()!.setItem(WALLETS, JSON.stringify(["laptop, newer"]));
    await syncDocuments("user-1");

    // Far past the pull overlap: the phone still gets the winner back for the key it pushed.
    tick(60 * 60_000);
    phone.use();
    await syncDocuments("user-1");
    expect(serverDoc(WALLETS).data).toEqual(["laptop, newer"]);
    expect(local(WALLETS)).toEqual(["laptop, newer"]);
  });

  it("syncs deletes and never uploads demo data", async () => {
    createDevice().use();
    setStorageScope("user-1");
    await syncDocuments("user-1");
    tick();
    getStorage()!.setItem("finoch_talangan_records", JSON.stringify([{ id: "t" }]));
    await syncDocuments("user-1");
    tick();
    getStorage()!.removeItem("finoch_talangan_records");
    setDemoMode(true);
    getStorage()!.setItem(WALLETS, JSON.stringify([{ id: "sample" }]));
    await syncDocuments("user-1");

    expect(serverDoc("finoch_talangan_records").isDeleted).toBe(true);
    expect(serverDoc(WALLETS)).toBeUndefined();
  });
});

describe("logout", () => {
  it("forgets the document cursor but keeps the data and unpushed edits", async () => {
    createDevice().use();
    setStorageScope("user-1");
    await syncDocuments("user-1");
    tick();
    getStorage()!.setItem(WALLETS, JSON.stringify(["unpushed"]));

    vi.stubGlobal("window", undefined);
    vi.useRealTimers(); // fake-indexeddb schedules with real timers
    await new SyncManager().clearUserSyncState("user-1");
    expect(localStorage.getItem("finoch_doc_cursor::user-1")).toBeNull();
    expect(local(WALLETS)).toEqual(["unpushed"]);
    expect(readDocumentMeta("user-1")[WALLETS].dirty).toBe(true);
  });
});
