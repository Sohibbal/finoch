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

const AVAILABLE_COLORS = [
  { id: "emerald", label: "Hijau", class: "bg-emerald-500" },
  { id: "blue", label: "Biru", class: "bg-blue-500" },
  { id: "amber", label: "Kuning", class: "bg-amber-500" },
  { id: "purple", label: "Ungu", class: "bg-purple-500" },
  { id: "rose", label: "Merah", class: "bg-rose-500" },
  { id: "cyan", label: "Toska", class: "bg-cyan-500" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
          <div>
            <h3 className="font-bold text-base text-navy-950 dark:text-cream-50">
              {initialEnvelope ? "Ubah Pos Anggaran" : "Tambah Pos Amplop Baru"}
            </h3>
            <p className="text-xs text-navy-500 dark:text-cream-400">
              Kustomisasi amplop digital agar pas dengan ritme kuliahmu
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-navy-500 hover:bg-cream-100 dark:hover:bg-navy-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Fast Presets (Only on Add mode) */}
        {!initialEnvelope && (
          <div>
            <span className="text-[11px] font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider block mb-2">
              Preset Cepat Mahasiswa:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {STUDENT_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="p-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900/60 hover:bg-cream-100 dark:hover:bg-navy-800 text-left transition-all"
                >
                  <span className="font-bold text-xs text-navy-900 dark:text-cream-100 block">
                    {preset.name}
                  </span>
                  <span className="text-[11px] text-navy-500 dark:text-cream-400">
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
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Nama Pos Anggaran:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Makan Siang Kampus"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Jatah Nominal */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Jatah Alokasi Bulanan (Rp):
            </label>
            <input
              type="number"
              min="10000"
              step="10000"
              required
              value={allocatedAmount || ""}
              onChange={(e) => setAllocatedAmount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="500000"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1.5">
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
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                      isSelected
                        ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                        : "bg-cream-100 dark:bg-navy-900 border-cream-300 dark:border-navy-800 text-navy-600 dark:text-cream-300 hover:bg-cream-200"
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
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1.5">
              Warna Tema:
            </label>
            <div className="flex gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.class} flex items-center justify-center transition-all ${
                    color === c.id ? "ring-2 ring-offset-2 ring-navy-900 dark:ring-cream-100 scale-110" : "opacity-80"
                  }`}
                  title={c.label}
                >
                  {color === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Category Aliases */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Kategori Pengeluaran Terhubung (Pisahkan dengan koma):
            </label>
            <input
              type="text"
              value={aliasesText}
              onChange={(e) => setAliasesText(e.target.value)}
              placeholder="Contoh: Food, Food & Drinks, Groceries"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-navy-500 dark:text-cream-400 mt-1">
              Transaksi suara/struk yang mencocokkan kata-kata ini akan otomatis memotong amplop ini.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Catatan / Pengingat (Opsional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Jatah maksimal 15rb per porsi makan warteg"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Rollover Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-cream-100/70 dark:bg-navy-900 border border-cream-200 dark:border-navy-800">
            <div>
              <span className="text-xs font-bold text-navy-950 dark:text-cream-50 block">
                Akumulasi Sisa Saldo (Rollover)
              </span>
              <span className="text-[11px] text-navy-500 dark:text-cream-400">
                Sisa saldo yang tidak terpakai ditambahkan ke bulan depan
              </span>
            </div>
            <input
              type="checkbox"
              checked={rollover}
              onChange={(e) => setRollover(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 font-bold text-xs hover:bg-cream-100 dark:hover:bg-navy-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 dark:hover:bg-white font-bold text-xs shadow-md active:scale-98 transition-all"
            >
              Simpan Amplop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
