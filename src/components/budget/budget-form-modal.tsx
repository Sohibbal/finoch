"use client";

import React, { useState, useEffect } from "react";
import {
  Utensils,
  Home,
  Car,
  Coffee,
  Shield,
  BookOpen,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { DenomPicker } from "@/components/press/denom";
import { FIELD_CLASS, LABEL_CLASS, OptionButton, PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";
import { BudgetEnvelope } from "@/types/budget-types";

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEnvelope?: BudgetEnvelope | null;
  onSave: (data: {
    name: string;
    allocatedAmount: number;
    icon: string;
    color: string;
    categoryAliases: string[];
    rollover?: boolean;
    notes?: string;
  }) => void;
}

const AVAILABLE_ICONS = [
  { id: "utensils", label: "Makan", icon: Utensils },
  { id: "home", label: "Kost", icon: Home },
  { id: "car", label: "Transport", icon: Car },
  { id: "coffee", label: "Nongkrong", icon: Coffee },
  { id: "shield", label: "Darurat", icon: Shield },
  { id: "book", label: "Kuliah", icon: BookOpen },
  { id: "shopping", label: "Belanja", icon: ShoppingBag },
  { id: "sparkles", label: "Hobi", icon: Sparkles },
];

const STUDENT_PRESETS = [
  {
    name: "Skripsi & Modul Kuliah",
    amount: 150000,
    icon: "book",
    color: "cyan",
    aliases: "Education, Education & Career, Buku, Cetak",
    notes: "Fotokopi materi, beli buku pegangan kuliah",
  },
  {
    name: "Laundry & Galon Kost",
    amount: 120000,
    icon: "home",
    color: "blue",
    aliases: "Laundry, Galon, Kost & Utilitas",
    notes: "Laundry kiloan & air minum galon kamar",
  },
  {
    name: "Kencan & Kasih Hadiah",
    amount: 200000,
    icon: "sparkles",
    color: "purple",
    aliases: "Social & Family, Entertainment",
    notes: "Nonton bioskop, makan malam, kado ultah teman",
  },
  {
    name: "Investasi & Reksadana",
    amount: 250000,
    icon: "shield",
    color: "emerald",
    aliases: "Savings, Investment, Bibit",
    notes: "Nabung rutin reksadana pasar uang",
  },
];

export function BudgetFormModal({
  isOpen,
  onClose,
  initialEnvelope,
  onSave,
}: BudgetFormModalProps) {
  const [name, setName] = useState("");
  const [allocatedAmount, setAllocatedAmount] = useState<number>(300000);
  const [icon, setIcon] = useState("utensils");
  const [color, setColor] = useState("emerald");
  const [aliasesText, setAliasesText] = useState("");
  const [rollover, setRollover] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialEnvelope) {
        setName(initialEnvelope.name);
        setAllocatedAmount(initialEnvelope.allocatedAmount);
        setIcon(initialEnvelope.icon);
        setColor(initialEnvelope.color);
        setAliasesText(initialEnvelope.categoryAliases.join(", "));
        setRollover(initialEnvelope.rollover ?? true);
        setNotes(initialEnvelope.notes || "");
      } else {
        setName("");
        setAllocatedAmount(300000);
        setIcon("utensils");
        setColor("emerald");
        setAliasesText("");
        setRollover(true);
        setNotes("");
      }
    }
  }, [isOpen, initialEnvelope]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const aliases = aliasesText
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    onSave({
      name: name.trim(),
      allocatedAmount: Number(allocatedAmount) || 0,
      icon,
      color,
      categoryAliases: aliases.length > 0 ? aliases : [name.trim()],
      rollover,
      notes: notes.trim(),
    });

    onClose();
  };

  const applyPreset = (preset: (typeof STUDENT_PRESETS)[number]) => {
    setName(preset.name);
    setAllocatedAmount(preset.amount);
    setIcon(preset.icon);
    setColor(preset.color);
    setAliasesText(preset.aliases);
    setNotes(preset.notes);
  };

  return (
    <PaperDialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialEnvelope ? "Ubah amplop" : "Tambah amplop"}
      subtitle="Jatah bulanan untuk satu pos pengeluaran"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!initialEnvelope && (
          <fieldset className="space-y-1.5">
            <legend className={LABEL_CLASS}>Amplop yang sering dipakai mahasiswa</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STUDENT_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="min-h-11 px-3 py-2 border border-ink/25 text-left hover:bg-ink/5 transition-colors"
                >
                  <span className="block text-body font-semibold text-ink">{preset.name}</span>
                  <span className="block text-meta text-ink-soft money">Rp {preset.amount.toLocaleString("id-ID")} sebulan</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <label htmlFor="envelope-name" className={LABEL_CLASS}>
            Nama amplop
          </label>
          <input
            id="envelope-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Makan siang kampus"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="envelope-amount" className={LABEL_CLASS}>
            Jatah sebulan (Rp)
          </label>
          <input
            id="envelope-amount"
            type="number"
            inputMode="numeric"
            min="10000"
            step="10000"
            required
            value={allocatedAmount || ""}
            onChange={(e) => setAllocatedAmount(Number(e.target.value))}
            className={`${FIELD_CLASS} money`}
            placeholder="500000"
          />
        </div>

        <fieldset>
          <legend className={LABEL_CLASS}>Ikon</legend>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ICONS.map((item) => {
              const Icon = item.icon;
              return (
                <OptionButton
                  key={item.id}
                  pressed={icon === item.id}
                  onClick={() => setIcon(item.id)}
                  aria-label={item.label}
                  className="w-11 flex items-center justify-center px-0"
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </OptionButton>
              );
            })}
          </div>
        </fieldset>

        <div>
          <p className={LABEL_CLASS}>Warna amplop</p>
          <DenomPicker value={color} onChange={setColor} />
          <p className="mt-1 text-meta text-ink-soft">Warna cuma penanda biar amplop gampang dibedakan, bukan status jatah.</p>
        </div>

        <div>
          <label htmlFor="envelope-aliases" className={LABEL_CLASS}>
            Kategori yang masuk amplop ini (pisahkan dengan koma)
          </label>
          <input
            id="envelope-aliases"
            type="text"
            value={aliasesText}
            onChange={(e) => setAliasesText(e.target.value)}
            placeholder="Food, Food & Drinks, Groceries"
            aria-describedby="envelope-aliases-hint"
            className={FIELD_CLASS}
          />
          <p id="envelope-aliases-hint" className="text-meta text-ink-soft mt-1">
            Catatan suara atau struk dengan kategori ini otomatis memotong amplop ini.
          </p>
        </div>

        <div>
          <label htmlFor="envelope-notes" className={LABEL_CLASS}>
            Catatan (boleh kosong)
          </label>
          <input
            id="envelope-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Maksimal 15rb sekali makan di warteg"
            className={FIELD_CLASS}
          />
        </div>

        <label className="flex items-start gap-3 min-h-11 py-1 cursor-pointer">
          <input
            type="checkbox"
            checked={rollover}
            onChange={(e) => setRollover(e.target.checked)}
            className="mt-0.5 w-5 h-5 shrink-0 accent-ink"
          />
          <span>
            <span className="block text-body font-semibold text-ink">Sisa jatah dibawa ke bulan depan</span>
            <span className="block text-meta text-ink-soft">Yang tidak terpakai bulan ini ditambahkan ke jatah bulan depan.</span>
          </span>
        </label>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/15">
          <button type="button" onClick={onClose} className={SECONDARY_CLASS}>
            Batal
          </button>
          <button type="submit" className={PRIMARY_CLASS}>
            Simpan amplop
          </button>
        </div>
      </form>
    </PaperDialog>
  );
}
