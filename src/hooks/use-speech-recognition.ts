"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export const SILENCE_TIMEOUT_MS = 2000;
export const SPEECH_LANG_ID = "id-ID";

export type SpeechRecognitionErrorType =
  | "not-allowed"
  | "no-speech"
  | "network"
  | "audio-capture"
  | "unsupported"
  | "aborted"
  | "unknown";

interface ExtendedWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: SpeechRecognitionErrorType | null;
  errorMessage: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<SpeechRecognitionErrorType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isIntentionallyStoppedRef = useRef(false);

  // Clear silence timer helper
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Stop listening implementation
  const stopListening = useCallback(() => {
    isIntentionallyStoppedRef.current = true;
    clearSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, [clearSilenceTimer]);

  // Reset silence timer on receiving speech
  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      // Auto-stop after silence threshold
      stopListening();
    }, SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimer, stopListening]);

  // Check Web Speech API availability on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as ExtendedWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_ID;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setErrorMessage(null);
        resetSilenceTimer();
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer();

        let finalPart = "";
        let interimPart = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalPart += text + " ";
          } else {
            interimPart += text;
          }
        }

        if (finalPart.trim()) {
          setTranscript(prev => (prev ? `${prev} ${finalPart.trim()}` : finalPart.trim()));
        }
        setInterimTranscript(interimPart.trim());
      };

      recognition.onerror = (event: any) => {
        clearSilenceTimer();
        const errType: SpeechRecognitionErrorType = event.error || "unknown";

        let userMsg = "Terjadi masalah saat mengenali suara.";
        if (errType === "not-allowed") {
          userMsg = "Akses mikrofon ditolak. Izinkan izin mikrofon di browser Anda.";
        } else if (errType === "no-speech") {
          userMsg = "Tidak terdengar suara. Silakan coba bicara lebih jelas.";
        } else if (errType === "network") {
          userMsg = "Koneksi jaringan suara terganggu. Coba periksa koneksi Anda.";
        }

        setError(errType);
        setErrorMessage(userMsg);
        setIsListening(false);
      };

      recognition.onend = () => {
        clearSilenceTimer();
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
    } catch {
      setIsSupported(false);
    }

    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Cleanup ignore
        }
      }
    };
  }, [clearSilenceTimer, resetSilenceTimer]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("unsupported");
      setErrorMessage("Browser Anda tidak mendukung Web Speech API.");
      return;
    }

    isIntentionallyStoppedRef.current = false;
    setError(null);
    setErrorMessage(null);

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      // If already started, ignore or restart
      if (err.name !== "InvalidStateError") {
        setError("unknown");
        setErrorMessage("Tidak dapat memulai mikrofon.");
      }
    }
  }, [isSupported]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    setErrorMessage(null);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
