import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

async function render(pathname: string) {
  nav.pathname = pathname;
  const { PwaInstallButton } = await import("@/components/layout/pwa-install-button");
  return renderToString(React.createElement(PwaInstallButton));
}

describe("PwaInstallButton placement", () => {
  it("shows the full install banner on the landing page", async () => {
    expect(await render("/")).toContain("Tutup rekomendasi pasang");
  });

  it.each(["/dashboard", "/wallets", "/login"])("never overlays headers or modals on %s", async (path) => {
    // Without a browser install prompt there is nothing to show inside the app.
    expect(await render(path)).toBe("");
  });

  it("keeps the in-app pill under modals (z-50)", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/components/layout/pwa-install-button.tsx", "utf8");
    expect(source).not.toMatch(/top-\[calc/);
    expect(source).toMatch(/hidden md:block fixed md:bottom-6 md:left-6 z-30/);
  });
});
