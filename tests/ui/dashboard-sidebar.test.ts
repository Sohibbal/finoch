import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pemasukan",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/components/layout/auth-provider", () => ({
  useAuthContext: () => ({
    user: { name: "Budi Mahasiswa", email: "budi@itb.ac.id" },
    logout: vi.fn(),
  }),
}));

describe("Dashboard Sidebar Component", () => {
  it("exports DashboardSidebar component", async () => {
    const mod = await import("@/components/layout/dashboard-sidebar");
    expect(mod.DashboardSidebar).toBeDefined();
  });

  it("renders strictly the 6 core navigation menus", async () => {
    const { DashboardSidebar } = await import("@/components/layout/dashboard-sidebar");
    const html = renderToString(React.createElement(DashboardSidebar));

    // Brand and Search
    expect(html).toContain("finoch");
    expect(html).toContain("placeholder=\"Cari menu...");

    // 6 Core Menus
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain('href="/pemasukan"');
    expect(html).toContain('href="/pengeluaran"');
    expect(html).toContain('href="/wishlist"');
    expect(html).toContain('href="/copilot"');
    expect(html).toContain('href="/profile"');

    // Deleted Subsystems must NOT exist
    expect(html).not.toContain('href="/ukt-savings"');
    expect(html).not.toContain('href="/meal-calc"');
    expect(html).not.toContain('href="/split-bill"');
    expect(html).not.toContain('href="/debts"');
    expect(html).not.toContain('href="/wallets"');
    expect(html).not.toContain('href="/budget"');
    expect(html).not.toContain('href="/bills"');
    expect(html).not.toContain('href="/reports"');
    expect(html).not.toContain('href="/simulator"');

    // User Profile Card & Offline indicator
    expect(html).toContain("Budi Mahasiswa");
    expect(html).toMatch(/pwa offline/i);
  });
});
