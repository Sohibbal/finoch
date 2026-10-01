// tests/pwa/manifest.test.ts
import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("PWA Web App Manifest", () => {
  it("provides valid PWA metadata for Indonesian students", () => {
    const config = manifest();
    expect(config.name).toBe("VoiCash - Catat Pengeluaran Suara");
    expect(config.short_name).toBe("VoiCash");
    expect(config.display).toBe("standalone");
    expect(config.icons?.length).toBeGreaterThan(0);
    expect(config.theme_color).toBe("#4f46e5");
  });
});
