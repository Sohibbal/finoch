"use client";

import React, { useState } from "react";
import { WishlistPriority } from "@/types/wishlist-types";
import { FIELD_CLASS, LABEL_CLASS, PaperDialog, PRIMARY_CLASS } from "@/components/press/kampus-press";

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

const PRESETS: { label: string; name: string; price: number; category: string; priority: WishlistPriority }[] = [
  { label: "Sneakers 320rb", name: "Sepatu Sneakers Kuliah", price: 320000, category: "Fashion", priority: "high" },
  { label: "Keyboard 280rb", name: "Mechanical Keyboard", price: 280000, category: "Gadget", priority: "medium" },
  { label: "Hoodie 180rb", name: "Hoodie Oversize", price: 180000, category: "Fashion", priority: "low" },
  { label: "TWS 150rb", name: "Headset TWS ANC", price: 150000, category: "Gadget", priority: "medium" },
];

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
    <PaperDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah incaran"
      subtitle="Barangnya dikunci dulu. Checkout baru boleh setelah masa tunda lewat."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="space-y-1.5">
          <legend className={LABEL_CLASS}>Racun belanja yang sering muncul</legend>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.name, p.price, p.category, p.priority)}
                className="min-h-11 px-3 rounded-full border border-ink/25 text-body text-ink hover:bg-ink/5 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="wish-name" className={LABEL_CLASS}>
            Nama barang
          </label>
          <input
            id="wish-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sepatu sneakers, hoodie, keyboard…"
            className={FIELD_CLASS}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="wish-price" className={LABEL_CLASS}>
              Kira-kira harga (Rp)
            </label>
            <input
              id="wish-price"
              type="number"
              inputMode="numeric"
              required
              min="1000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="250000"
              className={`${FIELD_CLASS} money`}
            />
          </div>
          <div>
            <label htmlFor="wish-category" className={LABEL_CLASS}>
              Kategori
            </label>
            <select id="wish-category" value={category} onChange={(e) => setCategory(e.target.value)} className={FIELD_CLASS}>
              <option value="Fashion">Fashion & pakaian</option>
              <option value="Gadget">Gadget & aksesoris</option>
              <option value="Buku">Buku & kuliah</option>
              <option value="Hobi">Hobi & gaming</option>
              <option value="Kosmetik">Skincare & kosmetik</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="wish-priority" className={LABEL_CLASS}>
              Seberapa butuh
            </label>
            <select
              id="wish-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as WishlistPriority)}
              className={FIELD_CLASS}
            >
              <option value="high">Butuh banget</option>
              <option value="medium">Bagus kalau ada</option>
              <option value="low">Cuma kepengen</option>
            </select>
          </div>
          <div>
            <label htmlFor="wish-cooling" className={LABEL_CLASS}>
              Lama tunda
            </label>
            <select id="wish-cooling" value={coolingDays} onChange={(e) => setCoolingDays(e.target.value)} className={FIELD_CLASS}>
              <option value="3">3 hari</option>
              <option value="7">7 hari (disarankan)</option>
              <option value="14">14 hari</option>
              <option value="30">30 hari</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="wish-note" className={LABEL_CLASS}>
            Kenapa pengen beli?
          </label>
          <input
            id="wish-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Yang lama sudah jebol / pengen ganti gaya"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="wish-link" className={LABEL_CLASS}>
            Link toko online (boleh kosong)
          </label>
          <input
            id="wish-link"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://shopee.co.id/…"
            className={FIELD_CLASS}
          />
        </div>

        <button type="submit" className={`${PRIMARY_CLASS} w-full`}>
          Kunci & mulai tunda {coolingDays} hari
        </button>
      </form>
    </PaperDialog>
  );
}
