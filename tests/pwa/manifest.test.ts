// tests/pwa/manifest.test.ts
import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";
import fs from "fs";
import path from "path";

describe("PWA Web App Manifest & Offline Engine", () => {
  it("provides valid PWA metadata for Indonesian students", () => {
    const config = manifest();
    expect(config.name).toBe("Finoch - Finansial Anak Kost");
    expect(config.short_name).toBe("Finoch");
    expect(config.display).toBe("standalone");
    expect(config.icons?.length).toBeGreaterThan(0);
    expect(config.theme_color).toBeDefined();
    expect(config.start_url).toBe("/");
  });

  it("uses the generated manifest as the single source", () => {
    expect(fs.existsSync(path.resolve(process.cwd(), "public/manifest.json"))).toBe(false);
    expect(manifest()).toMatchObject({ id: "/", scope: "/", orientation: "portrait" });
    const sw = fs.readFileSync(path.resolve(process.cwd(), "public/sw.js"), "utf-8");
    expect(sw).toContain('"/manifest.webmanifest"');
    expect(sw).not.toContain('"/manifest.json"');
  });

  it("exports OfflineBanner client component for network status indication", async () => {
    const mod = await import("@/components/layout/offline-banner");
    expect(mod.OfflineBanner).toBeDefined();
  });
});
