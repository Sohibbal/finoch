"use client";

import React from "react";
import { PaperDialog } from "@/components/press/kampus-press";

interface PrivacyDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Each line states what really happens to the data, including where it leaves the phone.
const LINES: { title: string; body: string }[] = [
  {
    title: "Suara",
    body: "Saat online, suara diubah jadi teks oleh layanan suara bawaan browser (misalnya Google di Chrome). Saat offline, Whisper mengolahnya langsung di HP. Finoch tidak menyimpan rekaman audio.",
  },
  {
    title: "Teks catatan",
    body: "Kalimat yang kamu ucapkan dibaca parser di HP. Kalau kamu login, teksnya (bukan audio) bisa dikirim ke server Finoch supaya dibantu AI membaca item dan nominal.",
  },
  {
    title: "Foto struk",
    body: "Struk bisa dibaca di HP, atau diunggah ke server Finoch untuk dibaca lebih teliti. Foto tidak disimpan setelah dibaca.",
  },
  {
    title: "Tempat data",
    body: "Catatan tersimpan dulu di HP, jadi tetap jalan tanpa sinyal. Kalau kamu login, catatan dan data fitur disinkron ke akunmu supaya aman saat ganti HP.",
  },
  {
    title: "Kamu yang memutuskan",
    body: "Tidak ada yang tersimpan sebelum kamu cek dan konfirmasi. Mode Demo memakai data contoh yang terpisah dan tidak pernah disinkron.",
  },
];

export function PrivacyDialog({ isOpen, onClose }: PrivacyDialogProps) {
  return (
    <PaperDialog isOpen={isOpen} onClose={onClose} title="Privasi di Finoch" subtitle="Apa yang terjadi pada suara, struk, dan catatanmu">
      <ol className="px-5 py-4 space-y-4">
        {LINES.map((line, i) => (
          <li key={line.title} className="grid grid-cols-[2rem_1fr] gap-x-2 border-b border-ink/10 pb-4 last:border-0 last:pb-0">
            <span aria-hidden="true" className="font-display text-head text-ink-soft leading-none">
              {i + 1}
            </span>
            <div>
              <h3 className="text-body font-semibold text-ink">{line.title}</h3>
              <p className="text-body text-ink-soft mt-1">{line.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-11 bg-ink text-paper-sheet text-body font-semibold hover:bg-ink/90 transition-colors"
        >
          Mengerti
        </button>
      </div>
    </PaperDialog>
  );
}
