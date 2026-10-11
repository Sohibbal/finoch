import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth/jwt";
import { isSyncedDocumentKey } from "@/lib/sync/document-keys";
import type { DocumentSyncResponse, SyncDocument } from "@/lib/types/sync";

/** Same clamp as expenses: a fast client clock can't win last-write-wins forever. */
const MAX_CLOCK_SKEW_MS = 60_000;
/** Pulls re-read this window before the cursor so rows committed by a concurrent request are not missed. */
const PULL_OVERLAP_MS = 60_000;
const MAX_CHANGES = 50;
const MAX_DOCUMENT_BYTES = 256 * 1024;

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

/** Returns a rejection reason, or null when the change is acceptable. */
function validateChange(change: any): string | null {
  if (!isSyncedDocumentKey(change.key)) return "invalid_key";
  if (!isValidDate(change.updatedAt)) return "invalid_date";
  if (change.isDeleted) return null;
  if (change.data === undefined || change.data === null) return "invalid_data";
  if (new TextEncoder().encode(JSON.stringify(change.data)).length > MAX_DOCUMENT_BYTES) return "too_large";
  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid. Silakan login." }, { status: 401 });
    }

    const body = await req.json();
    const changes: any[] = Array.isArray(body?.changes) ? body.changes : [];
    if (changes.length > MAX_CHANGES) {
      return NextResponse.json({ error: "Terlalu banyak perubahan dalam satu sinkronisasi." }, { status: 400 });
    }

    const userId = session.userId;
    const now = new Date();
    const appliedKeys: string[] = [];
    const rejected: DocumentSyncResponse["rejected"] = [];

    // ponytail: last-write-wins per whole key on the clamped client time. Two devices editing the same
    // list offline: the later write wins for the entire list. Upgrade path: one document per item.
    for (const change of changes) {
      const reason = change && typeof change === "object" ? validateChange(change) : "invalid_key";
      if (reason) {
        if (typeof change?.key === "string") rejected.push({ key: change.key, reason });
        continue;
      }
      const key: string = change.key;
      try {
        const clientUpdatedAt = new Date(Math.min(new Date(change.updatedAt).getTime(), now.getTime() + MAX_CLOCK_SKEW_MS));
        const data = { data: change.isDeleted ? {} : change.data, isDeleted: !!change.isDeleted, clientUpdatedAt };
        const existing = await prisma.userDocument.findUnique({ where: { userId_key: { userId, key } } });
        if (!existing) {
          await prisma.userDocument.create({ data: { ...data, userId, key } });
        } else if (clientUpdatedAt.getTime() >= existing.clientUpdatedAt.getTime()) {
          await prisma.userDocument.update({ where: { id: existing.id }, data });
        }
        // A losing write is settled too: the current server copy comes back below.
        appliedKeys.push(key);
      } catch (err) {
        // Neither applied nor rejected: the client keeps it dirty and retries.
        console.error(`Sync dokumen ${key} gagal:`, err);
      }
    }

    // Changed since the cursor, plus every key this request pushed, so a push that lost LWW gets the winner back.
    const since = isValidDate(body?.since) ? new Date(new Date(body.since).getTime() - PULL_OVERLAP_MS) : null;
    const pushedKeys = changes.filter((c) => isSyncedDocumentKey(c?.key)).map((c) => c.key as string);
    const rows = await prisma.userDocument.findMany({
      where: {
        userId,
        ...(since ? { OR: [{ serverUpdatedAt: { gt: since } }, { key: { in: pushedKeys } }] } : {}),
      },
    });
    const documents: SyncDocument[] = rows.map((row) => ({
      key: row.key,
      data: row.data,
      isDeleted: row.isDeleted,
      updatedAt: row.clientUpdatedAt.toISOString(),
    }));

    const response: DocumentSyncResponse = { appliedKeys, rejected, documents, serverTime: now.toISOString() };
    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Gagal menyinkronkan data. Silakan coba lagi." }, { status: 500 });
  }
}
