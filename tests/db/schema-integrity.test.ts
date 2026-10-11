import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Prisma Schema Core Structure", () => {
  it("defines User, Profile, Transaction, and Wishlist models", () => {
    const schema = fs.readFileSync(path.resolve("prisma/schema.prisma"), "utf8");
    expect(schema).toContain("model User");
    expect(schema).toContain("model Profile");
    expect(schema).toContain("model Transaction");
    expect(schema).toContain("model Wishlist");
    expect(schema).toContain("nickname");
    expect(schema).toContain("type");
  });
});
