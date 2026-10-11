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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
      <div className="w-full max-w-md bg-paper-sheet border border-ink/20 rounded-sm p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink/20">
          <div>
            <h3 className="font-bold text-base text-ink">
              Catat Kasbon / Hutang Piutang
            </h3>
            <p className="text-xs text-ink-soft">
              Buku catatan pinjam-meminjam uang antar teman mahasiswa
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-soft hover:bg-ink/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-meta font-bold text-ink-soft block mb-1.5">
            Preset Cepat Mahasiswa:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {STUDENT_PRESETS.map((preset, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => applyPreset(preset)}
                className="p-2 rounded-sm border border-ink/20 bg-paper-sheet hover:bg-ink/5 text-left text-xs transition-all"
              >
                <span className="font-bold text-ink block truncate">
                  {preset.desc}
                </span>
                <span className="text-meta text-ink-soft">
                  Rp {preset.amount.toLocaleString("id-ID")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Tipe Selector */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Jenis Catatan:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("receivable")}
                className={`py-2 px-3 rounded-sm text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  type === "receivable"
                    ? "bg-ink text-paper-sheet border-transparent"
                    : "bg-paper-sheet border-ink/20 text-ink"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Piutang (Teman Pinjam)</span>
              </button>
              <button
                type="button"
                onClick={() => setType("payable")}
                className={`py-2 px-3 rounded-sm text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  type === "payable"
                    ? "bg-mepet-ink text-paper-sheet border-transparent"
                    : "bg-paper-sheet border-ink/20 text-ink"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Hutang (Saya Pinjam)</span>
              </button>
            </div>
          </div>

          {/* Nama Pihak */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Nama Teman / Pihak:
            </label>
            <input
              type="text"
              required
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Contoh: Dimas Teman Kost"
              className="w-full px-3.5 py-2 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Nominal */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
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
              className="w-full px-3.5 py-2 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Keperluan / Keterangan:
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Talangan fotokopi modul ujian"
              className="w-full px-3.5 py-2 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Tanggal Jatuh Tempo */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              Jatuh Tempo (Opsional):
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Nomor WhatsApp */}
          <div>
            <label className="text-xs font-semibold text-ink block mb-1">
              No. WhatsApp (Opsional, untuk tombol chat langsung):
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08123456789"
              className="w-full px-3.5 py-2 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
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
              className="w-1/2 py-2.5 rounded-sm bg-ink text-paper-sheet font-bold text-xs active:scale-95 transition-all"
            >
              Simpan Kasbon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
