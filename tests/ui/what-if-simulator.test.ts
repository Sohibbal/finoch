import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/simulator",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("What-If Simulator Page", () => {
  it("exports Simulator page component", async () => {
    const mod = await import("@/app/simulator/page");
    expect(mod.default).toBeDefined();
  });

  it("renders Finoch branding and student presets", async () => {
    const mod = await import("@/app/simulator/page");
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
  });
});

