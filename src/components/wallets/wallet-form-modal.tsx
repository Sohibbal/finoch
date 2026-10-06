"use client";

import React, { useState, useEffect } from "react";
import { X, Wallet, Landmark, Smartphone, Check } from "lucide-react";
import { StudentWallet, WalletType } from "@/types/wallet-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudentWallet, "id" | "updatedAt">) => void;
  initialWallet?: StudentWallet | null;
}

const PRESETS = [
  { name: "Dompet Tunai Fisik", type: "cash" as WalletType, color: "emerald", icon: "wallet", notes: "Uang kertas & koin di saku/dompet" },
  { name: "BCA Tabungan", type: "bank" as WalletType, color: "blue", icon: "landmark", notes: "Rekening transfer uang saku" },
  { name: "Bank BRI / Mandiri", type: "bank" as WalletType, color: "blue", icon: "landmark", notes: "Rekening beasiswa / tabungan" },
  { name: "Bank Jago / SeaBank", type: "bank" as WalletType, color: "amber", icon: "landmark", notes: "Bank digital bunga cair harian" },
  { name: "GoPay", type: "ewallet" as WalletType, color: "cyan", icon: "smartphone", notes: "Ojek online & pesan makanan" },
  { name: "ShopeePay", type: "ewallet" as WalletType, color: "amber", icon: "smartphone", notes: "Belanja online & diskon merchant" },
  { name: "DANA / OVO", type: "ewallet" as WalletType, color: "purple", icon: "smartphone", notes: "Bayar QRIS & transfer bebas biaya" },
];

const COLORS = [
  { id: "emerald", label: "Emerald", bg: "bg-emerald-500" },
  { id: "blue", label: "Blue", bg: "bg-blue-500" },
  { id: "purple", label: "Purple", bg: "bg-purple-500" },
  { id: "amber", label: "Amber", bg: "bg-amber-500" },
  { id: "cyan", label: "Cyan", bg: "bg-cyan-500" },
];

export function WalletFormModal({
  isOpen,
  onClose,
  onSave,
  initialWallet,
}: WalletFormModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("bank");
  const [balance, setBalance] = useState<string>("0");
  const [color, setColor] = useState("blue");
  const [accountNumber, setAccountNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialWallet) {
      setName(initialWallet.name);
      setType(initialWallet.type);
      setBalance(initialWallet.balance.toString());
      setColor(initialWallet.color);
      setAccountNumber(initialWallet.accountNumber || "");
      setNotes(initialWallet.notes || "");
      setIsPrimary(!!initialWallet.isPrimary);
    } else {
      setName("");
      setType("bank");
      setBalance("");
      setColor("blue");
      setAccountNumber("");
      setNotes("");
      setIsPrimary(false);
    }
    setError(null);
  }, [initialWallet, isOpen]);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
    setName(preset.name);
    setType(preset.type);
    setColor(preset.color);
    setNotes(preset.notes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama dompet atau rekening wajib diisi.");
      return;
    }

    const numericBalance = parseFloat(balance.replace(/[^0-9]/g, "")) || 0;
    if (numericBalance < 0) {
      setError("Saldo tidak boleh negatif.");
      return;
    }

    const icon = type === "cash" ? "wallet" : type === "bank" ? "landmark" : "smartphone";

    onSave({
      name: name.trim(),
      type,
      balance: numericBalance,
      color,
      icon,
      accountNumber: accountNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      isPrimary,
    });

    onClose();
  };

  const parsedBalance = parseFloat(balance.replace(/[^0-9]/g, "")) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-cream-200 dark:border-navy-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 dark:border-navy-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-950 dark:text-cream-50">
              {initialWallet ? "Ubah Akun / Dompet" : "Tambah Dompet Baru"}
            </h2>
            <p className="text-xs text-navy-500 dark:text-cream-400">
              Kelola saldo tunai, rekening bank, atau dompet digital
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-cream-100 dark:bg-navy-800 text-navy-600 dark:text-cream-300 flex items-center justify-center hover:bg-cream-200 dark:hover:bg-navy-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Quick Presets for New Wallets */}
          {!initialWallet && (
            <div>
              <label className="text-[11px] font-bold text-navy-700 dark:text-cream-300 uppercase tracking-wider block mb-2">
                Pilih Cepat Rekening Mahasiswa:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-xl border border-cream-200 dark:border-navy-700 bg-cream-50 dark:bg-navy-800/60 hover:border-emerald-500 font-medium text-navy-800 dark:text-cream-200 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallet Type */}
          <div>
            <label className="text-xs font-bold text-navy-900 dark:text-cream-100 block mb-2">
              Kategori Dompet
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "cash" as WalletType, label: "Tunai / Fisik", icon: Wallet },
                { id: "bank" as WalletType, label: "Rekening Bank", icon: Landmark },
                { id: "ewallet" as WalletType, label: "E-Wallet", icon: Smartphone },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`min-h-[48px] p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm"
                        : "border-cream-200 dark:border-navy-800 text-navy-600 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-navy-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-navy-900 dark:text-cream-100 block mb-1">
              Nama Dompet / Akun <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Tabungan Kost, GoPay Kuliah, Dompet Saku"
              className="w-full min-h-[48px] px-4 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/50 dark:bg-navy-800 text-navy-900 dark:text-cream-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Current Balance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-navy-900 dark:text-cream-100">
                Saldo Saat Ini (Rp) <span className="text-rose-500">*</span>
              </label>
              {parsedBalance > 0 && (
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(parsedBalance)}
                </span>
              )}
            </div>
            <input
              type="number"
              min="0"
              step="1000"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0"
              className="w-full min-h-[48px] px-4 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/50 dark:bg-navy-800 text-navy-900 dark:text-cream-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Account Number (Optional for bank & ewallet) */}
          {type !== "cash" && (
            <div>
              <label className="text-xs font-bold text-navy-900 dark:text-cream-100 block mb-1">
                Nomor Rekening / No. HP E-Wallet (Opsional)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Contoh: 1234567890 / 08123456789"
                className="w-full min-h-[48px] px-4 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/50 dark:bg-navy-800 text-navy-900 dark:text-cream-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Color Selection */}
          <div>
            <label className="text-xs font-bold text-navy-900 dark:text-cream-100 block mb-2">
              Tema Kartu Dompet
            </label>
            <div className="flex items-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                    color === c.id ? "scale-110 ring-4 ring-emerald-400/40" : "opacity-80 hover:opacity-100"
                  }`}
                  aria-label={c.label}
                >
                  {color === c.id && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-navy-900 dark:text-cream-100 block mb-1">
              Catatan / Peruntukan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Khusus jajan mingguan atau beasiswa"
              className="w-full min-h-[44px] px-4 rounded-xl border border-cream-300 dark:border-navy-700 bg-cream-50/50 dark:bg-navy-800 text-navy-900 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Primary Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-cream-300 dark:border-navy-700"
            />
            <span className="text-xs font-medium text-navy-800 dark:text-cream-200">
              Jadikan akun utama (default penerimaan uang bulanan)
            </span>
          </label>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-cream-200 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-2.5 rounded-xl border border-cream-300 dark:border-navy-700 text-xs font-bold text-navy-700 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-navy-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
            >
              {initialWallet ? "Simpan Perubahan" : "Tambah Dompet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
