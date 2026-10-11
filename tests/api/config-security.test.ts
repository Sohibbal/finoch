import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("deployment configuration", () => {
  it("lets Prisma resolve DATABASE_URL without reading and overriding it", () => {
    const source = readFileSync("src/lib/prisma.ts", "utf8");
    expect(source).not.toMatch(/readFileSync|datasources:|getDatabaseUrl/);
  });
  it("keeps local database credentials consistent and binds only loopback", () => {
    const env = readFileSync(".env.example", "utf8");
    const compose = readFileSync("docker-compose.yml", "utf8");
    expect(env).toContain("postgres:postgrespassword@localhost");
    expect(compose).toContain("POSTGRES_PASSWORD: postgrespassword");
    expect(compose).toContain('"127.0.0.1:5432:5432"');
    expect(env).toContain('JWT_SECRET="REPLACE_WITH_RANDOM_SECRET"');
  });
});
