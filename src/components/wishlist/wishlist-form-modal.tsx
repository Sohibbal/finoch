"use client";

import React, { useState } from "react";
import { X, Sparkles, Clock, Heart } from "lucide-react";
import { WishlistPriority } from "@/types/wishlist-types";

interface WishlistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    price: number;
    category: string;
    priority: WishlistPriority;
    coolingDays: number;
    note?: string;
    linkUrl?: string;
  }) => void;
}

export function WishlistFormModal({
  isOpen,
  onClose,
  onSubmit,
}: WishlistFormModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [priority, setPriority] = useState<WishlistPriority>("medium");
  const [coolingDays, setCoolingDays] = useState("7");
  const [note, setNote] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(price.replace(/[^0-9]/g, ""));
    if (!name.trim() || numPrice <= 0) return;

    onSubmit({
      name: name.trim(),
      price: numPrice,
      category,
      priority,
      coolingDays: Number(coolingDays) || 7,
      note: note.trim() || undefined,
      linkUrl: linkUrl.trim() || undefined,
    });

    setName("");
    setPrice("");
    setNote("");
    setLinkUrl("");
    onClose();
  };

  const applyPreset = (
    pName: string,
    pPrice: number,
    pCat: string,
    pPri: WishlistPriority
  ) => {
    setName(pName);
    setPrice(String(pPrice));
    setCategory(pCat);
    setPriority(pPri);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-900 border border-cream-300 dark:border-navy-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-cream-200 dark:border-navy-800">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="text-sm sm:text-base font-bold text-navy-950 dark:text-cream-50">
              Tambah Barang Incaran (Wishlist)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-navy-400 hover:text-navy-700 dark:hover:text-cream-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Presets for Students */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-navy-600 dark:text-cream-300/70">
              Racun Belanja Anak Muda Populer:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset("Sepatu Sneakers Kuliah", 320000, "Fashion", "high")}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700"
              >
                Sneakers (320k)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("Mechanical Keyboard", 280000, "Gadget", "medium")}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700"
              >
                Keyboard (280k)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("Hoodie Oversize", 180000, "Fashion", "low")}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700"
              >
                Hoodie (180k)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("Headset TWS ANC", 150000, "Gadget", "medium")}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-navy-800 dark:text-cream-200 border border-cream-200 dark:border-navy-700"
              >
                TWS (150k)
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
              Nama Barang
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Sepatu Sneakers Aerostreet / Jaket Hoodie"
              className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
                Estimasi Harga (Rp)
              </label>
              <input
                type="number"
                required
                min="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 250000"
                className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="Fashion">Fashion & Pakaian</option>
                <option value="Gadget">Gadget & Aksesoris</option>
                <option value="Buku">Buku & Kuliah</option>
                <option value="Hobi">Hobi & Gaming</option>
                <option value="Kosmetik">Skincare & Kosmetik</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Priority & Cooling Period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
                Tingkat Kebutuhan
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WishlistPriority)}
                className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="high">Tinggi (Sangat Perlu)</option>
                <option value="medium">Sedang (Bagus Kalau Ada)</option>
                <option value="low">Rendah (Cuma Kepengen)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
                Waktu Tunda (Pikir Ulang)
              </label>
              <select
                value={coolingDays}
                onChange={(e) => setCoolingDays(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs sm:text-sm text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <option value="3">3 Hari (Cepat)</option>
                <option value="7">7 Hari (Rekomendasi Standar)</option>
                <option value="14">14 Hari (2 Minggu)</option>
                <option value="30">30 Hari (1 Bulan)</option>
              </select>
            </div>
          </div>

          {/* Note & Link */}
          <div>
            <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
              Catatan & Alasan Ingin Beli
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Barang lama sudah rusak / Pengen ganti gaya"
              className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-800 dark:text-cream-200 mb-1">
              Link Toko Online (Opsional)
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://shopee.co.id/..."
              className="w-full px-3 py-2 bg-cream-50 dark:bg-navy-950 border border-cream-300 dark:border-navy-800 rounded-xl text-xs text-navy-950 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Kunci Barang & Mulai Masa Tunda {coolingDays} Hari
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
