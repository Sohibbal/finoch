"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles, Star } from "lucide-react";

interface ManualWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; targetPrice: number; priority: number }) => Promise<void> | void;
}

export function ManualWishlistModal({ isOpen, onClose, onSave }: ManualWishlistModalProps) {
  const [name, setName] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [priority, setPriority] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = Number(targetPrice.replace(/[^0-9]/g, ""));
    if (!name.trim() || cleanPrice <= 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        targetPrice: cleanPrice,
        priority,
      });
      setName("");
      setTargetPrice("");
      setPriority(3);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPreset = (presetName: string, presetPrice: number, presetPriority: number) => {
    setName(presetName);
    setTargetPrice(presetPrice.toString());
    setPriority(presetPriority);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-paper dark:bg-navy-900 rounded-3xl p-6 shadow-xl border border-ink/10 dark:border-navy-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-950 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-head font-bold text-ink dark:text-white">Tambah Wishlist</h2>
              <p className="text-meta text-ink-soft dark:text-navy-400">Kunci incaranmu dan hitung jadwal belinya</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-ink/5 dark:hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <span className="text-meta font-medium text-ink-soft dark:text-navy-400">Incaran Populer</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Sneakers (350rb)", name: "Sepatu Sneakers", price: 350000, pri: 3 },
              { label: "Keyboard (280rb)", name: "Mechanical Keyboard", price: 280000, pri: 2 },
              { label: "Headphone (500rb)", name: "Headphone ANC", price: 500000, pri: 4 },
            ].map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setPreset(p.name, p.price, p.pri)}
                className="text-meta px-2.5 py-1 rounded-full border border-ink/15 dark:border-navy-700 hover:bg-ink/5 dark:hover:bg-navy-800 transition-colors text-ink dark:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-meta font-semibold text-ink dark:text-white mb-1.5">
              Nama Barang / Incaran
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Sepatu Adidas Samba"
              className="w-full px-4 py-2.5 rounded-xl border border-ink/15 dark:border-navy-700 bg-paper-sheet dark:bg-navy-950 text-ink dark:text-white placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-meta font-semibold text-ink dark:text-white mb-1.5">
              Target Harga (Rp)
            </label>
            <input
              type="number"
              required
              min={1000}
              step={1000}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Contoh: 1500000"
              className="w-full px-4 py-2.5 rounded-xl border border-ink/15 dark:border-navy-700 bg-paper-sheet dark:bg-navy-950 text-ink dark:text-white placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-meta font-semibold text-ink dark:text-white mb-1.5">
              Prioritas ({priority} / 5 Bintang)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPriority(star)}
                  className={`p-2 rounded-xl transition-colors ${
                    priority >= star
                      ? "text-amber-500 bg-amber-500/10"
                      : "text-ink-soft/40 hover:text-ink-soft dark:text-navy-600"
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink/10 dark:border-navy-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-meta font-medium text-ink-soft hover:text-ink dark:text-navy-400 dark:hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink text-paper-sheet dark:bg-white dark:text-navy-950 font-semibold text-meta hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Incaran"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
