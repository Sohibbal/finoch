"use client";

import React from "react";
import { Mic, MicOff, Loader2, Square } from "lucide-react";
import { Guilloche } from "@/components/press/guilloche";

export type VoiceState = "idle" | "listening" | "processing" | "review" | "saved" | "error";

interface VoiceRecorderProps {
  state: VoiceState;
  onStart: () => void;
  onStop: () => void;
  isSupported?: boolean;
  isTranscribing?: boolean;
}

/** The mic as the Catat seal: tap to speak, tap again to stop. The rosette turns while it listens. */
export function VoiceRecorder({ state, onStart, onStop, isSupported = true, isTranscribing = false }: VoiceRecorderProps) {
  const isListening = state === "listening";
  const isProcessing = state === "processing" || isTranscribing;

  const label = !isSupported
    ? "Suara nggak didukung browser ini, ketik saja."
    : isTranscribing
      ? "Menulis yang kamu ucapkan..."
      : isProcessing
        ? "Membaca catatanmu..."
        : isListening
          ? "Aku dengerin. Ketuk lagi kalau sudah."
          : "Ketuk, lalu bilang “warteg 15 ribu, es teh 5 ribu”";

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={isListening ? onStop : onStart}
        disabled={!isSupported || isProcessing}
        aria-label={isListening ? "Berhenti merekam" : "Mulai bicara"}
        className="relative w-20 h-20 shrink-0 rounded-full bg-ink text-paper-sheet dark:text-paper flex flex-col items-center justify-center gap-0.5 ring-4 ring-paper disabled:opacity-60 active:scale-95 motion-safe:transition-transform focus-visible:outline-offset-4"
      >
        <Guilloche
          seed={0x5ea1}
          size={72}
          families={2}
          className={`absolute inset-1 !text-paper-sheet dark:!text-paper opacity-40 ${isListening ? "motion-safe:animate-[spin_8s_linear_infinite]" : ""}`}
        />
        {isProcessing ? (
          <Loader2 className="relative w-6 h-6 motion-safe:animate-spin" aria-hidden="true" />
        ) : isListening ? (
          <Square className="relative w-5 h-5 fill-current" aria-hidden="true" />
        ) : !isSupported ? (
          <MicOff className="relative w-6 h-6" aria-hidden="true" />
        ) : (
          <Mic className="relative w-6 h-6" strokeWidth={2.2} aria-hidden="true" />
        )}
        <span className="relative text-meta font-bold uppercase tracking-[0.1em]">{isListening ? "Stop" : "Bicara"}</span>
      </button>
      <p aria-live="polite" className="text-body text-ink min-w-0">
        {label}
      </p>
    </div>
  );
}
