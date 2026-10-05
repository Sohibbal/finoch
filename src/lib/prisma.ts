import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function getDatabaseUrl(): string {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {}
  return process.env.DATABASE_URL || "";
}

const currentDbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  databaseUrl: string | undefined;
};

export const prisma =
  globalForPrisma.prisma && globalForPrisma.databaseUrl === currentDbUrl
    ? globalForPrisma.prisma
    : new PrismaClient({
        datasources: currentDbUrl ? { db: { url: currentDbUrl } } : undefined,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.databaseUrl = currentDbUrl;
}

