"use client";

import React, { useState } from "react";
import { Check, Copy, Send, X } from "lucide-react";
import { MonthlyReportSummary, ReportRecipientType } from "@/types/report-types";
import { formatWhatsAppReport } from "@/lib/financial/report-engine";

interface ReportWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthlyReportSummary;
  defaultStudentName?: string;
}

const FIELD =
  "w-full min-h-11 px-3 bg-paper border border-ink/30 text-body text-ink placeholder:text-ink-soft focus-visible:outline-offset-0";

export function ReportWhatsAppModal({
  isOpen,
  onClose,
  summary,
  defaultStudentName = "Ananda",
}: ReportWhatsAppModalProps) {
  const [recipientType, setRecipientType] = useState<ReportRecipientType>("parents");
  const [studentName, setStudentName] = useState(defaultStudentName);
  const [campusName, setCampusName] = useState("");
  const [customNote, setCustomNote] = useState("Bulan ini pengeluaran terkendali dan uang saku cukup.");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generatedText = formatWhatsAppReport(summary, {
    recipientType,
    studentName: studentName.trim() || "Ananda",
    campusName: campusName.trim(),
    customNote: customNote.trim(),
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Gagal menyalin otomatis, silakan pilih teks secara manual");
    }
  };

  const handleShareOrSend = () => {
    // If Web Share API supported (Mobile PWA)
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `Laporan Keuangan ${summary.monthName} ${summary.year}`,
          text: generatedText,
        })
        .catch(() => {
          // Fallback to direct WhatsApp Web / App URL
          window.open(`https://wa.me/?text=${encodeURIComponent(generatedText)}`, "_blank");
        });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(generatedText)}`, "_blank");
    }
  };

  const RECIPIENTS: Array<{ id: ReportRecipientType; label: string }> = [
    { id: "parents", label: "Orang tua" },
    { id: "scholarship", label: "Beasiswa" },
    { id: "personal", label: "Pribadi" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink/50" role="dialog" aria-modal="true" aria-labelledby="wa-title">
      <div className="w-full max-w-lg bg-paper-sheet border border-ink/20 px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] space-y-5 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 border-b border-ink/20 pb-3">
          <div>
            <h2 id="wa-title" className="font-display text-head font-bold text-ink">
              Kirim rekap ke WhatsApp
            </h2>
            <p className="text-meta text-ink-soft">Pesan sopan dan rapi, tinggal kirim</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="-mr-2 w-11 h-11 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <fieldset>
          <legend className="text-meta text-ink-soft mb-1.5">Penerima</legend>
          <div className="grid grid-cols-3 border border-ink/30">
            {RECIPIENTS.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={recipientType === r.id}
                onClick={() => setRecipientType(r.id)}
                className={`min-h-11 px-2 text-body font-semibold border-l first:border-l-0 border-ink/30 transition-colors ${
                  recipientType === r.id ? "bg-ink text-paper-sheet dark:text-paper" : "text-ink hover:bg-ink/5"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1">
            <span className="block text-meta text-ink-soft">Nama mahasiswa</span>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Contoh: Budi Santoso" className={FIELD} />
          </label>
          <label className="block space-y-1">
            <span className="block text-meta text-ink-soft">Kampus / jurusan</span>
            <input type="text" value={campusName} onChange={(e) => setCampusName(e.target.value)} placeholder="Contoh: Teknik Informatika ITB" className={FIELD} />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="block text-meta text-ink-soft">Catatan tambahan</span>
          <input type="text" value={customNote} onChange={(e) => setCustomNote(e.target.value)} placeholder="Contoh: Bulan ini hemat karena banyak masak di kost" className={FIELD} />
        </label>

        <div className="space-y-1">
          <p className="text-meta text-ink-soft">Pratinjau pesan</p>
          <div className="p-3.5 bg-paper-deep border-l border-dotted border-ink/40 max-h-48 overflow-y-auto text-meta whitespace-pre-wrap text-ink select-all">
            {generatedText}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 min-h-11 rounded-full border border-ink/30 text-ink text-body font-semibold hover:bg-ink/5 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            <span>{copied ? "Tersalin" : "Salin teks"}</span>
          </button>
          <button
            type="button"
            onClick={handleShareOrSend}
            className="flex-1 min-h-11 rounded-full bg-ink hover:bg-ink/90 text-paper-sheet dark:text-paper text-body font-semibold flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>Kirim WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
