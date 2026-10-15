"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export const SILENCE_TIMEOUT_MS = 2000;
export const INITIAL_NO_SPEECH_TIMEOUT_MS = 10000;
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

const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ""
  );
};

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<SpeechRecognitionErrorType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const interimRef = useRef("");

  // Clear silence timer helper
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Stop listening implementation
  const stopListening = useCallback(() => {
    clearSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
    }

    // Promote any unfinalized interim speech before stopping
    if (interimRef.current.trim()) {
      const salvaged = interimRef.current.trim();
      setTranscript(prev => (prev ? `${prev} ${salvaged}` : salvaged));
      interimRef.current = "";
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

  // Instantiate and wire speech recognition instance
  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const win = window as ExtendedWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return null;
    }

    try {
      const isMobile = isMobileDevice();
      const recognition = new SpeechRecognitionClass();
      // On mobile browsers, continuous mode can stall or freeze speech processing; disable continuous for mobile
      recognition.continuous = !isMobile;
      recognition.interimResults = true;
      recognition.lang = SPEECH_LANG_ID;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setErrorMessage(null);
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(stopListening, INITIAL_NO_SPEECH_TIMEOUT_MS);
      };

      recognition.onresult = (event: any) => {
        resetSilenceTimer();

        let finalPart = "";
        let interimPart = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || "";

          if (result.isFinal) {
            finalPart += text + " ";
          } else {
            interimPart += text;
          }
        }

        if (finalPart.trim()) {
          setTranscript(prev => (prev ? `${prev} ${finalPart.trim()}` : finalPart.trim()));
          interimRef.current = "";
        } else if (interimPart.trim()) {
          interimRef.current = interimPart.trim();
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
          userMsg = "Pengenalan suara browser memerlukan koneksi internet di Chrome/Edge. Anda tetap bisa menggunakan Catat Manual di bawah yang 100% offline.";
        }

        setError(errType);
        setErrorMessage(userMsg);
        setIsListening(false);
      };

      recognition.onend = () => {
        clearSilenceTimer();
        // On mobile Chrome/WebKit, promote any trailing interim speech before ending
        if (interimRef.current.trim()) {
          const salvaged = interimRef.current.trim();
          setTranscript(prev => (prev ? `${prev} ${salvaged}` : salvaged));
          interimRef.current = "";
        }
        setIsListening(false);
        setInterimTranscript("");
      };

      recognitionRef.current = recognition;
      setIsSupported(true);
      return recognition;
    } catch {
      setIsSupported(false);
      return null;
    }
  }, [clearSilenceTimer, resetSilenceTimer, stopListening]);

  // Check Web Speech API availability on mount
  useEffect(() => {
    initRecognition();

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
  }, [clearSilenceTimer, initRecognition]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("unsupported");
      setErrorMessage("Browser Anda tidak mendukung Web Speech API.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("network");
      setErrorMessage("Perangkat sedang offline. Pengenalan suara browser memerlukan koneksi internet di Chrome/Edge. Anda tetap bisa menggunakan Catat Manual di bawah yang 100% offline.");
      return;
    }

    setError(null);
    setErrorMessage(null);

    // If existing instance exists, try starting it
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        return;
      } catch {
        // If start failed (e.g. stopped instance on mobile), create fresh instance below
      }
    }

    try {
      const freshRecognition = initRecognition();
      if (freshRecognition) {
        freshRecognition.start();
        setIsListening(true);
      }
    } catch (err: any) {
      if (err?.name !== "InvalidStateError") {
        setError("unknown");
        setErrorMessage("Tidak dapat memulai mikrofon.");
      }
    }
  }, [isSupported, initRecognition]);

  const resetTranscript = useCallback(() => {
    interimRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    setErrorMessage(null);
  }, []);

  return useMemo(
    () => ({
      isListening,
      transcript,
      interimTranscript,
      error,
      errorMessage,
      isSupported,
      startListening,
      stopListening,
      resetTranscript,
    }),
    [
      isListening,
      transcript,
      interimTranscript,
      error,
      errorMessage,
      isSupported,
      startListening,
      stopListening,
      resetTranscript,
    ]
  );
}
