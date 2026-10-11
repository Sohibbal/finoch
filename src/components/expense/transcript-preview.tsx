"use client";

import React from "react";

interface TranscriptPreviewProps {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
}

/** What was heard so far, in the user's own words. */
export function TranscriptPreview({ transcript, interimTranscript, isListening }: TranscriptPreviewProps) {
  if (!transcript && !interimTranscript && !isListening) {
    return null;
  }

  return (
    <p className="text-body text-ink border-l border-dotted border-ink/40 pl-3">
      <span className="sr-only">Yang kedengaran: </span>
      {transcript}
      {interimTranscript && <span className="text-ink-soft ml-1">{interimTranscript}</span>}
      {!transcript && !interimTranscript && isListening && <span className="text-ink-soft">Ngomong aja, aku dengerin...</span>}
    </p>
  );
}
