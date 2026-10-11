"use client";

import React, { useState } from "react";
import { UktCategory, UktPlan } from "@/types/ukt-types";
import { rupiah } from "@/lib/format";
import { FIELD_CLASS, LABEL_CLASS, OptionButton, PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";

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
    <PaperDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah tabungan kampus"
      subtitle="Biaya besar dipecah jadi setoran harian kecil, biar tanggal bayar nggak bikin panik."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="text-body font-semibold text-habis-ink border border-dashed border-habis-ink px-3 py-2">
            {error}
          </p>
        )}

        <fieldset>
          <legend className={LABEL_CLASS}>Untuk biaya apa?</legend>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <OptionButton
                key={c.id}
                pressed={category === c.id}
                onClick={() => {
                  setCategory(c.id);
                  if (!name) setName(c.label);
                }}
                className="text-left"
              >
                {c.label}
              </OptionButton>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="ukt-name" className={LABEL_CLASS}>
            Nama tabungan
          </label>
          <input
            id="ukt-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="UKT Semester 5, KKN desa binaan"
            className={FIELD_CLASS}
            required
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-2">
            <label htmlFor="ukt-target" className={LABEL_CLASS}>
              Target biaya (Rp)
            </label>
            {parsedAmount > 0 && <span className="money text-meta font-semibold text-ink">{rupiah(parsedAmount)}</span>}
          </div>
          <input
            id="ukt-target"
            type="number"
            inputMode="numeric"
            min="50000"
            step="10000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="3500000"
            className={`${FIELD_CLASS} money`}
            required
          />
        </div>

        <div>
          <label htmlFor="ukt-deadline" className={LABEL_CLASS}>
            Tanggal bayar ke kampus
          </label>
          <input
            id="ukt-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={FIELD_CLASS}
            required
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-ink/15">
          <button type="button" onClick={onClose} className={SECONDARY_CLASS}>
            Batal
          </button>
          <button type="submit" className={PRIMARY_CLASS}>
            Simpan tabungan
          </button>
        </div>
      </form>
    </PaperDialog>
  );
}
