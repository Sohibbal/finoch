"use client";

import React, { useState, useEffect } from "react";
import { X, Wallet, Landmark, Smartphone, Check } from "lucide-react";
import { DenomPicker } from "@/components/press/uang-denom";
import { StudentWallet, WalletType, WalletWithBalance } from "@/types/wallet-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudentWallet, "id" | "updatedAt">) => void;
  initialWallet?: WalletWithBalance | null;
}

const PRESETS = [
  { name: "Dompet Tunai Fisik", type: "cash" as WalletType, color: "emerald", icon: "wallet", notes: "Uang kertas & koin di saku/dompet" },
  { name: "BCA Tabungan", type: "bank" as WalletType, color: "blue", icon: "landmark", notes: "Rekening transfer uang saku" },
  { name: "Bank BRI / Mandiri", type: "bank" as WalletType, color: "blue", icon: "landmark", notes: "Rekening beasiswa / tabungan" },
  { name: "Bank Jago / SeaBank", type: "bank" as WalletType, color: "amber", icon: "landmark", notes: "Bank digital bunga cair harian" },
  { name: "GoPay", type: "ewallet" as WalletType, color: "emerald", icon: "smartphone", notes: "Ojek online & pesan makanan" },
  { name: "ShopeePay", type: "ewallet" as WalletType, color: "amber", icon: "smartphone", notes: "Belanja online & diskon merchant" },
  { name: "DANA / OVO", type: "ewallet" as WalletType, color: "purple", icon: "smartphone", notes: "Bayar QRIS & transfer bebas biaya" },
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
  const [isDefault, setIsDefault] = useState(false);
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
      setIsDefault(!!initialWallet.isDefault);
    } else {
      setName("");
      setType("bank");
      setBalance("");
      setColor("blue");
      setAccountNumber("");
      setNotes("");
      setIsPrimary(false);
      setIsDefault(false);
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

    // The user edits the current balance; only the saldo awal is stored, so keep the
    // wallet's transfers and spending and shift the opening balance instead.
    const movement = initialWallet ? initialWallet.balance - initialWallet.openingBalance : 0;

    onSave({
      name: name.trim(),
      type,
      openingBalance: numericBalance - movement,
      color,
      icon,
      accountNumber: accountNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      isPrimary,
      isDefault,
    });

    onClose();
  };

  const parsedBalance = parseFloat(balance.replace(/[^0-9]/g, "")) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in">
      <div className="relative w-full max-w-lg bg-paper-sheet rounded-sm border border-ink/20 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink/20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {initialWallet ? "Ubah Akun / Dompet" : "Tambah Dompet Baru"}
            </h2>
            <p className="text-xs text-ink-soft">
              Kelola saldo tunai, rekening bank, atau dompet digital
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-paper-deep text-ink-soft flex items-center justify-center hover:bg-ink/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 text-xs rounded-sm bg-habis/10 text-habis-ink font-semibold border border-habis-ink/40">
              {error}
            </div>
          )}

          {/* Quick Presets for New Wallets */}
          {!initialWallet && (
            <div>
              <label className="text-meta font-bold text-ink block mb-2">
                Pilih Cepat Rekening Mahasiswa:
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-sm border border-ink/20 bg-paper-sheet hover:border-aman-ink/40 font-medium text-ink transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallet Type */}
          <div>
            <label className="text-xs font-bold text-ink block mb-2">
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
                    className={`min-h-[48px] p-3 rounded-sm border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? "border-aman-ink/40 bg-aman/10 text-aman-ink font-bold"
                        : "border-ink/20 text-ink-soft hover:bg-ink/5"
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
            <label className="text-xs font-bold text-ink block mb-1">
              Nama Dompet / Akun <span className="text-habis-ink">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Tabungan Kost, GoPay Kuliah, Dompet Saku"
              className="w-full min-h-[48px] px-4 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
              required
            />
          </div>

          {/* Current Balance */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-ink">
                Saldo Saat Ini (Rp) <span className="text-habis-ink">*</span>
              </label>
              {parsedBalance > 0 && (
                <span className="text-xs font-bold text-aman-ink">
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
              className="w-full min-h-[48px] px-4 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
              required
            />
          </div>

          {/* Account Number (Optional for bank & ewallet) */}
          {type !== "cash" && (
            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Nomor Rekening / No. HP E-Wallet (Opsional)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Contoh: 1234567890 / 08123456789"
                className="w-full min-h-[48px] px-4 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
              />
            </div>
          )}

          {/* Color Selection */}
          <div>
            <label className="text-xs font-bold text-ink block mb-2">
              Warna lembar
            </label>
            <DenomPicker value={color} onChange={setColor} />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-ink block mb-1">
              Catatan / Peruntukan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Khusus jajan mingguan atau beasiswa"
              className="w-full min-h-[44px] px-4 rounded-sm border border-ink/20 bg-paper-sheet text-ink text-xs focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-ink-soft"
            />
          </div>

          {/* Primary Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded text-aman-ink focus:ring-ink placeholder:text-ink-soft border-ink/20"
            />
            <span className="text-xs font-medium text-ink">
              Jadikan akun utama (default penerimaan uang bulanan)
            </span>
          </label>

          {/* Default Wallet Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-aman-ink focus:ring-ink placeholder:text-ink-soft border-ink/20"
            />
            <span className="text-xs font-medium text-ink">
              Jadikan dompet default untuk mencatat pengeluaran
            </span>
          </label>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/20">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-2.5 rounded-sm border border-ink/20 text-xs font-bold text-ink hover:bg-ink/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-2.5 rounded-sm bg-ink hover:bg-ink/90 text-paper-sheet text-xs font-bold active:scale-95 transition-all"
            >
              {initialWallet ? "Simpan Perubahan" : "Tambah Dompet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
