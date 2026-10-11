import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { normalizeExpenseCategory } from "@/app/api/validation";
import type { BatchSyncRequest, BatchSyncResponse, SyncRejection } from "@/lib/types/sync";
import type { Expense } from "@/lib/types/expense";

/** Client clocks may run slightly ahead; anything further is clamped so a fast clock can't win LWW forever. */
const MAX_CLOCK_SKEW_MS = 60_000;
/** Pulls re-read this window before the cursor so rows committed by a concurrent request are not missed. */
const PULL_OVERLAP_MS = 60_000;
const MAX_AMOUNT = 2_000_000_000;
const ACTIONS = ["create", "update", "delete"];

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

/** Optional: omitted keeps the stored wallet, null clears it. */
function isValidWalletId(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || (typeof value === "string" && value.length > 0 && value.length <= 100);
}

/** Returns a rejection reason, or null when the change is acceptable. */
function validateChange(change: any): string | null {
  if (!change || typeof change.id !== "string") return "invalid_queue_id";
  if (!ACTIONS.includes(change.action)) return "invalid_action";
  const p = change.payload;
  if (!p || typeof p.id !== "string" || !p.id || p.id.length > 100) return "invalid_id";
  // A delete only needs the id; legacy rows with old categories must still be deletable.
  if (change.action === "delete") return null;
  if (typeof p.itemName !== "string" || !p.itemName.trim() || p.itemName.length > 200) return "invalid_item_name";
  if (!Number.isSafeInteger(p.amount) || p.amount < 1 || p.amount > MAX_AMOUNT) return "invalid_amount";
  if (!isValidDate(p.createdAt) || !isValidDate(p.updatedAt)) return "invalid_date";
  if (!isValidWalletId(p.walletId)) return "invalid_wallet_id";
  return null;
}

function clampClientTime(value: string, now: Date): Date {
  const time = new Date(value).getTime();
  return new Date(Math.min(time, now.getTime() + MAX_CLOCK_SKEW_MS));
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid. Silakan login." }, { status: 401 });
    }

    const body: BatchSyncRequest = await req.json();
    const clientChanges = Array.isArray(body?.clientChanges) ? body.clientChanges : [];
    const { lastSyncTimestamp } = body ?? {};
    const appliedIds: string[] = [];
    const rejectedIds: SyncRejection[] = [];
    const now = new Date();

    const isTransaction = Boolean((prisma as any).transaction);
    const targetModel = isTransaction ? (prisma as any).transaction : (prisma as any).expense;

    // Each change stands alone: one bad item must not roll back the rest of the batch.
    // Items that throw unexpectedly are neither applied nor rejected, so the client retries them.
    for (const change of clientChanges) {
      const reason = validateChange(change);
      if (reason) {
        if (typeof change?.id === "string") rejectedIds.push({ id: change.id, reason });
        continue;
      }

      const { id: queueId, action, payload } = change;
      try {
        const existing = await targetModel.findUnique({ where: { id: payload.id } });
        if (existing && existing.userId !== session.userId) {
          rejectedIds.push({ id: queueId, reason: "forbidden" });
          continue;
        }

        if (action === "delete") {
          if (existing) {
            await targetModel.update({
              where: { id: payload.id },
              data: { isDeleted: true, updatedAt: now },
            });
          }
        } else {
          const clientUpdatedAt = clampClientTime(payload.updatedAt, now);
          const data: any = isTransaction
            ? {
                itemName: payload.itemName.trim(),
                amount: payload.amount,
                type: payload.type || "expense",
                category: payload.category || "Lainnya",
                source: payload.source || "manual",
                transactionDate: payload.transactionDate
                  ? new Date(payload.transactionDate)
                  : clampClientTime(payload.createdAt, now),
                isDeleted: !!payload.isDeleted,
                updatedAt: clientUpdatedAt,
              }
            : {
                itemName: payload.itemName.trim(),
                amount: payload.amount,
                category: normalizeExpenseCategory(payload.category),
                walletId: payload.walletId,
                isDeleted: !!payload.isDeleted,
                updatedAt: clientUpdatedAt,
              };

          if (!existing) {
            await targetModel.create({
              data: {
                ...data,
                id: payload.id,
                userId: session.userId,
                createdAt: clampClientTime(payload.createdAt, now),
              },
            });
          } else if (clientUpdatedAt.getTime() >= existing.updatedAt.getTime()) {
            // Last-write-wins on the (clamped) client time; serverUpdatedAt is bumped by Prisma.
            await targetModel.update({ where: { id: payload.id }, data });
          }
        }
        appliedIds.push(queueId);
      } catch (err) {
        console.error(`Sync item ${queueId} gagal:`, err);
      }
    }

    // Pull by the server-assigned column: client updatedAt can be older than the cursor for
    // records edited offline, which would otherwise never reach other devices.
    const cursor = isValidDate(lastSyncTimestamp)
      ? new Date(new Date(lastSyncTimestamp).getTime() - PULL_OVERLAP_MS)
      : null;
    const serverRows = await targetModel.findMany({
      where: {
        userId: session.userId,
        ...(cursor ? { serverUpdatedAt: { gt: cursor } } : {}),
      },
    });

    const serverChanges: any[] = serverRows.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      type: row.type || "expense",
      itemName: row.itemName,
      amount: row.amount,
      category: row.category,
      source: row.source || "manual",
      transactionDate: row.transactionDate ? row.transactionDate.toISOString() : row.createdAt.toISOString(),
      walletId: row.walletId ?? null,
      isDeleted: row.isDeleted,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    const response: BatchSyncResponse = {
      appliedIds,
      rejectedIds,
      serverChanges,
      serverTimestamp: now.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal menyinkronkan data. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
