// tests/storage/sync-manager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "fake-indexeddb/auto";
import { SyncManager } from "@/lib/sync/sync-manager";
import { setStorageScope } from "@/lib/storage/local-storage";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncQueue } from "@/lib/storage/sync-queue";
import { getDatabase } from "@/lib/storage/indexed-db";
import type { BatchSyncRequest, BatchSyncResponse } from "@/lib/types/sync";

let store: Map<string, string>;
let fetchMock: ReturnType<typeof vi.fn>;

function respond(body: Partial<BatchSyncResponse>) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ appliedIds: [], rejectedIds: [], serverChanges: [], serverTimestamp: "2026-10-11T10:00:00.000Z", ...body }),
  });
}

const sentBody = (call = 0): BatchSyncRequest => JSON.parse(fetchMock.mock.calls[call][1].body);

beforeEach(async () => {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  });
  vi.stubGlobal("navigator", { onLine: true });
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  await expenseStorage.clearAll();
  await syncQueue.clearQueue();
  const db = await getDatabase();
  await db.clear("metadata");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SyncManager", () => {
  it("uploads only the active user's queue items", async () => {
    await expenseStorage.saveExpense({ itemName: "A", amount: 1000, category: "Other", userId: "user-a" });
    await expenseStorage.saveExpense({ itemName: "B", amount: 1000, category: "Other", userId: "user-b" });
    setStorageScope("user-b");
    respond({});

    await new SyncManager().triggerSync(true);
    expect(sentBody().clientChanges.map(c => c.payload.itemName)).toEqual(["B"]);
  });

  it("removes rejected items, flags their expense, and counts unresolved ones as failures", async () => {
    setStorageScope("user-a");
    const ok = await expenseStorage.saveExpense({ itemName: "Ok", amount: 1000, category: "Other" });
    const bad = await expenseStorage.saveExpense({ itemName: "Bad", amount: 1000, category: "Other" });
    const flaky = await expenseStorage.saveExpense({ itemName: "Flaky", amount: 1000, category: "Other" });
    const queue = await syncQueue.getPendingItems();
    const queueId = (expenseId: string) => queue.find(item => item.expenseId === expenseId)!.id;
    respond({ appliedIds: [queueId(ok.id)], rejectedIds: [{ id: queueId(bad.id), reason: "invalid_category" }] });

    expect(await new SyncManager().triggerSync(true)).toBe(true);

    const left = await syncQueue.getPendingItems();
    expect(left.map(item => [item.expenseId, item.retryCount])).toEqual([[flaky.id, 1]]);
    expect((await expenseStorage.getExpense(bad.id))?.syncStatus).toBe("failed");
  });

  it("keeps the pull cursor per user and clears it with the queue on logout", async () => {
    setStorageScope("user-a");
    await expenseStorage.saveExpense({ itemName: "A", amount: 1000, category: "Other" });
    const manager = new SyncManager();
    respond({});
    await manager.triggerSync(true);

    setStorageScope("user-b");
    respond({});
    await manager.triggerSync(true);
    // user-b must not inherit user-a's cursor.
    expect(sentBody(1).lastSyncTimestamp).toBeUndefined();

    await manager.clearUserSyncState("user-a");
    const db = await getDatabase();
    expect(await db.get("metadata", "last_sync_timestamp::user-a")).toBeUndefined();
    expect(await db.get("metadata", "last_sync_timestamp::user-b")).toBeDefined();
    expect((await syncQueue.getPendingItems()).some(item => item.payload.userId === "user-a")).toBe(false);
  });
});
