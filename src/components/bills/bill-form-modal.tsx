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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cream-200 dark:border-navy-800">
          <h2 className="text-sm sm:text-base font-bold text-navy-950 dark:text-cream-50">
            {initialData ? "Edit Tagihan Rutin" : "Tambah Tagihan Rutin Mahasiswa"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-navy-400 hover:text-navy-700 dark:hover:text-cream-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Presets for Students */}
          {!initialData && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-navy-600 dark:text-cream-300/70">
                Preset Cepat Anak Kost:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPreset("Kamar Kos", "kos", 850000, 1)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700"
                >
                  Uang Kos (850k - Tgl 1)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("WiFi Kosan", "utilities", 45000, 10)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700"
                >
                  WiFi (45k - Tgl 10)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Token Listrik", "utilities", 60000, 15)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700"
                >
                  Listrik (60k - Tgl 15)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("Spotify Family", "subscription", 25000, 25)}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700"
                >
                  Spotify (25k)
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
              Nama Tagihan
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Kamar Kos Lantai 2 / Laundry Bulanan"
              className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
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
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-navy-900 text-cream-50 dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm font-bold"
                        : "bg-cream-50 dark:bg-navy-950 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-800"
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
              <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
                Nominal (Rp)
              </label>
              <input
                type="number"
                required
                min="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 850000"
                className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
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
                className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-center"
              />
            </div>
          </div>

          {/* Reminder days */}
          <div>
            <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
              Ingatkan Berapa Hari Sebelum Jatuh Tempo?
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setReminderDaysBefore(String(days))}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    Number(reminderDaysBefore) === days
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-cream-50 dark:bg-navy-950 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-800"
                  }`}
                >
                  H-{days}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: No Rek Ibu Kos BCA 12345 / Bayar via Gopay"
              className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {initialData ? "Simpan Perubahan Tagihan" : "Tambahkan ke Tagihan Rutin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
