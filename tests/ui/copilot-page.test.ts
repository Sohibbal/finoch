import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  usePathname: () => "/copilot",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Copilot Page Component", () => {
  it("exports Copilot page component successfully", async () => {
    const mod = await import("@/app/copilot/page");
    expect(mod.default).toBeDefined();
  });

  it("renders Finoch branding and student welcome message", async () => {
    const mod = await import("@/app/copilot/page");
    const html = renderToString(React.createElement(mod.default));
    expect(html).toContain("Finoch AI Copilot");
    expect(html).toContain("finoch");
    expect(html).not.toContain("voicash.id");
    expect(html).toContain("Mahasiswa &amp; Anak Kost");
  });

  it("renders student-tailored quick prompt chips", async () => {
    const mod = await import("@/app/copilot/page");
    const html = renderToString(React.createElement(mod.default));
    expect(html).toContain("Jatah jajan hari ini masih aman nggak?");
    expect(html).toContain("Gimana trik hemat makan biar uang kiriman cukup sebulan?");
    expect(html).toContain("Aman nggak kalau beli sepatu/baju baru minggu ini?");
    expect(html).toContain("Kiat bertahan hidup saat krisis tanggal tua");
  });
});

