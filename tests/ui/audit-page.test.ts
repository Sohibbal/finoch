import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/audit",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Micro-Expense Leak Audit Components", () => {
  it("exports AuditPage component successfully", async () => {
    const AuditPageModule = await import("@/app/audit/page");
    expect(AuditPageModule.default).toBeDefined();
    expect(typeof AuditPageModule.default).toBe("function");
  });

  it("exports AuditCardMobile and AuditBentoDesktop components", async () => {
    const MobileModule = await import("@/components/audit/audit-card-mobile");
    const DesktopModule = await import("@/components/audit/audit-bento-desktop");

    expect(MobileModule.AuditCardMobile).toBeDefined();
    expect(DesktopModule.AuditBentoDesktop).toBeDefined();
  });
});
