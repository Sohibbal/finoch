"use client";

import React from "react";
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export type VoiceState = "idle" | "listening" | "processing" | "review" | "saved" | "error";

interface VoiceRecorderProps {
  state: VoiceState;
  onStart: () => void;
  onStop: () => void;
  isSupported?: boolean;
  isTranscribing?: boolean;
}

export function VoiceRecorder({
  state,
  onStart,
  onStop,
  isSupported = true,
  isTranscribing = false,
}: VoiceRecorderProps) {
  const isListening = state === "listening";
  const isProcessing = state === "processing" || isTranscribing;
  const isSaved = state === "saved";
  const isError = state === "error";

  const getStatusLabel = () => {
    if (isTranscribing) {
      return "Menerjemahkan dengan AI lokal...";
    }
    switch (state) {
      case "listening":
        return "Mendengarkan... Bicara sekarang";
      case "processing":
        return "Menganalisis pengeluaran...";
      case "review":
        return "Periksa & konfirmasi transaksi";
      case "saved":
        return "Pengeluaran berhasil dicatat!";
      case "error":
        return "Terjadi masalah suara";
      case "idle":
      default:
        return "Tap untuk bicara";
    }
  };

  const getSubLabel = () => {
    if (state === "idle") {
      return 'Contoh: "beli nasi padang lima belas ribu dan es teh lima ribu"';
    }
    if (state === "listening") {
      return "Berhenti bicara 2 detik untuk analisis otomatis";
    }
    if (state === "error") {
      return "Bicara lagi atau gunakan input Catat Manual di bawah";
    }
    return "";
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center select-none">
      <div className="relative mb-4 flex items-center justify-center">
        {/* Pulsing ring during listening */}
        {isListening && (
          <>
            <div className="absolute w-24 h-24 rounded-full bg-rose-500/25 animate-ping" />
            <div className="absolute w-28 h-28 rounded-full bg-rose-500/15 animate-pulse" />
          </>
        )}

        {/* Main mic button */}
        <button
          type="button"
          onClick={isListening ? onStop : onStart}
          disabled={!isSupported || isProcessing || isSaved}
          aria-label={isListening ? "Hentikan rekaman" : "Mulai merekam suara"}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 ${
            isListening
              ? "bg-rose-600 text-white shadow-rose-600/30 scale-105"
              : isProcessing
              ? "bg-cream-300 dark:bg-navy-800 text-navy-900 dark:text-cream-200 cursor-wait"
              : isSaved
              ? "bg-emerald-600 text-white shadow-emerald-600/25"
              : isError
              ? "bg-rose-600 text-white"
              : "bg-navy-900 hover:bg-navy-800 dark:bg-cream-100 dark:hover:bg-cream-200 text-cream-50 dark:text-navy-950 shadow-md"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isListening ? (
            <Mic className="w-8 h-8 animate-pulse text-white" />
          ) : isSaved ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : !isSupported ? (
            <MicOff className="w-8 h-8 text-navy-400 dark:text-cream-400" />
          ) : isError ? (
            <AlertCircle className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      <p className="text-base font-bold text-navy-950 dark:text-cream-50">
        {getStatusLabel()}
      </p>

      {getSubLabel() && (
        <p className="mt-1 text-xs text-navy-600 dark:text-cream-300/80 max-w-xs">
          {getSubLabel()}
        </p>
      )}
    </div>
  );
}
