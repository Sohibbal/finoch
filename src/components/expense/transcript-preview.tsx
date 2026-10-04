"use client";

import React from "react";

interface TranscriptPreviewProps {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
}

export function TranscriptPreview({
  transcript,
  interimTranscript,
  isListening,
}: TranscriptPreviewProps) {
  if (!transcript && !interimTranscript && !isListening) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto my-3 p-3.5 rounded-2xl bg-white/80 dark:bg-navy-900/60 border border-cream-300 dark:border-navy-800 text-sm shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-600 dark:text-cream-400">
          Suara Terdeteksi
        </span>
        {isListening && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <p className="text-navy-900 dark:text-cream-100 leading-relaxed font-medium text-xs sm:text-sm">
        {transcript}
        {interimTranscript && (
          <span className="text-navy-500 dark:text-cream-300/70 italic ml-1">
            {interimTranscript}
          </span>
        )}
        {!transcript && !interimTranscript && isListening && (
          <span className="text-navy-400 dark:text-cream-400/60 italic">Mendengarkan ucapan Anda...</span>
        )}
      </p>
    </div>
  );
}
