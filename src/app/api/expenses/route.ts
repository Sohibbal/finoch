import { NextResponse } from "next/server";
import { EXPENSE_CATEGORIES } from "../validation";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.userId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ expenses }, { status: 200 });
  } catch (error) {
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
    const { id, itemName, amount, category, createdAt } = body;

    if (typeof itemName !== "string" || !itemName.trim() || itemName.length > 200
      || typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0 || amount > 2_000_000_000
      || !EXPENSE_CATEGORIES.includes(category)
      || (createdAt !== undefined && (typeof createdAt !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(createdAt)
        || !Number.isFinite(Date.parse(createdAt)) || new Date(createdAt.slice(0, 10)).toISOString().slice(0, 10) !== createdAt.slice(0, 10)))) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        id: id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: session.userId,
        itemName: itemName.trim(),
        amount,
        category,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
