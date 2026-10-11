"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SplitItem, Participant } from "@/types/split-bill-types";
import { rupiah } from "@/lib/format";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/press/kampus-press";

interface BillItemEditorProps {
  items: SplitItem[];
  participants: Participant[];
  mode: "itemized" | "equal";
  onAddItem: (item: Omit<SplitItem, "id">) => void;
  onUpdateItem: (id: string, updates: Partial<SplitItem>) => void;
  onDeleteItem: (id: string) => void;
  /** Another way to fill the nota, e.g. the receipt scan button. */
  extraAction?: React.ReactNode;
}

// Student presets: one tap fills the name and price.
const PRESETS = [
  { name: "Ayam Geprek", price: 18000, label: "Geprek 18rb" },
  { name: "Es Teh Manis", price: 5000, label: "Es teh 5rb" },
  { name: "Nasi Goreng", price: 22000, label: "Nasgor 22rb" },
  { name: "Kopi Susu", price: 15000, label: "Kopi susu 15rb" },
];

// Heavy outline, not filled: the one filled button on this page is Simpan.
const ADD_CLASS =
  "inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full border-2 border-ink text-ink font-semibold text-body hover:bg-ink/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const PERSON_TOGGLE = "min-h-11 px-3 border text-body transition-colors";

/** The nota's menu lines plus the "add a line" row at the bottom. */
export function BillItemEditor({
  items,
  participants,
  mode,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  extraAction,
}: BillItemEditorProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(participants.map((p) => p.id));

  // A friend added after the form opened eats this menu too unless untoggled.
  const participantKey = participants.map((p) => p.id).join(",");
  useEffect(() => {
    setSelectedParticipants(participantKey ? participantKey.split(",") : []);
  }, [participantKey]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(price.replace(/[^0-9]/g, ""));
    const numQty = Math.max(1, Number(quantity) || 1);
    if (!name.trim() || numPrice <= 0) return;

    onAddItem({
      name: name.trim(),
      price: numPrice,
      quantity: numQty,
      assignedParticipantIds: selectedParticipants.length > 0 ? selectedParticipants : participants.map((p) => p.id),
    });

    setName("");
    setPrice("");
    setQuantity("1");
    setSelectedParticipants(participants.map((p) => p.id));
  };

  const toggleParticipantForNewItem = (pid: string) => {
    if (selectedParticipants.includes(pid)) {
      if (selectedParticipants.length > 1) {
        setSelectedParticipants(selectedParticipants.filter((id) => id !== pid));
      }
    } else {
      setSelectedParticipants([...selectedParticipants, pid]);
    }
  };

  const toggleItemParticipant = (item: SplitItem, pid: string) => {
    const current = item.assignedParticipantIds || [];
    let updated: string[];
    if (current.includes(pid)) {
      updated = current.length > 1 ? current.filter((id) => id !== pid) : current; // Keep at least one person
    } else {
      updated = [...current, pid];
    }
    onUpdateItem(item.id, { assignedParticipantIds: updated });
  };

  const showPeople = mode === "itemized" && participants.length > 1;

  return (
    <div className="space-y-5">
      {items.length === 0 ? (
        <p className="text-body text-ink-soft">
          Nota masih kosong. Tulis menu pertama di bawah, pakai menu cepat, atau scan struk kasir.
        </p>
      ) : (
        <ol className="divide-y divide-dashed divide-ink/20 border-y border-dashed border-ink/20">
          {items.map((item) => (
            <li key={item.id} className="py-3 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="money text-body text-ink-soft shrink-0">{item.quantity}×</span>
                <span className="text-body font-semibold text-ink break-words min-w-0">{item.name}</span>
                <span aria-hidden="true" className="flex-1 min-w-4 border-b border-dotted border-ink/40 translate-y-[-4px]" />
                <span className="money text-body font-bold text-ink whitespace-nowrap">{rupiah(item.price * item.quantity)}</span>
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  aria-label={`Hapus ${item.name} dari nota`}
                  className="-my-2 -mr-2 w-11 h-11 shrink-0 self-center flex items-center justify-center rounded-full text-ink-soft hover:text-habis-ink hover:bg-ink/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {showPeople && (
                <div className="flex flex-wrap items-center gap-1.5 pl-6" role="group" aria-label={`Yang makan ${item.name}`}>
                  {participants.map((p) => {
                    const isAssigned = (item.assignedParticipantIds || []).includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={isAssigned}
                        onClick={() => toggleItemParticipant(item, p.id)}
                        className={`${PERSON_TOGGLE} ${
                          isAssigned
                            ? "bg-ink text-paper-sheet border-ink font-semibold"
                            : "bg-transparent text-ink-soft border-ink/25 line-through decoration-ink/50"
                        }`}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {/* The blank line at the bottom of the nota. */}
      <form onSubmit={handleAddItem} className="space-y-3 border border-dashed border-ink/40 p-3 sm:p-4" aria-label="Tambah menu ke nota">
        <div className="grid grid-cols-6 gap-2">
          <div className="col-span-6 sm:col-span-3">
            <label htmlFor="bill-item-name" className={LABEL_CLASS}>
              Menu
            </label>
            <input
              id="bill-item-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Soto betawi"
              className={FIELD_CLASS}
            />
          </div>
          <div className="col-span-4 sm:col-span-2">
            <label htmlFor="bill-item-price" className={LABEL_CLASS}>
              Harga satuan (Rp)
            </label>
            <input
              id="bill-item-price"
              type="number"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="20000"
              className={`${FIELD_CLASS} money`}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="bill-item-qty" className={LABEL_CLASS}>
              Jumlah
            </label>
            <input
              id="bill-item-qty"
              type="number"
              inputMode="numeric"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`${FIELD_CLASS} money text-center`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Menu cepat">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setName(p.name);
                setPrice(String(p.price));
              }}
              className="min-h-11 px-3 rounded-full border border-ink/25 text-body text-ink hover:bg-ink/5 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        {showPeople && (
          <fieldset className="space-y-1.5">
            <legend className={LABEL_CLASS}>Siapa yang makan menu ini?</legend>
            <div className="flex flex-wrap gap-1.5">
              {participants.map((p) => {
                const isChecked = selectedParticipants.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={isChecked}
                    onClick={() => toggleParticipantForNewItem(p.id)}
                    className={`${PERSON_TOGGLE} ${
                      isChecked ? "bg-ink text-paper-sheet border-ink font-semibold" : "bg-paper-sheet text-ink border-ink/30"
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={!name.trim() || !price} className={ADD_CLASS}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Tambah ke nota
          </button>
          {extraAction}
        </div>
      </form>
    </div>
  );
}
