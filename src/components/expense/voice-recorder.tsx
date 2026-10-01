"use client";

import React from "react";
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export type VoiceState = "idle" | "listening" | "processing" | "review" | "saved" | "error";

interface VoiceRecorderProps {
  state: VoiceState;
  onStart: () => void;
  onStop: () => void;
  isSupported?: boolean;
}

export function VoiceRecorder({ state, onStart, onStop, isSupported = true }: VoiceRecorderProps) {
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isSaved = state === "saved";
  const isError = state === "error";

  const getStatusLabel = () => {
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
    return "";
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center select-none">
      <div className="relative mb-4 flex items-center justify-center">
        {/* Pulsing ring during listening */}
        {isListening && (
          <>
            <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="absolute w-28 h-28 rounded-full bg-emerald-500/10 animate-pulse" />
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
              ? "bg-rose-500 text-white shadow-rose-500/30 scale-105"
              : isProcessing
              ? "bg-slate-700 text-slate-300 shadow-slate-700/20 cursor-wait"
              : isSaved
              ? "bg-emerald-600 text-white shadow-emerald-600/30"
              : isError
              ? "bg-amber-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
          }`}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isListening ? (
            <Mic className="w-8 h-8 animate-pulse text-white" />
          ) : isSaved ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : !isSupported ? (
            <MicOff className="w-8 h-8 text-slate-400" />
          ) : isError ? (
            <AlertCircle className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      </div>

      <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {getStatusLabel()}
      </p>

      {getSubLabel() && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          {getSubLabel()}
        </p>
      )}
    </div>
  );
}
