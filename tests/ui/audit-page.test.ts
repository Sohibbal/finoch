import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/audit",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Micro-Expense Leak Audit Components", () => {
  it("exports AuditPage component successfully", async () => {
    const AuditPageModule = await import("@/app/(app)/audit/page");
    expect(AuditPageModule.default).toBeDefined();
    expect(typeof AuditPageModule.default).toBe("function");
  });

  it("prints leaks as a receipt: marked (not struck) items, the warteg count, tips only for what was found", async () => {
    const { AuditReceipt } = await import("@/components/audit/audit-receipt");
    const { auditMicroExpenses } = await import("@/lib/financial/audit-engine");
    const today = new Date().toISOString();
    const summary = auditMicroExpenses(
      [
        { id: "a", itemName: "Parkir Indomaret", amount: 2000, category: "Transportation", createdAt: today },
        { id: "b", itemName: "Isi ulang galon", amount: 6000, category: "Bills & Utilities", createdAt: today },
      ],
      2000000
    );
    const html = renderToString(React.createElement(AuditReceipt, { summary, monthLabel: "Oktober 2026" }));
    expect(html).toContain("Parkir Indomaret");
    // Strikethrough means "dihapus"; live leaks are marked with a drop instead.
    expect(html).not.toContain("line-through");
    expect(html).toContain("lucide-droplet");
    expect(html).toContain("porsi warteg");
    expect(html).not.toContain("galon");
    expect(html).not.toContain("Family Plan");
  });
});
