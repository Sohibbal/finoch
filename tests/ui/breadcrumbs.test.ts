import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

let currentPathname = "/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

describe("Breadcrumbs Navigation Component", () => {
  beforeEach(() => {
    currentPathname = "/dashboard";
  });

  it("exports Breadcrumbs component and route configurations", async () => {
    const mod = await import("@/components/layout/breadcrumbs");
    expect(mod.Breadcrumbs).toBeDefined();
    expect(mod.ROUTE_BREADCRUMB_MAP).toBeDefined();
  });

  it("renders single-level dashboard breadcrumb when on /dashboard", async () => {
    const { Breadcrumbs } = await import("@/components/layout/breadcrumbs");
    currentPathname = "/dashboard";

    const html = renderToString(React.createElement(Breadcrumbs));
    expect(html).toContain('aria-label="Breadcrumb"');
    expect(html).toContain("Dashboard");
    expect(html).toContain('aria-current="page"');
  });

  it("renders multi-level breadcrumb with parent category and current item on /ukt-savings", async () => {
    const { Breadcrumbs } = await import("@/components/layout/breadcrumbs");
    currentPathname = "/ukt-savings";

    const html = renderToString(React.createElement(Breadcrumbs));
    expect(html).toContain('href="/dashboard"');
    expect(html).toMatch(/mahasiswa &amp; kost|mahasiswa & kost/i);
    expect(html).toContain("Sinking Fund UKT &amp; Kampus");
    expect(html).toContain('aria-current="page"');
  });

  it("renders custom breadcrumb items when passed explicitly", async () => {
    const { Breadcrumbs } = await import("@/components/layout/breadcrumbs");
    currentPathname = "/custom";

    const customItems = [
      { label: "Home", href: "/" },
      { label: "Finansial", href: "/dashboard" },
      { label: "Detail Pengeluaran" },
    ];

    const html = renderToString(React.createElement(Breadcrumbs, { items: customItems }));
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/dashboard"');
    expect(html).toContain("Detail Pengeluaran");
    expect(html).toContain('aria-current="page"');
  });
});
