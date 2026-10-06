import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/budget",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-student-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Budget Envelopes Page & Components", () => {
  it("exports BudgetPage component successfully", async () => {
    const BudgetPageModule = await import("@/app/budget/page");
    expect(BudgetPageModule.default).toBeDefined();
    expect(typeof BudgetPageModule.default).toBe("function");
  });

  it("exports all budget child components correctly", async () => {
    const MobileModule = await import("@/components/budget/budget-envelope-mobile");
    const DesktopModule = await import("@/components/budget/budget-envelope-desktop");
    const OverviewModule = await import("@/components/budget/budget-overview-card");
    const TransferModalModule = await import("@/components/budget/budget-transfer-modal");
    const FormModalModule = await import("@/components/budget/budget-form-modal");
    const HistoryModule = await import("@/components/budget/budget-transfer-history");

    expect(MobileModule.BudgetEnvelopeMobile).toBeDefined();
    expect(DesktopModule.BudgetEnvelopeDesktop).toBeDefined();
    expect(OverviewModule.BudgetOverviewCard).toBeDefined();
    expect(TransferModalModule.BudgetTransferModal).toBeDefined();
    expect(FormModalModule.BudgetFormModal).toBeDefined();
    expect(HistoryModule.BudgetTransferHistory).toBeDefined();
  });
});
