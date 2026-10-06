import { describe, it, expect, vi } from "vitest";

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
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test_user", name: "Diki", email: "diki@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Bills & Fixed Expense Shield Page Components", () => {
  it("exports BillsPage component successfully", async () => {
    const mod = await import("@/app/bills/page");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("exports all modular bill components", async () => {
    const { BillCardMobile } = await import("@/components/bills/bill-card-mobile");
    const { BillTableDesktop } = await import("@/components/bills/bill-table-desktop");
    const { BillCalendarMatrix } = await import("@/components/bills/bill-calendar-matrix");
    const { BillShieldCard } = await import("@/components/bills/bill-shield-card");
    const { BillFormModal } = await import("@/components/bills/bill-form-modal");

    expect(BillCardMobile).toBeDefined();
    expect(BillTableDesktop).toBeDefined();
    expect(BillCalendarMatrix).toBeDefined();
    expect(BillShieldCard).toBeDefined();
    expect(BillFormModal).toBeDefined();
  });
});
