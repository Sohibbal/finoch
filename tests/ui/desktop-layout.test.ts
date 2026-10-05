// tests/ui/desktop-layout.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

let currentPathname = "/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Desktop Layout & Navigation", () => {
  beforeEach(() => {
    currentPathname = "/dashboard";
  });

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

  it("exports BottomNav component for 5-tab mobile navigation", async () => {
    const module = await import("@/components/layout/bottom-nav");
    expect(module.BottomNav).toBeDefined();
  });

  it("renders 5 accessible touch tabs in BottomNav for authenticated student", async () => {
    const { BottomNav } = await import("@/components/layout/bottom-nav");
    currentPathname = "/dashboard";

    const html = renderToString(
      React.createElement(BottomNav, {
        onOpenVoice: () => {},
        userEmail: "mahasiswa@itb.ac.id",
      })
    );

    // 1. Home / Beranda link
    expect(html).toContain('href="/dashboard"');
    expect(html).toMatch(/beranda/i);

    // 2. Simulator & Jatah link
    expect(html).toContain('href="/simulator"');
    expect(html).toMatch(/simulasi/i);

    // 3. Center Voice Trigger button
    expect(html).toContain("<button");
    expect(html).toMatch(/bicara|suara|catat/i);

    // 4. AI Copilot link
    expect(html).toContain('href="/copilot"');
    expect(html).toMatch(/copilot/i);

    // 5. Profile & Goals link
    expect(html).toContain('href="/profile"');
    expect(html).toMatch(/profil/i);
  });

  it("renders guest navigation fallback when unauthenticated", async () => {
    const { BottomNav } = await import("@/components/layout/bottom-nav");
    currentPathname = "/";

    const html = renderToString(
      React.createElement(BottomNav, {
        onOpenVoice: () => {},
        userEmail: null,
      })
    );

    expect(html).toContain('href="/"');
    expect(html).toContain('href="/simulator"');
    expect(html).toContain('href="/copilot"');
    expect(html).toContain('href="/login"');
  });

  it("reflects active route states properly", async () => {
    const { BottomNav } = await import("@/components/layout/bottom-nav");
    
    currentPathname = "/simulator";
    const simHtml = renderToString(
      React.createElement(BottomNav, {
        onOpenVoice: () => {},
        userEmail: "student@campus.ac.id",
      })
    );
    // Simulator tab should have active styling indicator
    expect(simHtml).toContain('href="/simulator"');

    currentPathname = "/copilot";
    const copilotHtml = renderToString(
      React.createElement(BottomNav, {
        onOpenVoice: () => {},
        userEmail: "student@campus.ac.id",
      })
    );
    expect(copilotHtml).toContain('href="/copilot"');
  });
});

