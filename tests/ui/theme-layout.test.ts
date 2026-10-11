import { afterEach, beforeEach, expect, it, vi } from "vitest";
import React, { createElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { runInNewContext } from "node:vm";

vi.mock("next/font/google", () => ({ Archivo: () => ({ variable: "font-ui" }), Bricolage_Grotesque: () => ({ variable: "font-display" }) }));
vi.mock("@/components/layout/pwa-install-button", () => ({ PwaInstallButton: () => null }));
vi.mock("@/components/layout/offline-banner", () => ({ OfflineBanner: () => null }));
import RootLayout, { metadata } from "@/app/layout";

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it.each(["development", "test", "production"])("registers the service worker only in production (%s)", (env) => {
  vi.stubEnv("NODE_ENV", env);
  const markup = renderToStaticMarkup(createElement(RootLayout, { children: null }));
  expect(markup.includes("serviceWorker.register")).toBe(env === "production");
});

it("uses the generated manifest route", () => {
  expect(metadata.manifest).toBe("/manifest.webmanifest");
});

function bootScript(): string {
  function find(node: ReactNode): string | undefined {
    if (!node || typeof node !== "object" || !("props" in node)) return;
    const element = node as ReactElement<{ children?: ReactNode; dangerouslySetInnerHTML?: { __html: string } }>;
    const script = element.props.dangerouslySetInnerHTML?.__html;
    if (script?.includes("finoch_theme")) return script;
    for (const child of [element.props.children].flat()) {
      const result = find(child);
      if (result) return result;
    }
  }
  return find(RootLayout({ children: null }))!;
}

it.each(["voicash_theme", "finra_theme"])("boot script restores %s", (key) => {
  const toggle = vi.fn();
  runInNewContext(bootScript(), {
    localStorage: { getItem: (candidate: string) => candidate === key ? "dark" : null },
    window: { matchMedia: () => ({ matches: false }) },
    document: { documentElement: { classList: { toggle } } },
  });
  expect(toggle).toHaveBeenCalledWith("dark", true);
});

it("boot script applies system preference even when storage is blocked", () => {
  const toggle = vi.fn();
  runInNewContext(bootScript(), {
    localStorage: { getItem: () => { throw new Error("blocked"); } },
    window: { matchMedia: () => ({ matches: true }) },
    document: { documentElement: { classList: { toggle } } },
  });
  expect(toggle).toHaveBeenCalledWith("dark", true);
});
