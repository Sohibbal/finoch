import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/reports",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "test-user-123", email: "student@finoch.id" },
    logout: vi.fn(),
  }),
}));

describe("Reports & Export Statement Components", () => {
  it("exports ReportsPage component successfully", async () => {
    const ReportsPageModule = await import("@/app/reports/page");
    expect(ReportsPageModule.default).toBeDefined();
    expect(typeof ReportsPageModule.default).toBe("function");
  });

  it("exports all report child components correctly", async () => {
    const SummaryModule = await import("@/components/reports/report-summary-card");
    const WhatsAppModalModule = await import("@/components/reports/report-whatsapp-modal");
    const PrintableDocModule = await import("@/components/reports/report-printable-document");

    expect(SummaryModule.ReportSummaryCard).toBeDefined();
    expect(WhatsAppModalModule.ReportWhatsAppModal).toBeDefined();
    expect(PrintableDocModule.ReportPrintableDocument).toBeDefined();
  });
});
