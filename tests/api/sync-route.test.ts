// tests/api/sync-route.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  expense: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/jwt", () => ({ getSessionFromRequest: vi.fn(async () => ({ userId: "user-a" })) }));

import { POST } from "@/app/api/sync/route";

const NOW = new Date("2026-10-11T10:00:00.000Z");

function change(id: string, overrides: Record<string, unknown> = {}, action = "create") {
  return {
    id,
    action,
    payload: {
      id: `exp-${id}`,
      userId: "user-a",
      itemName: "Nasi Padang",
      amount: 18000,
      category: "Food & Drinks",
      createdAt: "2026-10-11T09:00:00.000Z",
      updatedAt: "2026-10-11T09:00:00.000Z",
      ...overrides,
    },
  };
}

async function sync(body: unknown) {
  const res = await POST(new Request("http://localhost/api/sync", { method: "POST", body: JSON.stringify(body) }));
  return { status: res.status, json: await res.json() };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.spyOn(console, "error").mockImplementation(() => {});
  prismaMock.expense.findUnique.mockReset().mockResolvedValue(null);
  prismaMock.expense.create.mockReset().mockResolvedValue({});
  prismaMock.expense.update.mockReset().mockResolvedValue({});
  prismaMock.expense.findMany.mockReset().mockResolvedValue([]);
});

describe("POST /api/sync", () => {
  it("validates each item and applies the good ones (partial success)", async () => {
    const { status, json } = await sync({
      clientChanges: [
        change("ok"),
        change("neg", { amount: -5 }),
        change("frac", { amount: 10.5 }),
        change("huge", { amount: 2_000_000_001 }),
        change("cat", { category: "Crypto" }),
        change("name", { itemName: "x".repeat(201) }),
        change("date", { createdAt: "not-a-date" }),
        change("act", {}, "upsert"),
        change("noid", { id: 42 }),
      ],
    });

    expect(status).toBe(200);
    expect(json.appliedIds).toEqual(["ok", "cat"]);
    expect(json.rejectedIds).toEqual([
      { id: "neg", reason: "invalid_amount" },
      { id: "frac", reason: "invalid_amount" },
      { id: "huge", reason: "invalid_amount" },
      { id: "name", reason: "invalid_item_name" },
      { id: "date", reason: "invalid_date" },
      { id: "act", reason: "invalid_action" },
      { id: "noid", reason: "invalid_id" },
    ]);
    expect(prismaMock.expense.create).toHaveBeenCalledTimes(2);
    expect(prismaMock.expense.create.mock.calls[1][0].data.category).toBe("Other");
  });

  it("maps legacy categories instead of rejecting them", async () => {
    const { json } = await sync({ clientChanges: [change("shop", { category: "Shopping" })] });
    expect(json.appliedIds).toEqual(["shop"]);
    expect(prismaMock.expense.create.mock.calls[0][0].data.category).toBe("Shopping & Lifestyle");
  });

  it("rejects changes to another user's record instead of leaving them queued", async () => {
    prismaMock.expense.findUnique.mockResolvedValue({ id: "exp-x", userId: "user-b", updatedAt: NOW });
    const { json } = await sync({ clientChanges: [change("x", {}, "update"), change("y", {}, "delete")] });
    expect(json.appliedIds).toEqual([]);
    expect(json.rejectedIds).toEqual([
      { id: "x", reason: "forbidden" },
      { id: "y", reason: "forbidden" },
    ]);
    expect(prismaMock.expense.update).not.toHaveBeenCalled();
  });

  it("keeps processing after one item throws, leaving it unresolved for retry", async () => {
    prismaMock.expense.create.mockRejectedValueOnce(new Error("db down")).mockResolvedValue({});
    const { json } = await sync({ clientChanges: [change("boom"), change("fine")] });
    expect(json.appliedIds).toEqual(["fine"]);
    expect(json.rejectedIds).toEqual([]);
  });

  it("clamps a future client updatedAt to server time plus skew", async () => {
    await sync({ clientChanges: [change("future", { updatedAt: "2030-01-01T00:00:00.000Z" })] });
    const data = prismaMock.expense.create.mock.calls[0][0].data;
    expect(data.updatedAt.getTime()).toBe(NOW.getTime() + 60_000);
    expect(data.userId).toBe("user-a");
  });

  it("a clamped fast-clock write cannot beat a later honest write", async () => {
    // Stored row came from a fast clock and was clamped to NOW + skew.
    prismaMock.expense.findUnique.mockResolvedValue({ id: "exp-u", userId: "user-a", updatedAt: new Date(NOW.getTime() + 60_000) });
    vi.setSystemTime(new Date(NOW.getTime() + 5 * 60_000));
    const { json } = await sync({ clientChanges: [change("u", { updatedAt: new Date().toISOString() }, "update")] });
    expect(json.appliedIds).toEqual(["u"]);
    expect(prismaMock.expense.update).toHaveBeenCalledTimes(1);
  });

  it("pulls by the server-assigned column and returns the server cursor", async () => {
    const last = "2026-10-11T08:00:00.000Z";
    const { json } = await sync({ clientChanges: [], lastSyncTimestamp: last });
    const where = prismaMock.expense.findMany.mock.calls[0][0].where;
    expect(where.userId).toBe("user-a");
    expect(where.updatedAt).toBeUndefined();
    expect(where.serverUpdatedAt.gt.getTime()).toBeLessThanOrEqual(new Date(last).getTime());
    expect(json.serverTimestamp).toBe(NOW.toISOString());
  });

  it("returns a record edited offline long ago once the server has stored it", async () => {
    prismaMock.expense.findMany.mockResolvedValue([
      {
        id: "exp-old", userId: "user-a", itemName: "Offline", amount: 5000, category: "Other", isDeleted: false,
        createdAt: new Date("2026-10-01T00:00:00.000Z"), updatedAt: new Date("2026-10-01T00:00:00.000Z"),
        serverUpdatedAt: NOW,
      },
    ]);
    const { json } = await sync({ clientChanges: [], lastSyncTimestamp: "2026-10-11T09:59:00.000Z" });
    expect(json.serverChanges.map((e: { id: string }) => e.id)).toEqual(["exp-old"]);
  });
});
