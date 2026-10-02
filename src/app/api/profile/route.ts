import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { validateOnboardingProfile } from "./validator";

export async function GET(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.financialProfile.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch financial profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = validateOnboardingProfile(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    const {
      monthlyIncome,
      incomeType,
      currentSavings,
      monthlyFixedExpenses,
      financialPriority,
      currency,
    } = body;

    const profile = await prisma.financialProfile.upsert({
      where: { userId: session.userId },
      update: {
        monthlyIncome: Math.round(monthlyIncome),
        incomeType,
        currentSavings: Math.round(currentSavings),
        monthlyFixedExpenses: Math.round(monthlyFixedExpenses),
        financialPriority: financialPriority || "saving",
        currency: currency || "IDR",
        updatedAt: new Date(),
      },
      create: {
        userId: session.userId,
        monthlyIncome: Math.round(monthlyIncome),
        incomeType,
        currentSavings: Math.round(currentSavings),
        monthlyFixedExpenses: Math.round(monthlyFixedExpenses),
        financialPriority: financialPriority || "saving",
        currency: currency || "IDR",
      },
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save financial profile" },
      { status: 500 }
    );
  }
}
