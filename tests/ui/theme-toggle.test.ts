import { afterEach, describe, it, expect, vi } from "vitest";
import { useTheme } from "@/hooks/use-theme";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useState: (value: unknown) => [value, vi.fn()], useEffect: (effect: () => void) => effect() };
});
afterEach(() => vi.unstubAllGlobals());

describe("Theme Toggle Component", () => {
  it("exports ThemeToggle component", async () => {
    const mod = await import("@/components/layout/theme-toggle");
    expect(mod.ThemeToggle).toBeDefined();
  });

  it.each([false, true])("toggles repeatedly with blocked storage: %s", (blocked) => {
    let dark = false;
    const setItem = vi.fn(() => { if (blocked) throw new Error("blocked"); });
    vi.stubGlobal("localStorage", { getItem: () => null, setItem });
    vi.stubGlobal("document", { documentElement: { classList: {
      contains: () => dark,
      toggle: (_name: string, value: boolean) => { dark = value; },
    } } });
    vi.stubGlobal("window", new EventTarget());
    const theme = useTheme();
    theme.toggleTheme();
    expect(dark).toBe(true);
    expect(setItem).toHaveBeenLastCalledWith("finoch_theme", "dark");
    theme.toggleTheme();
    expect(dark).toBe(false);
    expect(setItem).toHaveBeenLastCalledWith("finoch_theme", "light");
    expect(setItem).toHaveBeenCalledTimes(2);
  });
});
