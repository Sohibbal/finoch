import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/debts",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Student Debts Page & Components", () => {
  it("exports DebtsPage component successfully", async () => {
    const DebtsPageModule = await import("@/app/debts/page");
    expect(DebtsPageModule.default).toBeDefined();
    expect(typeof DebtsPageModule.default).toBe("function");
  });

  it("exports DebtCardMobile, DebtTableDesktop, and DebtFormModal components", async () => {
    const MobileModule = await import("@/components/debts/debt-card-mobile");
    const DesktopModule = await import("@/components/debts/debt-table-desktop");
    const FormModule = await import("@/components/debts/debt-form-modal");

    expect(MobileModule.DebtCardMobile).toBeDefined();
    expect(DesktopModule.DebtTableDesktop).toBeDefined();
    expect(FormModule.DebtFormModal).toBeDefined();
  });
});
