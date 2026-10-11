import { afterEach, describe, expect, it, vi } from "vitest";
import { readTheme } from "@/hooks/use-theme";

afterEach(() => vi.unstubAllGlobals());

describe("theme persistence", () => {
  it.each(["voicash_theme", "finra_theme"])("migrates %s on the first read", (key) => {
    const values = new Map([[key, "dark"]]);
    const setItem = vi.fn((key: string, value: string) => values.set(key, value));
    vi.stubGlobal("localStorage", { getItem: (key: string) => values.get(key) ?? null, setItem });
    expect(readTheme()).toBe("dark");
    expect(setItem).toHaveBeenCalledExactlyOnceWith("finoch_theme", "dark");
    readTheme();
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  it("prefers the canonical value over legacy values", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: (key: string) => key === "finoch_theme" ? "light" : "dark", setItem });
    expect(readTheme()).toBe("light");
    expect(setItem).not.toHaveBeenCalled();
  });

  it("tolerates blocked storage reads", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("blocked"); } });
    expect(readTheme()).toBeNull();
  });

  it("preserves the legacy preference when migration cannot be saved", () => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => key === "voicash_theme" ? "light" : null,
      setItem: () => { throw new Error("blocked"); },
    });
    expect(readTheme()).toBe("light");
  });
});
