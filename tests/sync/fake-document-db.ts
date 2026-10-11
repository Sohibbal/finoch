// In-memory stand-in for prisma.userDocument, enough for the /api/sync/documents handler.
type Row = {
  id: string;
  userId: string;
  key: string;
  data: unknown;
  isDeleted: boolean;
  clientUpdatedAt: Date;
  serverUpdatedAt: Date;
};

export function createFakeDocumentDb() {
  const rows: Row[] = [];
  const clone = (row: Row) => structuredClone(row);
  return {
    rows,
    userDocument: {
      findUnique: async ({ where }: any) => {
        const row = rows.find((r) => r.userId === where.userId_key.userId && r.key === where.userId_key.key);
        return row ? clone(row) : null;
      },
      create: async ({ data }: any) => {
        const row = { id: `doc-${rows.length + 1}`, ...structuredClone(data), serverUpdatedAt: new Date() };
        rows.push(row);
        return clone(row);
      },
      update: async ({ where, data }: any) => {
        const row = rows.find((r) => r.id === where.id)!;
        Object.assign(row, structuredClone(data), { serverUpdatedAt: new Date() });
        return clone(row);
      },
      findMany: async ({ where }: any) =>
        rows
          .filter((r) => r.userId === where.userId)
          .filter(
            (r) =>
              !where.OR ||
              where.OR.some((c: any) => (c.serverUpdatedAt ? r.serverUpdatedAt > c.serverUpdatedAt.gt : c.key.in.includes(r.key)))
          )
          .map(clone),
    },
  };
}
