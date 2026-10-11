import { NextResponse } from "next/server";
import { normalizeExpenseCategory } from "../validation";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const target = (prisma as any).transaction ?? (prisma as any).expense;
    if (!target) {
      return NextResponse.json({ expenses: [] }, { status: 200 });
    }

    const rows = await target.findMany({
      where: {
        userId: session.userId,
        isDeleted: false,
        ...((prisma as any).transaction ? { type: "expense" } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ expenses: rows }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "JSON tidak valid." }, { status: 400 });
    }
    const { id, itemName, amount, category, createdAt, walletId } = body;

    if (typeof itemName !== "string" || !itemName.trim() || itemName.length > 200
      || typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0 || amount > 2_000_000_000
      || (createdAt !== undefined && (typeof createdAt !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(createdAt)
        || !Number.isFinite(Date.parse(createdAt)) || new Date(createdAt.slice(0, 10)).toISOString().slice(0, 10) !== createdAt.slice(0, 10)))
      || (walletId !== undefined && walletId !== null && (typeof walletId !== "string" || !walletId || walletId.length > 100))) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const target = (prisma as any).transaction ?? (prisma as any).expense;
    const isTx = Boolean((prisma as any).transaction);
    const expense = await target.create({
      data: isTx
        ? {
            id: id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            userId: session.userId,
            type: "expense",
            itemName: itemName.trim(),
            amount,
            category: normalizeExpenseCategory(category),
            source: "manual",
            transactionDate: createdAt ? new Date(createdAt) : new Date(),
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: new Date(),
          }
        : {
            id: id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            userId: session.userId,
            itemName: itemName.trim(),
            amount,
            category: normalizeExpenseCategory(category),
            walletId: walletId ?? null,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: new Date(),
          },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
