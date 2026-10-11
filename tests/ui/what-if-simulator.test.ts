import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/simulator",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const profile = vi.hoisted(() => ({
  current: { loading: false, error: false, hasProfile: true, monthlyIncome: 2400000 as number | null, fixedExpenses: 1300000 as number | null, savings: 0 },
}));
vi.mock("@/hooks/use-financial-profile", () => ({ useFinancialProfile: () => profile.current }));

describe("What-If Simulator Page", () => {
  it("exports Simulator page component", async () => {
    const mod = await import("@/app/(app)/simulator/page");
    expect(mod.default).toBeDefined();
  });

  it("renders Finoch branding and student presets", async () => {
    const mod = await import("@/app/(app)/simulator/page");
    const html = renderToString(React.createElement(mod.default));
    expect(html).toContain("Finoch What-If Simulator");
    expect(html).toContain("finoch");
    expect(html).not.toContain("voicash.id");

    // Student presets
    expect(html).toContain("Pangkas Kopi &amp; Jajanan Sore");
    expect(html).toContain("Hemat Rp200.000/bln");
    expect(html).toContain("Dapat Job Magang / Freelance");
    expect(html).toContain("+Rp600.000/bln");
    expect(html).toContain("Uang Kiriman Ortu Terlambat");
    expect(html).toContain("Sewa Kos Naik / Iuran WiFi");
    expect(html).toContain("+Rp150.000/bln");

    // Baseline comes from the user's profile
    expect(html).toContain("2.400.000");
    expect(html).toContain("1.300.000");
  });

  it("shows a skeleton while loading and an onboarding link without a profile, never made-up numbers", async () => {
    const mod = await import("@/app/(app)/simulator/page");
    profile.current = { ...profile.current, loading: true, hasProfile: false, monthlyIncome: null, fixedExpenses: null };
    let html = renderToString(React.createElement(mod.default));
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain("Pangkas Kopi");

    profile.current = { ...profile.current, loading: false };
    html = renderToString(React.createElement(mod.default));
    expect(html).toContain('href="/onboarding"');
    expect(html).not.toContain("Rp 2.500.000");
  });
});

