"use client";

import React from "react";
import {
  HandCoins,
  CheckCircle2,
  Trash2,
  Send,
  X,
  AlertCircle,
} from "lucide-react";
import { TalanganRecord } from "@/types/split-bill-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface TalanganHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TalanganRecord[];
  onMarkPaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TalanganHistoryModal({
  isOpen,
  onClose,
  records,
  onMarkPaid,
  onDelete,
}: TalanganHistoryModalProps) {
  if (!isOpen) return null;

  const unpaidRecords = records.filter((r) => !r.isPaid);
  const paidRecords = records.filter((r) => r.isPaid);
  const totalUnpaid = unpaidRecords.reduce((acc, r) => acc + r.amount, 0);

  const sendReminder = (record: TalanganRecord) => {
    const text = `Halo ${record.friendName}, mau ngingetin patungan makan ${record.restaurantName} kemarin: *${formatRupiah(
      record.amount
    )}* belum sempat kamu transfer yaa. Kalau sempat ditunggu ya bro/sis, makasih banyak! 🙌`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cream-200 dark:border-navy-800">
          <div className="flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-bold text-navy-950 dark:text-cream-50">
              Buku Talangan Teman (Piutang)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-navy-400 hover:text-navy-700 dark:hover:text-cream-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Outstanding Banner */}
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Total Uangmu yang Masih Ditalangi:
            </span>
          </div>
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">
            {formatRupiah(totalUnpaid)}
          </span>
        </div>

        {/* Records Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-10 space-y-2 text-navy-400 dark:text-cream-300/40">
              <HandCoins className="w-8 h-8 mx-auto opacity-50 stroke-[1.5]" />
              <p className="text-xs">
                Belum ada catatan talangan. Setiap kali kamu split bill, nominal teman bisa otomatis disimpan ke sini!
              </p>
            </div>
          ) : (
            <>
              {/* Unpaid */}
              {unpaidRecords.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-navy-600 dark:text-cream-300/70 uppercase tracking-wider">
                    Belum Lunas ({unpaidRecords.length})
                  </h3>
                  {unpaidRecords.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-xl border border-cream-200 dark:border-navy-800 bg-cream-50/50 dark:bg-navy-950/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-navy-950 dark:text-cream-50 truncate">
                            {r.friendName}
                          </span>
                          <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                            {formatRupiah(r.amount)}
                          </span>
                        </div>
                        <p className="text-[11px] text-navy-500 dark:text-cream-300/60 truncate">
                          {r.restaurantName} · {r.itemsSummary || "Patungan makan"}
                        </p>
                        <span className="text-[10px] text-navy-400 dark:text-cream-300/40">
                          {r.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => sendReminder(r)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm"
                          title="Kirim pengingat WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>Ingatkan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onMarkPaid(r.id)}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Tandai sudah lunas"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(r.id)}
                          className="p-1.5 rounded-lg text-navy-400 hover:text-rose-500 transition-colors"
                          title="Hapus catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paid */}
              {paidRecords.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-cream-200 dark:border-navy-800">
                  <h3 className="text-xs font-bold text-navy-600 dark:text-cream-300/70 uppercase tracking-wider">
                    Sudah Lunas ({paidRecords.length})
                  </h3>
                  {paidRecords.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl border border-cream-200/60 dark:border-navy-800/60 bg-cream-50/20 dark:bg-navy-950/20 flex items-center justify-between opacity-75"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-navy-700 dark:text-cream-200">
                            {r.friendName}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 line-through">
                            {formatRupiah(r.amount)}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                            Lunas
                          </span>
                        </div>
                        <p className="text-[10px] text-navy-400 dark:text-cream-300/40">
                          {r.restaurantName}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDelete(r.id)}
                        className="p-1 text-navy-300 hover:text-rose-500 transition-colors"
                        title="Hapus riwayat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-cream-50 dark:bg-navy-950 border-t border-cream-200 dark:border-navy-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 text-xs font-bold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
