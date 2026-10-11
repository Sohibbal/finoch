import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFakeDocumentDb } from "./fake-document-db";

const db = vi.hoisted(() => ({ current: null as any }));
const session = vi.hoisted(() => ({ value: { userId: "user-a" } as { userId: string } | null }));
vi.mock("@/lib/prisma", () => ({
  prisma: { userDocument: new Proxy({}, { get: (_t, name) => (...args: any[]) => db.current.userDocument[name](...args) }) },
}));
vi.mock("@/lib/auth/jwt", () => ({ getSessionFromRequest: vi.fn(async () => session.value) }));

import { POST } from "@/app/api/sync/documents/route";

const NOW = new Date("2026-10-11T10:00:00.000Z");
const WALLETS = "finoch_student_wallets_v1";

async function sync(body: unknown) {
  const res = await POST(new Request("http://localhost/api/sync/documents", { method: "POST", body: JSON.stringify(body) }));
  return { status: res.status, json: await res.json() };
}

function change(key: string, data: unknown, updatedAt = "2026-10-11T09:00:00.000Z", isDeleted = false) {
  return { key, data, isDeleted, updatedAt };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.spyOn(console, "error").mockImplementation(() => {});
  db.current = createFakeDocumentDb();
  session.value = { userId: "user-a" };
});

describe("POST /api/sync/documents", () => {
  it("rejects unauthenticated requests", async () => {
    session.value = null;
    const { status } = await sync({ changes: [] });
    expect(status).toBe(401);
  });

  it("validates each change: unknown key, oversize, bad date, missing data", async () => {
    const { status, json } = await sync({
      changes: [
        change(WALLETS, [{ id: "w1" }]),
        change("finoch_theme", "dark"),
        change("finoch_financial_profile", {}),
        change("finoch_student_wishlist", ["x".repeat(256 * 1024)]),
        change("finoch_recurring_bills", [], "not-a-date"),
        change("finoch_savings_goals_v1", null),
      ],
    });
    expect(status).toBe(200);
    expect(json.appliedKeys).toEqual([WALLETS]);
    expect(json.rejected).toEqual([
      { key: "finoch_theme", reason: "invalid_key" },
      { key: "finoch_financial_profile", reason: "invalid_key" },
      { key: "finoch_student_wishlist", reason: "too_large" },
      { key: "finoch_recurring_bills", reason: "invalid_date" },
      { key: "finoch_savings_goals_v1", reason: "invalid_data" },
    ]);
    expect(db.current.rows).toHaveLength(1);
  });

  it("refuses more than 50 changes", async () => {
    const { status } = await sync({ changes: Array.from({ length: 51 }, () => change(WALLETS, [])) });
    expect(status).toBe(400);
  });

  it("last write wins per key on clamped client time, and returns the winner to the loser", async () => {
    await sync({ changes: [change(WALLETS, ["newer"], "2026-10-11T09:30:00.000Z")] });
    const { json } = await sync({ changes: [change(WALLETS, ["older"], "2026-10-11T09:00:00.000Z")], since: NOW.toISOString() });
    expect(json.appliedKeys).toEqual([WALLETS]);
    expect(json.documents).toEqual([{ key: WALLETS, data: ["newer"], isDeleted: false, updatedAt: "2026-10-11T09:30:00.000Z" }]);

    // A clock far ahead is clamped to now + 60s, so it can't win forever.
    await sync({ changes: [change(WALLETS, ["future"], "2030-01-01T00:00:00.000Z")] });
    expect(db.current.rows[0].clientUpdatedAt.toISOString()).toBe("2026-10-11T10:01:00.000Z");
  });

  it("stores deletes as tombstones", async () => {
    await sync({ changes: [change(WALLETS, ["w"])] });
    const { json } = await sync({ changes: [change(WALLETS, null, "2026-10-11T09:10:00.000Z", true)] });
    expect(json.documents[0]).toMatchObject({ key: WALLETS, isDeleted: true });
  });

  it("pulls only documents changed since the cursor (with overlap) and only the caller's", async () => {
    await sync({ changes: [change(WALLETS, ["a"])] });
    session.value = { userId: "user-b" };
    await sync({ changes: [change(WALLETS, ["b"])] });
    session.value = { userId: "user-a" };

    vi.setSystemTime(new Date(NOW.getTime() + 10 * 60_000));
    await sync({ changes: [change("finoch_recurring_bills", ["bill"])] });

    const full = await sync({ changes: [] });
    expect(full.json.documents.map((d: any) => d.key).sort()).toEqual(["finoch_recurring_bills", WALLETS]);

    const since = new Date(NOW.getTime() + 5 * 60_000).toISOString();
    const delta = await sync({ changes: [], since });
    expect(delta.json.documents.map((d: any) => d.key)).toEqual(["finoch_recurring_bills"]);
    expect(delta.json.serverTime).toBe(new Date(NOW.getTime() + 10 * 60_000).toISOString());
  });
});
