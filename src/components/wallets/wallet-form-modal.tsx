"use client";

import React, { useState, useEffect } from "react";
import { Wallet, Landmark, Smartphone } from "lucide-react";
import { DenomPicker } from "@/components/press/denom";
import { FIELD_CLASS, LABEL_CLASS, OptionButton, PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";
import { StudentWallet, WalletType, WalletWithBalance } from "@/types/wallet-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudentWallet, "id" | "updatedAt">) => void;
  initialWallet?: WalletWithBalance | null;
}

const PRESETS = [
  { name: "Dompet Tunai Fisik", type: "cash" as WalletType, color: "teal", icon: "wallet", notes: "Uang kertas & koin di saku/dompet" },
  { name: "BCA Tabungan", type: "bank" as WalletType, color: "blue", icon: "landmark", notes: "Rekening transfer uang saku" },
  { name: "Bank BRI / Mandiri", type: "bank" as WalletType, color: "blue", icon: "landmark", notes: "Rekening beasiswa / tabungan" },
  { name: "Bank Jago / SeaBank", type: "bank" as WalletType, color: "slate", icon: "landmark", notes: "Bank digital bunga cair harian" },
  { name: "GoPay", type: "ewallet" as WalletType, color: "teal", icon: "smartphone", notes: "Ojek online & pesan makanan" },
  { name: "ShopeePay", type: "ewallet" as WalletType, color: "slate", icon: "smartphone", notes: "Belanja online & diskon merchant" },
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
    <PaperDialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialWallet ? "Ubah dompet" : "Tambah dompet"}
      subtitle="Uang tunai, rekening bank, atau e-wallet"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="p-3 border border-habis-ink/40 text-body font-semibold text-habis-ink">
            {error}
          </p>
        )}

        {!initialWallet && (
          <fieldset className="space-y-1.5">
            <legend className={LABEL_CLASS}>Pilih cepat</legend>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className="min-h-11 px-3 rounded-full border border-ink/25 text-body text-ink hover:bg-ink/5 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset>
          <legend className={LABEL_CLASS}>Jenis dompet</legend>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "cash" as WalletType, label: "Tunai", icon: Wallet },
              { id: "bank" as WalletType, label: "Bank", icon: Landmark },
              { id: "ewallet" as WalletType, label: "E-wallet", icon: Smartphone },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <OptionButton
                  key={item.id}
                  pressed={type === item.id}
                  onClick={() => setType(item.id)}
                  className="flex flex-col items-center justify-center gap-1 py-2"
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {item.label}
                </OptionButton>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="wallet-name" className={LABEL_CLASS}>
            Nama dompet
          </label>
          <input
            id="wallet-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="BCA tabungan kos, GoPay kuliah, dompet saku"
            className={FIELD_CLASS}
            required
          />
        </div>

        <div>
          <label htmlFor="wallet-balance" className={LABEL_CLASS}>
            Saldo sekarang (Rp)
          </label>
          <input
            id="wallet-balance"
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0"
            aria-describedby={parsedBalance > 0 ? "wallet-balance-read" : undefined}
            className={`${FIELD_CLASS} money`}
            required
          />
          {parsedBalance > 0 && (
            <p id="wallet-balance-read" className="mt-1 text-meta text-ink-soft money">
              Terbaca {formatRupiah(parsedBalance)}
            </p>
          )}
        </div>

        {type !== "cash" && (
          <div>
            <label htmlFor="wallet-account" className={LABEL_CLASS}>
              Nomor rekening / nomor HP (boleh kosong)
            </label>
            <input
              id="wallet-account"
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="1234567890 / 08123456789"
              className={`${FIELD_CLASS} money`}
            />
          </div>
        )}

        <div>
          <p className={LABEL_CLASS}>
            Warna lembar
          </p>
          <DenomPicker value={color} onChange={setColor} />
          <p className="mt-1 text-meta text-ink-soft">Warna cuma penanda biar dompetmu gampang dibedakan, bukan status saldo.</p>
        </div>

        <div>
          <label htmlFor="wallet-notes" className={LABEL_CLASS}>
            Catatan (boleh kosong)
          </label>
          <input
            id="wallet-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Khusus jajan mingguan, atau beasiswa"
            className={FIELD_CLASS}
          />
        </div>

        <label className="flex items-center gap-3 min-h-11 cursor-pointer">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="w-5 h-5 shrink-0 accent-ink"
          />
          <span className="text-body text-ink">Jadikan dompet utama (tempat uang bulanan masuk)</span>
        </label>

        <label className="flex items-center gap-3 min-h-11 cursor-pointer">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="w-5 h-5 shrink-0 accent-ink"
          />
          <span className="text-body text-ink">Pakai dompet ini saat mencatat pengeluaran</span>
        </label>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/15">
          <button type="button" onClick={onClose} className={SECONDARY_CLASS}>
            Batal
          </button>
          <button type="submit" className={PRIMARY_CLASS}>
            {initialWallet ? "Simpan" : "Tambah dompet"}
          </button>
        </div>
      </form>
    </PaperDialog>
  );
}
