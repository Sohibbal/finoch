import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const auth = vi.hoisted(() => ({
  value: { user: null as null | { id: string; name: string; email: string }, isLoading: true, logout: () => {} },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/wallets",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("@/components/layout/auth-provider", () => ({ useAuthContext: () => auth.value }));

const APP_DIR = path.resolve(__dirname, "../../src/app/(app)");
const pages = readdirSync(APP_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => ({ route: d.name, source: readFileSync(path.join(APP_DIR, d.name, "page.tsx"), "utf8") }));

describe("app route group", () => {
  it("holds all 17 app pages", () => {
    expect(pages).toHaveLength(17);
  });

  it.each(pages)("$route leaves shell chrome and auth to the app shell", ({ source }) => {
    expect(source).not.toMatch(/DashboardSidebar|BottomNav|ThemeToggle/);
    expect(source).not.toMatch(/@\/hooks\/use-auth/);
    // One shared header and document scroll instead of a per-page h-screen box.
    expect(source).toMatch(/<PageHeader\b/);
    expect(source).not.toMatch(/<header\b/);
    expect(source).not.toMatch(/h-screen overflow-y-auto/);
  });

  it.each(pages)("$route keeps fixed action bars above the mobile nav pills", ({ source }) => {
    expect(source).not.toMatch(/fixed bottom-(16|20)\b/);
  });

  it("stacks the Menu Fitur pill and PWA install prompt clear of the nav and action bars", () => {
    for (const file of ["bottom-nav.tsx", "pwa-install-button.tsx"]) {
      const source = readFileSync(path.resolve(__dirname, "../../src/components/layout", file), "utf8");
      expect(source).not.toMatch(/fixed bottom-20/);
      expect(source).toContain("FLOATING_PILL_BOTTOM");
    }
  });

  it("wraps pages in a single AuthProvider + AppShell", () => {
    const layout = readFileSync(path.join(APP_DIR, "layout.tsx"), "utf8");
    expect(layout).toMatch(/<AuthProvider>\s*<AppShell>\{children\}<\/AppShell>\s*<\/AuthProvider>/);
  });
});

describe("AppShell", () => {
  beforeEach(() => {
    auth.value = { user: null, isLoading: true, logout: () => {} };
    vi.stubGlobal("navigator", { onLine: true });
  });

  async function render() {
    const { AppShell } = await import("@/components/layout/app-shell");
    return renderToString(React.createElement(AppShell, null, React.createElement("p", null, "ISI HALAMAN")));
  }

  it("renders no page content while auth is unknown", async () => {
    const html = await render();
    expect(html).not.toContain("ISI HALAMAN");
    expect(html).toContain("aria-busy");
  });

  it("renders no page content for a signed-out user (redirect pending)", async () => {
    auth.value = { user: null, isLoading: false, logout: () => {} };
    expect(await render()).not.toContain("ISI HALAMAN");
  });

  it("renders the page with sidebar and bottom nav once signed in", async () => {
    auth.value = { user: { id: "u1", name: "Budi", email: "budi@kampus.id" }, isLoading: false, logout: () => {} };
    const html = await render();
    expect(html).toContain("ISI HALAMAN");
    expect(html).toContain("Navigasi Bawah Mobile");
    expect(html).toContain("budi@kampus.id");
  });

  it("keeps local-first pages usable offline when the session can't be checked", async () => {
    auth.value = { user: null, isLoading: false, logout: () => {} };
    vi.stubGlobal("navigator", { onLine: false });
    expect(await render()).toContain("ISI HALAMAN");
  });
});
