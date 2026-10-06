import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/ukt-savings",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { name: "Budi Mahasiswa", email: "budi@itb.ac.id" },
    logout: vi.fn(),
  }),
}));

describe("Dashboard Sidebar Component", () => {
  it("exports DashboardSidebar component", async () => {
    const mod = await import("@/components/layout/dashboard-sidebar");
    expect(mod.DashboardSidebar).toBeDefined();
  });

  it("renders categorized navigation groups and child submenus", async () => {
    const { DashboardSidebar } = await import("@/components/layout/dashboard-sidebar");
    const html = renderToString(React.createElement(DashboardSidebar));

    // Brand and Search
    expect(html).toContain("finoch");
    expect(html).toContain("placeholder=\"Cari fitur");

    // Parent Groups
    expect(html).toMatch(/mahasiswa &amp; kost|mahasiswa & kost/i);
    expect(html).toMatch(/kas &amp; anggaran|kas & anggaran/i);
    expect(html).toMatch(/analisis &amp; rencana|analisis & rencana/i);

    // Child Submenus (Menu Anak)
    expect(html).toContain('href="/ukt-savings"');
    expect(html).toContain('href="/meal-calc"');
    expect(html).toContain('href="/split-bill"');
    expect(html).toContain('href="/debts"');
    expect(html).toContain('href="/wishlist"');
    expect(html).toContain('href="/streak"');
    expect(html).toContain('href="/wallets"');
    expect(html).toContain('href="/budget"');
    expect(html).toContain('href="/bills"');
    expect(html).toContain('href="/audit"');
    expect(html).toContain('href="/reports"');
    expect(html).toContain('href="/simulator"');
    expect(html).toContain('href="/goals"');

    // User Profile Card & Offline indicator
    expect(html).toContain("Budi Mahasiswa");
    expect(html).toMatch(/pwa offline/i);
  });
});
