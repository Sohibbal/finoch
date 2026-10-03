import { describe, it, expect } from "vitest";

describe("Dashboard Sidebar Component", () => {
  it("exports DashboardSidebar component", async () => {
    const mod = await import("@/components/layout/dashboard-sidebar");
    expect(mod.DashboardSidebar).toBeDefined();
  });
});
