"use client";

import React, { useState, useEffect } from "react";
import { Home, Zap, Tv, GraduationCap, Package } from "lucide-react";
import { FIELD_CLASS, LABEL_CLASS, OptionButton, PaperDialog, PRIMARY_CLASS } from "@/components/press/kampus-press";
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

  const presets: { label: string; name: string; category: BillCategory; amount: number; day: number }[] = [
    { label: "Kos 850rb, tgl 1", name: "Kamar Kos", category: "kos", amount: 850000, day: 1 },
    { label: "WiFi 45rb, tgl 10", name: "WiFi Kosan", category: "utilities", amount: 45000, day: 10 },
    { label: "Listrik 60rb, tgl 15", name: "Token Listrik", category: "utilities", amount: 60000, day: 15 },
    { label: "Spotify 25rb, tgl 25", name: "Spotify Family", category: "subscription", amount: 25000, day: 25 },
  ];

  return (
    <PaperDialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Ubah tagihan" : "Tambah tagihan rutin"}
      subtitle="Ditagih tiap bulan di tanggal yang sama"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!initialData && (
          <fieldset className="space-y-1.5">
            <legend className={LABEL_CLASS}>Tagihan anak kos yang umum</legend>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.name, p.category, p.amount, p.day)}
                  className="min-h-11 px-3 rounded-full border border-ink/25 text-body text-ink hover:bg-ink/5 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <label htmlFor="bill-name" className={LABEL_CLASS}>
            Nama tagihan
          </label>
          <input
            id="bill-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kamar kos lantai 2, laundry bulanan"
            className={FIELD_CLASS}
          />
        </div>

        <fieldset>
          <legend className={LABEL_CLASS}>Kategori</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <OptionButton
                  key={cat.key}
                  pressed={category === cat.key}
                  onClick={() => setCategory(cat.key)}
                  className="flex items-center gap-1.5 text-left"
                >
                  <CatIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </OptionButton>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="bill-amount" className={LABEL_CLASS}>
              Nominal per bulan (Rp)
            </label>
            <input
              id="bill-amount"
              type="number"
              inputMode="numeric"
              required
              min="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="850000"
              className={`${FIELD_CLASS} money`}
            />
          </div>

          <div>
            <label htmlFor="bill-due" className={LABEL_CLASS}>
              Jatuh tempo (tgl 1–31)
            </label>
            <input
              id="bill-due"
              type="number"
              inputMode="numeric"
              required
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="1"
              className={`${FIELD_CLASS} money`}
            />
          </div>
        </div>

        <fieldset>
          <legend className={LABEL_CLASS}>Ingatkan berapa hari sebelumnya</legend>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 5, 7].map((days) => (
              <OptionButton
                key={days}
                pressed={Number(reminderDaysBefore) === days}
                onClick={() => setReminderDaysBefore(String(days))}
                aria-label={`${days} hari sebelumnya`}
              >
                H-{days}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="bill-note" className={LABEL_CLASS}>
            Catatan bayar (boleh kosong)
          </label>
          <input
            id="bill-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Rek BCA ibu kos 12345, atau bayar via GoPay"
            className={FIELD_CLASS}
          />
        </div>

        <button type="submit" className={`${PRIMARY_CLASS} w-full`}>
          {initialData ? "Simpan tagihan" : "Tambah ke tagihan rutin"}
        </button>
      </form>
    </PaperDialog>
  );
}
