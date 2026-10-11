import { describe, it, expect, vi } from "vitest";
import type { RecurringBill } from "@/types/bill-types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/bills",
}));

// Mock hooks
vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test_user", name: "Diki", email: "diki@finoch.id" },
    logout: vi.fn(),
  }),
}));

const bill = (id: string, dueDay: number, isPaidThisMonth = false): RecurringBill => ({
  id,
  name: id,
  category: "kos",
  amount: 100_000,
  dueDay,
  frequency: "monthly",
  isPaidThisMonth,
  reminderDaysBefore: 3,
  createdAt: "2026-01-01T00:00:00.000Z",
});

describe("Tagihan Kost page", () => {
  it("exports the page and its components", async () => {
    const mod = await import("@/app/(app)/bills/page");
    const { BillScheduleRow } = await import("@/components/bills/bill-schedule");
    const { BillCalendarMatrix } = await import("@/components/bills/bill-calendar-matrix");
    const { BillShieldCard } = await import("@/components/bills/bill-shield-card");
    const { BillFormModal } = await import("@/components/bills/bill-form-modal");
    expect(typeof mod.default).toBe("function");
    for (const c of [BillScheduleRow, BillCalendarMatrix, BillShieldCard, BillFormModal]) expect(c).toBeDefined();
  });

  it("lists overdue bills first (oldest first), then today, due soon, later, and paid last", async () => {
    const { billSchedule } = await import("@/components/bills/bill-schedule");
    const rows = billSchedule(
      [bill("nanti", 25), bill("lunas", 1, true), bill("telat-baru", 9), bill("mepet", 12), bill("hari-ini", 11), bill("telat-lama", 2)],
      new Date(2026, 9, 11)
    );
    expect(rows.map((r) => r.bill.id)).toEqual(["telat-lama", "telat-baru", "hari-ini", "mepet", "nanti", "lunas"]);
    expect(rows.map((r) => r.state)).toEqual(["telat", "telat", "hari-ini", "mepet", "nanti", "lunas"]);
  });

  it("counts days to the clamped due day, so a 31st bill in February is due on the 28th", async () => {
    const { billSchedule, billDueText } = await import("@/components/bills/bill-schedule");
    const [row] = billSchedule([bill("kos", 31)], new Date(2026, 1, 28));
    expect(row.dueDay).toBe(28);
    expect(billDueText(row)).toBe("Jatuh tempo hari ini");
  });

  it("only states the share of uang saku when the real allowance is known", async () => {
    const { billIncomeShare } = await import("@/components/bills/bill-shield-card");
    expect(billIncomeShare(750_000, undefined)).toBeNull();
    expect(billIncomeShare(750_000, 0)).toBeNull();
    expect(billIncomeShare(750_000, 3_000_000)).toBe(25);
  });
});
