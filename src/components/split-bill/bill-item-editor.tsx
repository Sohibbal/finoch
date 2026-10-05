"use client";

import React, { useState } from "react";
import { Utensils, Plus, Trash2, Check } from "lucide-react";
import { SplitItem, Participant } from "@/types/split-bill-types";
import { formatRupiah } from "@/lib/financial/split-bill-engine";

interface BillItemEditorProps {
  items: SplitItem[];
  participants: Participant[];
  mode: "itemized" | "equal";
  onAddItem: (item: Omit<SplitItem, "id">) => void;
  onUpdateItem: (id: string, updates: Partial<SplitItem>) => void;
  onDeleteItem: (id: string) => void;
}

export function BillItemEditor({
  items,
  participants,
  mode,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: BillItemEditorProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    participants.map((p) => p.id)
  );

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(price.replace(/[^0-9]/g, ""));
    const numQty = Math.max(1, Number(quantity) || 1);
    if (!name.trim() || numPrice <= 0) return;

    onAddItem({
      name: name.trim(),
      price: numPrice,
      quantity: numQty,
      assignedParticipantIds:
        selectedParticipants.length > 0
          ? selectedParticipants
          : participants.map((p) => p.id),
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
      if (current.length > 1) {
        updated = current.filter((id) => id !== pid);
      } else {
        updated = current; // Keep at least one person
      }
    } else {
      updated = [...current, pid];
    }
    onUpdateItem(item.id, { assignedParticipantIds: updated });
  };

  // Student presets
  const applyPreset = (presetName: string, presetPrice: number) => {
    setName(presetName);
    setPrice(String(presetPrice));
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs sm:text-sm font-bold text-navy-950 dark:text-cream-50 uppercase tracking-wider">
            Daftar Menu & Pesanan ({items.length})
          </h2>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-navy-500 dark:text-cream-300/60 mr-1">Cepat:</span>
        <button
          type="button"
          onClick={() => applyPreset("Ayam Geprek", 18000)}
          className="text-[11px] px-2 py-0.5 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700 transition-colors"
        >
          Ayam Geprek (18k)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("Es Teh Manis", 5000)}
          className="text-[11px] px-2 py-0.5 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700 transition-colors"
        >
          Es Teh (5k)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("Nasi Goreng", 22000)}
          className="text-[11px] px-2 py-0.5 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700 transition-colors"
        >
          Nasgor (22k)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("Kopi Susu", 15000)}
          className="text-[11px] px-2 py-0.5 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700 transition-colors"
        >
          Kopi Susu (15k)
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddItem} className="space-y-3 bg-cream-50/60 dark:bg-navy-950/60 border border-cream-200 dark:border-navy-800 p-3 sm:p-4 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama menu (misal: Soto Betawi)"
            className="sm:col-span-6 bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-navy-950 dark:text-cream-100 placeholder:text-navy-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Harga satuan (Rp)"
            className="sm:col-span-4 bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-navy-950 dark:text-cream-100 placeholder:text-navy-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty"
            className="sm:col-span-2 bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-navy-950 dark:text-cream-100 placeholder:text-navy-400 dark:placeholder:text-cream-300/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-center"
          />
        </div>

        {/* Assigned Participants Selector (if itemized mode) */}
        {mode === "itemized" && participants.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-navy-600 dark:text-cream-300/70">
              Siapa yang pesan / ikut makan menu ini?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {participants.map((p) => {
                const isChecked = selectedParticipants.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleParticipantForNewItem(p.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isChecked
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white dark:bg-navy-900 text-navy-700 dark:text-cream-300 border-cream-300 dark:border-navy-700"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!name.trim() || !price}
          className="w-full flex items-center justify-center gap-1.5 bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 dark:text-navy-950 text-cream-50 text-xs font-bold py-2 rounded-xl transition-all disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Menu ke Tagihan</span>
        </button>
      </form>

      {/* Item List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center py-6 text-xs text-navy-400 dark:text-cream-300/40">
            Belum ada menu yang ditambahkan. Ketik menu di atas atau gunakan preset cepat.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-cream-200 dark:border-navy-800 bg-cream-50/40 dark:bg-navy-950/40 gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-navy-950 dark:text-cream-50 truncate">
                    {item.name}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream-200 dark:bg-navy-800 text-navy-700 dark:text-cream-300 font-bold">
                      x{item.quantity}
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>

                {/* Who shares this item */}
                {mode === "itemized" && (
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-navy-500 dark:text-cream-300/60">Porsi:</span>
                    {participants.map((p) => {
                      const isAssigned = (item.assignedParticipantIds || []).includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleItemParticipant(item, p.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                            isAssigned
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-semibold"
                              : "bg-transparent text-navy-400 dark:text-cream-300/40 border-cream-200 dark:border-navy-800 line-through"
                          }`}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-navy-400 hover:text-rose-500 dark:text-cream-400 transition-colors rounded-lg"
                  title="Hapus menu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
