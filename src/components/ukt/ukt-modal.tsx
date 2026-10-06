"use client";

import React, { useState } from "react";
import { X, GraduationCap, Calendar, DollarSign } from "lucide-react";
import { UktCategory, UktPlan } from "@/types/ukt-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface UktModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<UktPlan, "id" | "currentSaved" | "deposits" | "updatedAt">) => void;
}

const CATEGORIES: { id: UktCategory; label: string }[] = [
  { id: "ukt", label: "UKT / SPP Semester" },
  { id: "praktikum", label: "Biaya Praktikum" },
  { id: "kkn", label: "Biaya KKN / Magang" },
  { id: "skripsi", label: "Biaya Skripsi & Wisuda" },
];

export function UktModal({ isOpen, onClose, onSave }: UktModalProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState<UktCategory>("ukt");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama pos tabungan wajib diisi.");
      return;
    }
    const val = parseFloat(targetAmount.replace(/[^0-9]/g, "")) || 0;
    if (val <= 0) {
      setError("Target dana harus lebih dari Rp 0.");
      return;
    }
    if (!deadline) {
      setError("Pilih tenggat waktu pembayaran.");
      return;
    }

    onSave({
      name: name.trim(),
      targetAmount: val,
      deadline,
      category,
    });

    onClose();
  };

  const parsedAmount = parseFloat(targetAmount.replace(/[^0-9]/g, "")) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-cream-200 dark:border-navy-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 dark:border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-950 dark:text-cream-50">
                Tambah Target Dana UKT / Kampus
              </h2>
              <p className="text-xs text-navy-500 dark:text-cream-400">
                Sinking fund otomatis agar tidak panik saat tanggal bayar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-100 dark:bg-navy-800 text-navy-600 dark:text-cream-300 flex items-center justify-center hover:bg-cream-200 dark:hover:bg-navy-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-navy-900 dark:text-cream-100 block mb-2">
              Kategori Kebutuhan Kampus
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    if (!name) setName(c.label);
                  }}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    category === c.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                      : "border-cream-200 dark:border-navy-800 text-navy-700 dark:text-cream-300 hover:bg-cream-100"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-navy-900 dark:text-cream-100 block mb-1">
              Nama Rencana Tabungan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: UKT Semester 5, Biaya KKN Desa Binaan"
              className="w-full min-h-[48px] px-4 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/50 dark:bg-navy-800 text-navy-900 dark:text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Target Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-navy-900 dark:text-cream-100">
                Target Biaya (Rp) <span className="text-rose-500">*</span>
              </label>
              {parsedAmount > 0 && (
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(parsedAmount)}
                </span>
              )}
            </div>
            <input
              type="number"
              min="50000"
              step="10000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="Contoh: 3500000"
              className="w-full min-h-[48px] px-4 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/50 dark:bg-navy-800 text-navy-900 dark:text-cream-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="text-xs font-bold text-navy-900 dark:text-cream-100 block mb-1">
              Batas Akhir / Tanggal Bayar Kampus <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/50 dark:bg-navy-800 text-navy-900 dark:text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-cream-200 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-700 text-xs font-bold text-navy-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-navy-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
            >
              Simpan Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
