import { NextResponse } from "next/server";
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

    const body = await req.json();
    const { id, itemName, amount, category, createdAt } = body;

    if (!itemName || !amount || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        id: id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId: session.userId,
        itemName,
        amount: Math.round(amount),
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
