import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import type { DebtItem } from "@/types/debt-types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/debts",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

const debt = (over: Partial<DebtItem>): DebtItem => ({
  id: "d1",
  type: "receivable",
  personName: "Raka",
  amount: 25_000,
  description: "Talangan nasi padang",
  status: "unpaid",
  createdAt: "2026-10-01T00:00:00.000Z",
  ...over,
});

describe("Buku Kasbon page", () => {
  it("exports the page, the slip and the form", async () => {
    const page = await import("@/app/(app)/debts/page");
    const { DebtSlip } = await import("@/components/debts/debt-slip");
    const { DebtFormModal } = await import("@/components/debts/debt-form-modal");
    expect(typeof page.default).toBe("function");
    expect(DebtSlip).toBeDefined();
    expect(DebtFormModal).toBeDefined();
  });

  it("says who owes whom on the slip itself", async () => {
    const { DebtSlip } = await import("@/components/debts/debt-slip");
    const noop = () => {};
    const piutang = renderToString(React.createElement(DebtSlip, { debt: debt({}), onTogglePaid: noop, onDelete: noop }));
    expect(piutang).toContain("Raka utang ke kamu");
    expect(piutang).toContain("Ingatkan WA");
    const utang = renderToString(React.createElement(DebtSlip, { debt: debt({ type: "payable" }), onTogglePaid: noop, onDelete: noop }));
    expect(utang).toContain("Kamu utang ke Raka");
    // The direction is metadata under the heading, never a kicker above it.
    expect(piutang.indexOf("Raka utang ke kamu")).toBeLessThan(piutang.indexOf("Piutang · uang kembali ke kamu"));
    expect(utang.indexOf("Kamu utang ke Raka")).toBeLessThan(utang.indexOf("Utang · kamu yang bayar"));
    const lunas = renderToString(React.createElement(DebtSlip, { debt: debt({ status: "paid" }), onTogglePaid: noop, onDelete: noop }));
    expect(lunas).toContain("Lunas");
    expect(lunas).toContain("Batal lunas");
  });

  it("sends WhatsApp reminders to 62 numbers", async () => {
    const { whatsAppUrl } = await import("@/components/debts/debt-slip");
    expect(whatsAppUrl(debt({ phone: "0812-3456-789" }))).toMatch(/^https:\/\/wa\.me\/628123456789\?text=/);
    expect(whatsAppUrl(debt({}))).toMatch(/^https:\/\/wa\.me\/\?text=/);
  });

  it("puts unpaid slips first by promise day and flags broken promises", async () => {
    const { sortSlips, isPastPromise } = await import("@/components/debts/debt-slip");
    const order = sortSlips([
      debt({ id: "paid", status: "paid", dueDate: "2026-10-01" }),
      debt({ id: "undated" }),
      debt({ id: "late", dueDate: "2026-10-05" }),
      debt({ id: "soon", dueDate: "2026-10-20" }),
    ]).map((d) => d.id);
    expect(order).toEqual(["late", "soon", "undated", "paid"]);
    expect(isPastPromise(debt({ dueDate: "2026-10-05" }), "2026-10-11")).toBe(true);
    expect(isPastPromise(debt({ dueDate: "2026-10-11" }), "2026-10-11")).toBe(false);
    expect(isPastPromise(debt({ dueDate: "2026-10-05", status: "paid" }), "2026-10-11")).toBe(false);
  });
});
