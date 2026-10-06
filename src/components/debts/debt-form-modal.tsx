"use client";

import React, { useState } from "react";
import { X, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { DebtType } from "@/types/debt-types";

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    type: DebtType;
    personName: string;
    amount: number;
    description: string;
    dueDate?: string;
    phone?: string;
  }) => void;
}

const STUDENT_PRESETS = [
  {
    type: "receivable" as DebtType,
    name: "Teman Kampus",
    amount: 25000,
    desc: "Talangan fotokopi modul & jilid laporan",
  },
  {
    type: "payable" as DebtType,
    name: "Ibu Warteg Langganan",
    amount: 20000,
    desc: "Kasbon makan malam nasi telur komplit",
  },
  {
    type: "receivable" as DebtType,
    name: "Bendahara Kelas",
    amount: 15000,
    desc: "Talangan iuran kas kelas",
  },
  {
    type: "payable" as DebtType,
    name: "Teman Kost",
    amount: 30000,
    desc: "Pinjam uang bensin motor",
  },
];

export function DebtFormModal({ isOpen, onClose, onSave }: DebtFormModalProps) {
  const [type, setType] = useState<DebtType>("receivable");
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState<number>(30000);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || amount <= 0) return;

    onSave({
      type,
      personName: personName.trim(),
      amount: Number(amount),
      description: description.trim() || "Kasbon / talangan mahasiswa",
      dueDate: dueDate || undefined,
      phone: phone.trim() || undefined,
    });

    onClose();
  };

  const applyPreset = (preset: (typeof STUDENT_PRESETS)[number]) => {
    setType(preset.type);
    setPersonName(preset.name);
    setAmount(preset.amount);
    setDescription(preset.desc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
          <div>
            <h3 className="font-bold text-base text-navy-950 dark:text-cream-50">
              Catat Kasbon / Hutang Piutang
            </h3>
            <p className="text-xs text-navy-500 dark:text-cream-400">
              Buku catatan pinjam-meminjam uang antar teman mahasiswa
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-navy-500 hover:bg-cream-100 dark:hover:bg-navy-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider block mb-1.5">
            Preset Cepat Mahasiswa:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {STUDENT_PRESETS.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => applyPreset(preset)}
                className="p-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900/60 hover:bg-cream-100 text-left text-xs transition-all"
              >
                <span className="font-bold text-navy-900 dark:text-cream-100 block truncate">
                  {preset.desc}
                </span>
                <span className="text-[10px] text-navy-500">
                  Rp {preset.amount.toLocaleString("id-ID")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Tipe Selector */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Jenis Catatan:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("receivable")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  type === "receivable"
                    ? "bg-emerald-600 text-white border-transparent shadow-sm"
                    : "bg-cream-50 dark:bg-navy-900 border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Piutang (Teman Pinjam)</span>
              </button>
              <button
                type="button"
                onClick={() => setType("payable")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  type === "payable"
                    ? "bg-amber-600 text-white border-transparent shadow-sm"
                    : "bg-cream-50 dark:bg-navy-900 border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Hutang (Saya Pinjam)</span>
              </button>
            </div>
          </div>

          {/* Nama Pihak */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Nama Teman / Pihak:
            </label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Contoh: Dimas Teman Kost"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Nominal */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Nominal (Rp):
            </label>
            <input
              type="number"
              min="1000"
              step="5000"
              required
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="50000"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Keperluan / Keterangan:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Talangan fotokopi modul ujian"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tanggal Jatuh Tempo */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Jatuh Tempo (Opsional):
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              No. WhatsApp (Opsional, untuk tombol chat langsung):
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full px-3.5 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 font-bold text-xs hover:bg-cream-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 rounded-xl bg-navy-950 dark:bg-cream-100 text-white dark:text-navy-950 font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              Simpan Kasbon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
