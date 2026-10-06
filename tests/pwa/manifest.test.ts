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

  it("provides matching public/manifest.json for offline shell", () => {
    const manifestPath = path.resolve(process.cwd(), "public/manifest.json");
    const json = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    expect(json.name).toBe("Finoch - Finansial Anak Kost");
    expect(json.short_name).toBe("Finoch");
    expect(json.display).toBe("standalone");
    expect(json.icons?.length).toBeGreaterThan(0);
    expect(json.theme_color).toBeDefined();
    expect(json.start_url).toBe("/");
  });

  it("configures resilient service worker finoch-shell-v2 with non-blocking install", () => {
    const swPath = path.resolve(process.cwd(), "public/sw.js");
    const swCode = fs.readFileSync(swPath, "utf-8");

    // Must use cache version finoch-shell-v3
    expect(swCode).toContain('CACHE_NAME = "finoch-shell-v3"');

    // Must use non-blocking installation
    expect(swCode).toContain("Promise.allSettled");

    // Must implement network-first with cache fallback for navigation
    expect(swCode).toContain('event.request.mode === "navigate"');

    // Must implement stale-while-revalidate for static assets
    expect(swCode).toMatch(/stale-while-revalidate/i);
  });

  it("exports OfflineBanner client component for network status indication", async () => {
    const mod = await import("@/components/layout/offline-banner");
    expect(mod.OfflineBanner).toBeDefined();
  });
});
