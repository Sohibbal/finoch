"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { MonthlyReportSummary, ReportRecipientType } from "@/types/report-types";
import { formatWhatsAppReport } from "@/lib/financial/report-engine";

interface ReportWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthlyReportSummary;
  defaultStudentName?: string;
}

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#070E1A] border border-cream-300 dark:border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-navy-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-navy-950 dark:text-cream-50">
                Kirim Rekap ke WhatsApp
              </h3>
              <p className="text-xs text-navy-500 dark:text-cream-400">
                Format pesan sopan & rapi untuk orang tua atau beasiswa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-navy-500 hover:bg-cream-100 dark:hover:bg-navy-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipient Mode Tabs */}
        <div>
          <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1.5">
            Penerima Laporan:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setRecipientType("parents")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                recipientType === "parents"
                  ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                  : "bg-cream-50 dark:bg-navy-900 border-cream-300 dark:border-navy-800 text-navy-600 dark:text-cream-300 hover:bg-cream-100"
              }`}
            >
              Orang Tua ❤️
            </button>
            <button
              type="button"
              onClick={() => setRecipientType("scholarship")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                recipientType === "scholarship"
                  ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                  : "bg-cream-50 dark:bg-navy-900 border-cream-300 dark:border-navy-800 text-navy-600 dark:text-cream-300 hover:bg-cream-100"
              }`}
            >
              Beasiswa 🎓
            </button>
            <button
              type="button"
              onClick={() => setRecipientType("personal")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                recipientType === "personal"
                  ? "bg-navy-900 text-white dark:bg-cream-100 dark:text-navy-950 border-transparent shadow-sm"
                  : "bg-cream-50 dark:bg-navy-900 border-cream-300 dark:border-navy-800 text-navy-600 dark:text-cream-300 hover:bg-cream-100"
              }`}
            >
              Pribadi 📊
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Nama Mahasiswa:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
              Kampus / Jurusan:
            </label>
            <input
              type="text"
              value={campusName}
              onChange={(e) => setCampusName(e.target.value)}
              placeholder="Contoh: Teknik Informatika ITB"
              className="w-full px-3 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-navy-700 dark:text-cream-300 block mb-1">
            Pesan / Catatan Khusus:
          </label>
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Contoh: Bulan ini hemat karena banyak masak di kost"
            className="w-full px-3 py-2 rounded-xl border border-cream-300 dark:border-navy-800 bg-cream-50 dark:bg-navy-900 text-navy-950 dark:text-cream-50 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Live Preview Box */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-navy-500 dark:text-cream-400 uppercase tracking-wider">
              Pratinjau Pesan WhatsApp:
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-cream-100 dark:bg-navy-900/80 border border-cream-200 dark:border-navy-800 max-h-48 overflow-y-auto custom-scrollbar font-mono text-[11px] whitespace-pre-wrap text-navy-800 dark:text-cream-200 leading-relaxed select-all">
            {generatedText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="w-1/2 py-2.5 rounded-xl border border-cream-300 dark:border-navy-800 text-navy-700 dark:text-cream-300 font-bold text-xs hover:bg-cream-100 dark:hover:bg-navy-800 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
          </button>

          <button
            type="button"
            onClick={handleShareOrSend}
            className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Kirim WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
