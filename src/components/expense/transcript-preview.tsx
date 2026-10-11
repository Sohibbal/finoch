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
    <div className="w-full max-w-md mx-auto my-3 p-3.5 bg-paper-sheet border border-ink/20">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-meta font-semibold text-ink-soft">Yang kedengaran</span>
        {isListening && (
          <span className="inline-flex items-center gap-1.5 text-meta font-semibold text-ink">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-ink motion-safe:animate-pulse" />
            Merekam
          </span>
        )}
      </div>

      <p className="text-body text-ink font-medium">
        {transcript}
        {interimTranscript && <span className="text-ink-soft italic ml-1">{interimTranscript}</span>}
        {!transcript && !interimTranscript && isListening && <span className="text-ink-soft italic">Ngomong aja, aku dengerin...</span>}
      </p>
    </div>
  );
}
