"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { expenseStorage } from "@/lib/storage/expense-storage";
import { syncManager } from "@/lib/sync/sync-manager";
import { localDateKey } from "@/lib/date";
import { rupiah } from "@/lib/format";
import { LABEL_CLASS, PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";
import { WalletPicker } from "@/components/wallets/wallet-picker";
import { ExpenseEditor, INPUT_CLASS, type EditableExpense } from "./expense-editor";

export interface RecordData extends EditableExpense {
  id: string;
  walletId?: string | null;
  /** Local YYYY-MM-DD. */
  date: string;
}

interface RecordSheetProps {
  /** Mount with key={record.id} so the fields start from this record. */
  record: RecordData;
  /** Keep it stable (useCallback): the dialog re-focuses itself when it changes. */
  onClose: () => void;
  /** Reload so the jatah and wallet balances re-print. */
  onChanged: () => void | Promise<void>;
}

const NOT_HERE = "Catatan ini belum ada di HP ini. Tunggu sinkron selesai, lalu coba lagi.";

/** One saved record: fix name, amount, category, wallet or day, or delete it. */
export function RecordSheet({ record, onClose, onChanged }: RecordSheetProps) {
  const [walletId, setWalletId] = useState<string | undefined>(record.walletId ?? undefined);
  const [date, setDate] = useState(record.date);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const finish = async (ok: boolean) => {
    if (!ok) {
      setError(NOT_HERE);
      setBusy(false);
      return;
    }
    syncManager.triggerSync();
    await onChanged();
    onClose();
  };

  const handleSave = async (fields: EditableExpense) => {
    setBusy(true);
    setError(null);
    try {
      const edited = await expenseStorage.editExpense(record.id, {
        ...fields,
        // Untouched: keep whatever wallet (or none) the record already has.
        ...(walletId !== (record.walletId ?? undefined) && { walletId }),
        date,
      });
      await finish(Boolean(edited));
    } catch {
      setError("Gagal menyimpan perubahan. Coba lagi.");
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await finish(await expenseStorage.deleteExpense(record.id));
    } catch {
      setError("Gagal menghapus. Coba lagi.");
      setBusy(false);
    }
  };

  return (
    <PaperDialog isOpen onClose={onClose} title="Ubah catatan">
      {confirmDelete ? (
        <div className="space-y-4">
          <p className="text-body text-ink">
            Hapus <span className="font-semibold">{record.itemName}</span>{" "}
            <span className="money font-semibold">{rupiah(record.amount)}</span>? Jatah dan saldo dompet dihitung ulang tanpa catatan ini.
          </p>
          {error && <p role="alert" className="text-body text-habis-ink">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmDelete(false)} disabled={busy} className={SECONDARY_CLASS}>
              Batal
            </button>
            <button type="button" onClick={handleDelete} disabled={busy} className={`${PRIMARY_CLASS} flex-1`}>
              {busy ? "Menghapus..." : "Ya, hapus"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <ExpenseEditor item={record} onSave={handleSave} onCancel={onClose} submitLabel={busy ? "Menyimpan..." : "Simpan perubahan"} busy={busy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <WalletPicker value={walletId} onChange={setWalletId} label="Dompet" />
              <div>
                <label htmlFor="record-date" className={LABEL_CLASS}>Tanggal</label>
                <input
                  id="record-date"
                  type="date"
                  value={date}
                  max={localDateKey(new Date())}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
            {error && <p role="alert" className="text-body text-habis-ink">{error}</p>}
          </ExpenseEditor>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            className="inline-flex items-center gap-2 min-h-11 text-body font-semibold text-ink underline underline-offset-4 decoration-ink/40 hover:decoration-ink"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Hapus catatan
          </button>
        </div>
      )}
    </PaperDialog>
  );
}
