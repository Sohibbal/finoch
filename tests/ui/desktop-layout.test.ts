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

  it("exports PwaInstallButton component for floating PWA installation", async () => {
    const module = await import("@/components/layout/pwa-install-button");
    expect(module.PwaInstallButton).toBeDefined();
  });

  it("exports BottomNav component for mobile navigation", async () => {
    const module = await import("@/components/layout/bottom-nav");
    expect(module.BottomNav).toBeDefined();
  });

  it("renders the 5-slot bottom bar for an authenticated student", async () => {
    const { BottomNav } = await import("@/components/layout/bottom-nav");
    currentPathname = "/dashboard";

    const html = renderToString(
      React.createElement(BottomNav, {
        onOpenVoice: () => {},
        userEmail: "mahasiswa@itb.ac.id",
      })
    );

    expect(html).toContain('href="/dashboard"');
    expect(html).toMatch(/beranda/i);
    expect(html).toContain('href="/pemasukan"');
    expect(html).toContain('href="/pengeluaran"');
    expect(html).toContain('href="/wishlist"');
    expect(html).toContain('href="/copilot"');
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
    expect(html).not.toContain('href="/dashboard"');
  });

  it("marks the active tab for assistive tech", async () => {
    const { BottomNav } = await import("@/components/layout/bottom-nav");
    currentPathname = "/pemasukan";
    const html = renderToString(
      React.createElement(BottomNav, {
        onOpenVoice: () => {},
        userEmail: "student@campus.ac.id",
      })
    );
    expect(html).toMatch(/aria-current="page"[^>]*href="\/pemasukan"|href="\/pemasukan"[^>]*aria-current="page"/);
  });
});
