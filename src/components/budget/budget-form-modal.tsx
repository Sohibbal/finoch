"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Utensils,
  Home,
  Car,
  Coffee,
  Shield,
  BookOpen,
  ShoppingBag,
  Sparkles,
  Check,
} from "lucide-react";
import { DenomPicker } from "@/components/press/uang-denom";
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
      <div className="w-full max-w-lg bg-paper-sheet border border-ink/20 rounded-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink/20">
          <div>
            <h3 className="font-bold text-base text-ink">
              {initialEnvelope ? "Ubah Pos Anggaran" : "Tambah Pos Amplop Baru"}
            </h3>
            <p className="text-xs text-ink-soft">
              Kustomisasi amplop digital agar pas dengan ritme kuliahmu
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-ink/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Fast Presets (Only on Add mode) */}
        {!initialEnvelope && (
          <div>
            <span className="text-meta font-bold text-ink-soft block mb-2">
              Preset Cepat Mahasiswa:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {STUDENT_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="p-2 rounded-sm border border-ink/20 bg-paper-sheet hover:bg-ink/5 text-left transition-all"
                >
                  <span className="font-bold text-xs text-ink block">
                    {preset.name}
                  </span>
                  <span className="text-meta text-ink-soft">
                    Rp {preset.amount.toLocaleString("id-ID")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Pos */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Nama Pos Anggaran:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Makan Siang Kampus"
              className="w-full px-3.5 py-2.5 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {/* Jatah Nominal */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Jatah Alokasi Bulanan (Rp):
            </label>
            <input
              type="number"
              min="10000"
              step="10000"
              required
              value={allocatedAmount || ""}
              onChange={(e) => setAllocatedAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ink"
              placeholder="500000"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">
              Pilih Ikon Amplop:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const Icon = item.icon;
                const isSelected = icon === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setIcon(item.id)}
                    className={`w-9 h-9 rounded-sm flex items-center justify-center border transition-all ${
                      isSelected
                        ? "bg-ink text-paper-sheet border-transparent"
                        : "bg-paper-deep border-ink/20 text-ink-soft hover:bg-ink/5"
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1.5">
              Warna amplop
            </label>
            <DenomPicker value={color} onChange={setColor} />
          </div>

          {/* Category Aliases */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Kategori Pengeluaran Terhubung (Pisahkan dengan koma):
            </label>
            <input
              type="text"
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              placeholder="Contoh: Food, Food & Drinks, Groceries"
              className="w-full px-3.5 py-2 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ink"
            />
            <p className="text-meta text-ink-soft mt-1">
              Transaksi suara/struk yang mencocokkan kata-kata ini akan otomatis memotong amplop ini.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Catatan / Pengingat (Opsional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Jatah maksimal 15rb per porsi makan warteg"
              className="w-full px-3.5 py-2 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          {/* Rollover Toggle */}
          <div className="flex items-center justify-between p-3 rounded-sm bg-paper-deep border border-ink/20">
            <div>
              <span className="text-xs font-bold text-ink block">
                Akumulasi Sisa Saldo (Rollover)
              </span>
              <span className="text-meta text-ink-soft">
                Sisa saldo yang tidak terpakai ditambahkan ke bulan depan
              </span>
            </div>
            <input
              type="checkbox"
              checked={rollover}
              onChange={(e) => setRollover(e.target.checked)}
              className="w-4 h-4 accent-ink rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-sm border border-ink/20 text-ink font-bold text-xs hover:bg-ink/5"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-sm bg-ink hover:bg-ink/90 text-paper-sheet font-bold text-xs active:scale-98 transition-all"
            >
              Simpan Amplop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
