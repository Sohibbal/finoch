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
    <div className="w-full max-w-md mx-auto my-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Suara Terdeteksi
        </span>
        {isListening && (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
        {transcript}
        {interimTranscript && (
          <span className="text-slate-400 dark:text-slate-500 italic ml-1">
            {interimTranscript}
          </span>
        )}
        {!transcript && !interimTranscript && isListening && (
          <span className="text-slate-400 italic">Mendengarkan ucapan Anda...</span>
        )}
      </p>
    </div>
  );
}
