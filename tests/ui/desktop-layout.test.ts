// tests/ui/desktop-layout.test.ts
import { describe, it, expect } from "vitest";

describe("Desktop Layout & Top Navigation", () => {
  it("exports TopNav component for desktop navigation", async () => {
    const module = await import("@/components/layout/top-nav");
    expect(module.TopNav).toBeDefined();
  });

  it("exports DesktopFloatingActions component for desktop floating actions", async () => {
    const module = await import("@/components/layout/desktop-floating-actions");
    expect(module.DesktopFloatingActions).toBeDefined();
  });

  it("exports PwaInstallButton component for floating PWA installation", async () => {
    const module = await import("@/components/layout/pwa-install-button");
    expect(module.PwaInstallButton).toBeDefined();
  });

  it("exports BottomNav component for 3-item mobile navigation", async () => {
    const module = await import("@/components/layout/bottom-nav");
    expect(module.BottomNav).toBeDefined();
  });
});
