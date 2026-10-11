"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Calendar, Home, Zap, Tv, GraduationCap, Package } from "lucide-react";
import { RecurringBill, BillCategory } from "@/types/bill-types";

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bill: Omit<RecurringBill, "id" | "isPaidThisMonth" | "createdAt">) => void;
  initialData?: RecurringBill | null;
}

export function BillFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: BillFormModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BillCategory>("kos");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setAmount(String(initialData.amount));
      setDueDay(String(initialData.dueDay));
      setReminderDaysBefore(String(initialData.reminderDaysBefore));
      setNote(initialData.note || "");
    } else {
      setName("");
      setCategory("kos");
      setAmount("");
      setDueDay("1");
      setReminderDaysBefore("3");
      setNote("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount.replace(/[^0-9]/g, ""));
    const numDueDay = Math.max(1, Math.min(31, Number(dueDay) || 1));
    if (!name.trim() || numAmount <= 0) return;

    onSubmit({
      name: name.trim(),
      category,
      amount: numAmount,
      dueDay: numDueDay,
      frequency: "monthly",
      reminderDaysBefore: Number(reminderDaysBefore) || 3,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const applyPreset = (
    pName: string,
    pCat: BillCategory,
    pAmount: number,
    pDay: number
  ) => {
    setName(pName);
    setCategory(pCat);
    setAmount(String(pAmount));
    setDueDay(String(pDay));
  };

  const categories: { key: BillCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "kos", label: "Kamar Kos", icon: Home },
    { key: "utilities", label: "WiFi & Listrik", icon: Zap },
    { key: "subscription", label: "Langganan", icon: Tv },
    { key: "education", label: "Kuliah & Buku", icon: GraduationCap },
    { key: "other", label: "Lainnya", icon: Package },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
      <div className="bg-paper-sheet border border-ink/20 rounded-sm w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-ink/20">
          <h2 className="text-sm sm:text-base font-bold text-ink">
            {initialData ? "Edit Tagihan Rutin" : "Tambah Tagihan Rutin Mahasiswa"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-ink-soft hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Presets for Students */}
          {!initialData && (
            <div className="space-y-1.5">
              <span className="text-meta font-bold text-ink-soft">
                Preset Cepat Anak Kost:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset("Kamar Kos", "kos", 850000, 1)}
                  className="text-meta px-2.5 py-1 rounded-sm bg-paper-deep hover:bg-ink/5 text-ink border border-ink/20"
                >
                  Uang Kos (850k - Tgl 1)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("WiFi Kosan", "utilities", 45000, 10)}
                  className="text-meta px-2.5 py-1 rounded-sm bg-paper-deep hover:bg-ink/5 text-ink border border-ink/20"
                >
                  WiFi (45k - Tgl 10)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Token Listrik", "utilities", 60000, 15)}
                  className="text-meta px-2.5 py-1 rounded-sm bg-paper-deep hover:bg-ink/5 text-ink border border-ink/20"
                >
                  Listrik (60k - Tgl 15)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Spotify Family", "subscription", 25000, 25)}
                  className="text-meta px-2.5 py-1 rounded-sm bg-paper-deep hover:bg-ink/5 text-ink border border-ink/20"
                >
                  Spotify (25k)
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Nama Tagihan
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kamar Kos Lantai 2 / Laundry Bulanan"
              className="w-full px-3 py-2 bg-paper-sheet border border-ink/20 rounded-sm text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`flex items-center gap-1.5 p-2 rounded-sm text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-ink text-paper-sheet border-transparent font-bold"
                        : "bg-paper-sheet text-ink border-ink/20"
                    }`}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                required
                min="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 850000"
                className="w-full px-3 py-2 bg-paper-sheet border border-ink/20 rounded-sm text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Jatuh Tempo (Tgl 1-31)
              </label>
              <input
                type="number"
                required
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 bg-paper-sheet border border-ink/20 rounded-sm text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft text-center"
              />
            </div>
          </div>

          {/* Reminder days */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Ingatkan Berapa Hari Sebelum Jatuh Tempo?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setReminderDaysBefore(String(days))}
                  className={`flex-1 py-1.5 rounded-sm text-xs font-semibold border transition-all ${
                    Number(reminderDaysBefore) === days
                      ? "bg-ink text-paper-sheet border-aman-ink/40"
                      : "bg-paper-sheet text-ink border-ink/20"
                  }`}
                >
                  H-{days}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: No Rek Ibu Kos BCA 12345 / Bayar via Gopay"
              className="w-full px-3 py-2 bg-paper-sheet border border-ink/20 rounded-sm text-xs text-ink focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-sm bg-ink hover:bg-ink/90 text-paper-sheet text-xs font-bold transition-all active:scale-95"
            >
              {initialData ? "Simpan Perubahan Tagihan" : "Tambahkan ke Tagihan Rutin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
