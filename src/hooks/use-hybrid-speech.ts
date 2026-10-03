"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import {
  useOfflineWhisper,
  OfflineModelTier,
  OFFLINE_MODEL_CONFIGS,
} from "@/hooks/use-offline-whisper";
import {
  convertAudioBlobTo16kHz,
  checkAudioSupport,
  isAudioSilent,
} from "@/lib/audio/audio-processor";

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
  activeModelTier: OfflineModelTier | null;
  selectedModelTier: OfflineModelTier;
  setSelectedModelTier: (tier: OfflineModelTier) => void;
  isDownloadingModel: boolean;
  modelDownloadProgress: number;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  downloadOfflineModel: (tier?: OfflineModelTier) => Promise<boolean>;
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

  const {
    stopListening: onlineStopListening,
    resetTranscript: onlineResetTranscript,
    startListening: onlineStartListening,
  } = onlineSpeech;

  const {
    transcribe: offlineTranscribe,
    downloadModel: offlineDownloadModel,
    deleteModel: offlineDeleteModel,
    setSelectedModelTier: offlineSetSelectedModelTier,
  } = offlineWhisper;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxRecordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserContextRef = useRef<AudioContext | null>(null);

  // Otomatis beralih ke offline jika Web Speech API mengembalikan error network
  useEffect(() => {
    if (onlineSpeech.error === "network") {
      setIsOnline(false);
    }
  }, [onlineSpeech.error]);

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

  // Pembersihan audio detector & stream offline
  const cleanupOfflineAudio = useCallback(() => {
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
    if (analyserContextRef.current) {
      analyserContextRef.current.close().catch(() => {});
      analyserContextRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  }, []);

  // Stop offline recorder helper
  const stopOfflineRecording = useCallback(() => {
    cleanupOfflineAudio();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsOfflineRecording(false);
  }, [cleanupOfflineAudio]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      cleanupOfflineAudio();
    };
  }, [cleanupOfflineAudio]);

  const stopListening = useCallback(() => {
    if (engineMode === "online") {
      onlineStopListening();
    } else {
      stopOfflineRecording();
    }
  }, [engineMode, onlineStopListening, stopOfflineRecording]);

  const startListening = useCallback(async () => {
    setOfflineError(null);

    if (engineMode === "online") {
      onlineResetTranscript();
      onlineStartListening();
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

        if (audioBlob.size === 0) {
          setOfflineError("Tidak ada rekaman suara.");
          return;
        }

        try {
          const pcmData = await convertAudioBlobTo16kHz(audioBlob);
          if (isAudioSilent(pcmData, 0.005)) {
            setOfflineError("Tidak terdengar suara. Silakan coba bicara lebih jelas.");
            return;
          }
          const resultText = await offlineTranscribe(pcmData);
          if (!resultText) {
            setOfflineError("Suara belum dapat dikenali. Silakan coba bicara lebih dekat ke mikrofon.");
            return;
          }
          setOfflineTranscript(resultText);
        } catch (err: any) {
          setOfflineError(err?.message || "Gagal mentranskripsi audio secara lokal.");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // potong setiap 250ms
      setIsOfflineRecording(true);

      // Pasang Silence Detector otomatis via Web Audio API
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const audioCtx = new AudioCtxClass();
        analyserContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let hasSpoken = false;
        let lastSpeechTime = Date.now();

        silenceIntervalRef.current = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;

          // Ambang batas pendeteksian suara manusia
          if (avg > 14) {
            hasSpoken = true;
            lastSpeechTime = Date.now();
          } else if (hasSpoken && Date.now() - lastSpeechTime > 1800) {
            // Berhenti bicara selama 1.8 detik -> auto-stop
            stopOfflineRecording();
          }
        }, 120);

        // Batas maksimal rekaman 15 detik untuk keamanan
        maxRecordingTimerRef.current = setTimeout(() => {
          stopOfflineRecording();
        }, 15000);
      } catch (e) {
        console.warn("Silence detector initialization warning:", e);
      }
    } catch {
      setOfflineError("Izin mikrofon diperlukan untuk merekam suara.");
      setIsOfflineRecording(false);
    }
  }, [
    engineMode,
    onlineResetTranscript,
    onlineStartListening,
    offlineTranscribe,
    stopOfflineRecording,
  ]);

  const resetTranscript = useCallback(() => {
    onlineResetTranscript();
    setOfflineTranscript("");
    setOfflineError(null);
  }, [onlineResetTranscript]);

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

  return useMemo(
    () => ({
      isListening,
      transcript,
      interimTranscript,
      error,
      engineMode,
      isOnline,
      isTranscribing: offlineWhisper.isTranscribing,
      isModelDownloaded: offlineWhisper.isModelDownloaded,
      activeModelTier: offlineWhisper.activeModelTier,
      selectedModelTier: offlineWhisper.selectedModelTier,
      setSelectedModelTier: offlineSetSelectedModelTier,
      isDownloadingModel: offlineWhisper.isDownloading,
      modelDownloadProgress: offlineWhisper.downloadProgress,
      isSupported,
      startListening,
      stopListening,
      resetTranscript,
      downloadOfflineModel: offlineDownloadModel,
      deleteOfflineModel: offlineDeleteModel,
    }),
    [
      isListening,
      transcript,
      interimTranscript,
      error,
      engineMode,
      isOnline,
      offlineWhisper.isTranscribing,
      offlineWhisper.isModelDownloaded,
      offlineWhisper.activeModelTier,
      offlineWhisper.selectedModelTier,
      offlineSetSelectedModelTier,
      offlineWhisper.isDownloading,
      offlineWhisper.downloadProgress,
      isSupported,
      startListening,
      stopListening,
      resetTranscript,
      offlineDownloadModel,
      offlineDeleteModel,
    ]
  );
}
