"use client";

import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { FIELD_CLASS, LABEL_CLASS, OptionButton, PaperDialog, PRIMARY_CLASS, SECONDARY_CLASS } from "@/components/press/kampus-press";
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
    <PaperDialog isOpen={isOpen} onClose={onClose} title="Catat kasbon" subtitle="Pinjam-meminjam uang dengan teman">
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="space-y-1.5">
          <legend className={LABEL_CLASS}>Kasbon yang sering terjadi</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STUDENT_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.desc}
                onClick={() => applyPreset(preset)}
                className="min-h-11 px-3 py-2 border border-ink/25 text-left hover:bg-ink/5 transition-colors"
              >
                <span className="block text-body font-semibold text-ink">{preset.desc}</span>
                <span className="block text-meta text-ink-soft money">
                  {preset.type === "receivable" ? "Piutang" : "Hutang"} Rp {preset.amount.toLocaleString("id-ID")}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={LABEL_CLASS}>Jenis catatan</legend>
          <div className="grid grid-cols-2 gap-2">
            <OptionButton pressed={type === "receivable"} onClick={() => setType("receivable")} className="flex items-center justify-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              Piutang (teman pinjam)
            </OptionButton>
            <OptionButton pressed={type === "payable"} onClick={() => setType("payable")} className="flex items-center justify-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
              Hutang (kamu pinjam)
            </OptionButton>
          </div>
        </fieldset>

        <div>
          <label htmlFor="debt-person" className={LABEL_CLASS}>
            Nama teman
          </label>
          <input
            id="debt-person"
            type="text"
            required
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Dimas teman kos"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="debt-amount" className={LABEL_CLASS}>
            Nominal (Rp)
          </label>
          <input
            id="debt-amount"
            type="number"
            inputMode="numeric"
            min="1000"
            step="5000"
            required
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="50000"
            className={`${FIELD_CLASS} money`}
          />
        </div>

        <div>
          <label htmlFor="debt-description" className={LABEL_CLASS}>
            Buat apa
          </label>
          <input
            id="debt-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Talangan fotokopi modul ujian"
            className={FIELD_CLASS}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="debt-due" className={LABEL_CLASS}>
              Jatuh tempo (boleh kosong)
            </label>
            <input id="debt-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={FIELD_CLASS} />
          </div>

          <div>
            <label htmlFor="debt-phone" className={LABEL_CLASS}>
              No. WhatsApp (boleh kosong)
            </label>
            <input
              id="debt-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              aria-describedby="debt-phone-hint"
              className={`${FIELD_CLASS} money`}
            />
            <p id="debt-phone-hint" className="mt-1 text-meta text-ink-soft">Buat tombol chat langsung.</p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/15">
          <button type="button" onClick={onClose} className={SECONDARY_CLASS}>
            Batal
          </button>
          <button type="submit" className={PRIMARY_CLASS}>
            Simpan kasbon
          </button>
        </div>
      </form>
    </PaperDialog>
  );
}
