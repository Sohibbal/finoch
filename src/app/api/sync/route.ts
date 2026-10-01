import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import type { BatchSyncRequest, BatchSyncResponse } from "@/lib/types/sync";
import type { Expense } from "@/lib/types/expense";

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid. Silakan login." }, { status: 401 });
    }

    const body: BatchSyncRequest = await req.json();
    const { clientChanges = [], lastSyncTimestamp } = body;
    const appliedIds: string[] = [];
    const serverTimestamp = new Date().toISOString();

    // Process client mutations inside a transaction
    await prisma.$transaction(async (tx) => {
      for (const change of clientChanges) {
        const { id: queueId, action, payload } = change;
        if (!payload || !payload.id) continue;

        if (action === "create" || action === "update") {
          const existing = await tx.expense.findUnique({
            where: { id: payload.id },
          });

          if (!existing) {
            await tx.expense.create({
              data: {
                id: payload.id,
                userId: session.userId,
                itemName: payload.itemName,
                amount: payload.amount,
                category: payload.category,
                isDeleted: !!payload.isDeleted,
                createdAt: new Date(payload.createdAt),
                updatedAt: new Date(payload.updatedAt),
              },
            });
            appliedIds.push(queueId);
          } else {
            // Ensure record belongs to authenticated user
            if (existing.userId === session.userId) {
              const clientTime = new Date(payload.updatedAt).getTime();
              const serverTime = existing.updatedAt.getTime();

              if (clientTime >= serverTime) {
                await tx.expense.update({
                  where: { id: payload.id },
                  data: {
                    itemName: payload.itemName,
                    amount: payload.amount,
                    category: payload.category,
                    isDeleted: !!payload.isDeleted,
                    updatedAt: new Date(payload.updatedAt),
                  },
                });
              }
              appliedIds.push(queueId);
            }
          }
        } else if (action === "delete") {
          const existing = await tx.expense.findUnique({
            where: { id: payload.id },
          });
          if (existing && existing.userId === session.userId) {
            await tx.expense.update({
              where: { id: payload.id },
              data: {
                isDeleted: true,
                updatedAt: new Date(),
              },
            });
          }
          appliedIds.push(queueId);
        }
      }
    });

    // Fetch remote records modified since lastSyncTimestamp
    let serverExpenses: any[] = [];
    if (lastSyncTimestamp) {
      serverExpenses = await prisma.expense.findMany({
        where: {
          userId: session.userId,
          updatedAt: { gt: new Date(lastSyncTimestamp) },
        },
      });
    } else {
      serverExpenses = await prisma.expense.findMany({
        where: {
          userId: session.userId,
        },
      });
    }

    const serverChanges: Expense[] = serverExpenses.map(exp => ({
      id: exp.id,
      userId: exp.userId,
      itemName: exp.itemName,
      amount: exp.amount,
      category: exp.category as any,
      isDeleted: exp.isDeleted,
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString(),
    }));

    const response: BatchSyncResponse = {
      appliedIds,
      serverChanges,
      serverTimestamp,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal menyinkronkan data. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
