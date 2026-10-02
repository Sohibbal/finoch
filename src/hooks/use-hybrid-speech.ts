"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useOfflineWhisper } from "@/hooks/use-offline-whisper";
import { convertAudioBlobTo16kHz, checkAudioSupport } from "@/lib/audio/audio-processor";

export type SpeechEngineMode = "online" | "offline-whisper" | "offline-unready";

export interface DetermineEngineModeParams {
  isOnline: boolean;
  isModelDownloaded: boolean;
}

export function determineEngineMode(params: DetermineEngineModeParams): SpeechEngineMode {
  if (params.isOnline) {
    return "online";
  }
  if (params.isModelDownloaded) {
    return "offline-whisper";
  }
  return "offline-unready";
}

export interface UseHybridSpeechReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  engineMode: SpeechEngineMode;
  isOnline: boolean;
  isTranscribing: boolean;
  isModelDownloaded: boolean;
  isDownloadingModel: boolean;
  modelDownloadProgress: number;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  downloadOfflineModel: () => Promise<boolean>;
  deleteOfflineModel: () => Promise<void>;
}

export function useHybridSpeech(): UseHybridSpeechReturn {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  const [offlineTranscript, setOfflineTranscript] = useState("");
  const [offlineError, setOfflineError] = useState<string | null>(null);
  const [isOfflineRecording, setIsOfflineRecording] = useState(false);

  // Online speech engine (Web Speech API)
  const onlineSpeech = useSpeechRecognition();

  // Offline speech engine (Whisper Web Worker)
  const offlineWhisper = useOfflineWhisper();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Monitor network status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const engineMode = determineEngineMode({
    isOnline,
    isModelDownloaded: offlineWhisper.isModelDownloaded,
  });

  // Stop offline recorder helper
  const stopOfflineRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    setIsOfflineRecording(false);
  }, []);

  const startListening = useCallback(async () => {
    setOfflineError(null);

    if (engineMode === "online") {
      onlineSpeech.resetTranscript();
      onlineSpeech.startListening();
      return;
    }

    if (engineMode === "offline-unready") {
      setOfflineError(
        "Paket suara offline belum diunduh. Silakan unduh paket suara atau gunakan input Catat Manual."
      );
      return;
    }

    // engineMode === "offline-whisper"
    try {
      setOfflineTranscript("");
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const { mimeType } = checkAudioSupport();
      const options = mimeType ? { mimeType } : undefined;

      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsOfflineRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audioBlob.size === 0) return;

        try {
          const pcmData = await convertAudioBlobTo16kHz(audioBlob);
          const resultText = await offlineWhisper.transcribe(pcmData);
          setOfflineTranscript(resultText);
        } catch (err: any) {
          setOfflineError(err?.message || "Gagal mentranskripsi audio secara lokal.");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // potong setiap 250ms
      setIsOfflineRecording(true);
    } catch (err: any) {
      setOfflineError("Izin mikrofon diperlukan untuk merekam suara.");
      setIsOfflineRecording(false);
    }
  }, [engineMode, onlineSpeech, offlineWhisper]);

  const stopListening = useCallback(() => {
    if (engineMode === "online") {
      onlineSpeech.stopListening();
    } else {
      stopOfflineRecording();
    }
  }, [engineMode, onlineSpeech, stopOfflineRecording]);

  const resetTranscript = useCallback(() => {
    onlineSpeech.resetTranscript();
    setOfflineTranscript("");
    setOfflineError(null);
  }, [onlineSpeech]);

  // Unified returned values
  const isListening =
    engineMode === "online" ? onlineSpeech.isListening : isOfflineRecording;

  const transcript =
    engineMode === "online" ? onlineSpeech.transcript : offlineTranscript;

  const interimTranscript =
    engineMode === "online" ? onlineSpeech.interimTranscript : "";

  const error =
    engineMode === "online"
      ? onlineSpeech.errorMessage
      : offlineError || offlineWhisper.error;

  const isSupported =
    typeof window !== "undefined" &&
    (onlineSpeech.isSupported || typeof navigator.mediaDevices !== "undefined");

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    engineMode,
    isOnline,
    isTranscribing: offlineWhisper.isTranscribing,
    isModelDownloaded: offlineWhisper.isModelDownloaded,
    isDownloadingModel: offlineWhisper.isDownloading,
    modelDownloadProgress: offlineWhisper.downloadProgress,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    downloadOfflineModel: offlineWhisper.downloadModel,
    deleteOfflineModel: offlineWhisper.deleteModel,
  };
}
