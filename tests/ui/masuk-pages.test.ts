import { describe, it, expect, vi } from "vitest";
import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/login",
}));
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: null, login: vi.fn(), register: vi.fn(), logout: vi.fn(), isLoading: false, error: null }),
}));

describe("landing page", () => {
  const source = readFileSync("src/app/page.tsx", "utf8") + readFileSync("src/components/landing/sentence-press.tsx", "utf8");

  it("shows no unmeasured claims, generator notes or glass/bezel classes", () => {
    for (const banned of ["0.3", "99.2", "0 Byte", "100% Offline", "100% offline", "Hallmark", "double-bezel", "glass-pill", "Masuk ke Dashboard PWA"]) {
      expect(source).not.toContain(banned);
    }
  });

  it("sets every landing heading in the press scale (head or the numeral clamp), no clamp of its own", () => {
    expect(source).not.toMatch(/text-\[clamp/);
    expect(source).toContain("text-numeral");
  });

  it("keeps no generator comments in the global stylesheet", () => {
    expect(readFileSync("src/app/globals.css", "utf8")).not.toMatch(/Bezel|Premium Glass|Dicoding/);
  });

  it("prints the signature sentence into two stubs with the real parser", async () => {
    const { pressSentence, SAMPLE_SENTENCES } = await import("@/components/landing/sentence-press");
    const stubs = pressSentence(SAMPLE_SENTENCES[0], "2026-10-11", 1);
    expect(stubs.map((s) => [s.amount, s.category])).toEqual([
      [18000, "Food & Drinks"],
      [5000, "Food & Drinks"],
    ]);
    // Each stub gets its own serial.
    expect(new Set(stubs.map((s) => s.id)).size).toBe(2);
  });

  it("stamps the example jatah with the dashboard's status rule", async () => {
    const { demoStatus, EXAMPLE_JATAH } = await import("@/components/landing/sentence-press");
    expect(EXAMPLE_JATAH).toBe(42500);
    expect(demoStatus(23000)).toBe("aman");
    expect(demoStatus(35000)).toBe("mepet");
    expect(demoStatus(42500)).toBe("habis");
  });
});

describe("onboarding", () => {
  it("renders typewriter card asking for user nickname", async () => {
    const { default: Onboarding } = await import("@/app/onboarding/page");
    const html = renderToString(React.createElement(Onboarding));
    expect(html).not.toContain("Digital Twin");
    expect(html).toContain("FinBot");
    expect(html).toMatch(/<input[^>]*id="nickname-input"/);
    expect(html).toContain("Mulai Berteman");
  });
});

describe("auth slider", () => {
  it("labels every field and keeps the hidden panel out of the tab order", async () => {
    const { AuthSlider } = await import("@/components/auth/auth-slider");
    const html = renderToString(React.createElement(AuthSlider, { initialMode: "login" }));
    for (const id of ["login-email", "login-password", "reg-name", "reg-email", "reg-password"]) {
      expect(html).toContain(`for="${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toMatch(/aria-pressed="true"[^>]*>Masuk</);
    // Only the register panel (off-screen) is inert.
    expect(html.match(/inert=""/g)).toHaveLength(1);
    expect(html.indexOf('inert=""')).toBeGreaterThan(html.indexOf('id="login-password"'));
  });
});
