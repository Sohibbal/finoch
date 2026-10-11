import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/reports",
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Reports & Export Statement Components", () => {
  it("exports ReportsPage component successfully", async () => {
    const ReportsPageModule = await import("@/app/(app)/reports/page");
    expect(ReportsPageModule.default).toBeDefined();
    expect(typeof ReportsPageModule.default).toBe("function");
  });

  it("exports all report child components correctly", async () => {
    const WhatsAppModalModule = await import("@/components/reports/report-whatsapp-modal");
    const PrintableDocModule = await import("@/components/reports/report-printable-document");

    expect(WhatsAppModalModule.ReportWhatsAppModal).toBeDefined();
    expect(PrintableDocModule.ReportPrintableDocument).toBeDefined();
  });

  it("prints the month as a statement: oldest first, each row with the balance left after it", async () => {
    const { statementRows } = await import("@/components/reports/report-printable-document");
    const { generateMonthlyReport } = await import("@/lib/financial/report-engine");
    const expenses = [
      { id: "b", itemName: "Warteg", amount: 15000, category: "Food & Drinks", createdAt: new Date(2026, 9, 5, 12).toISOString() },
      { id: "a", itemName: "Galon", amount: 6000, category: "Bills & Utilities", createdAt: new Date(2026, 9, 2, 8).toISOString() },
      { id: "c", itemName: "Bulan lalu", amount: 9000, category: "Other", createdAt: new Date(2026, 8, 30, 8).toISOString() },
    ];
    const summary = generateMonthlyReport(expenses, 100000, 10, 2026);
    const rows = statementRows(expenses, summary);
    expect(rows.map((r) => [r.item, r.saldo])).toEqual([
      ["Galon", 94000],
      ["Warteg", 79000],
    ]);
  });
});
