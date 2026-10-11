import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import resolveConfig from "tailwindcss/resolveConfig";
import config from "../../tailwind.config";

it("defines every numeric navy shade referenced by source files", () => {
  const shades = new Set<string>();
  function scan(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) scan(file);
      else for (const match of readFileSync(file, "utf8").matchAll(/navy-(\d+)/g)) shades.add(match[1]);
    }
  }
  scan(path.resolve("src"));
  const colors = resolveConfig(config).theme.colors;
  expect(shades.size).toBeGreaterThan(0);
  for (const shade of shades) expect(colors, `Missing navy-${shade}`).toHaveProperty(`navy.${shade}`);
});
