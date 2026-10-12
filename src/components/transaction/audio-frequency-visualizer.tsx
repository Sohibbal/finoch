"use client";

import React, { useState, useEffect, useRef } from "react";

interface AudioFrequencyVisualizerProps {
  isListening: boolean;
  className?: string;
}

export function AudioFrequencyVisualizer({
  isListening,
  className = "",
}: AudioFrequencyVisualizerProps) {
  const [frequencies, setFrequencies] = useState<number[]>(() =>
    new Array(24).fill(16)
  );
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isListening) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setFrequencies(new Array(24).fill(14));
      return;
    }

    let isCancelled = false;
    let fallbackTick = 0;

    const initAudio = async () => {
      try {
        if (
          typeof window !== "undefined" &&
          navigator?.mediaDevices?.getUserMedia
        ) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

          if (isCancelled) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          streamRef.current = stream;
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const ctx = new AudioContextClass();
          audioContextRef.current = ctx;

          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          analyser.smoothingTimeConstant = 0.65;

          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const renderLoop = () => {
            if (isCancelled) return;
            analyser.getByteFrequencyData(dataArray);

            const barCount = 24;
            const step = Math.max(1, Math.floor(bufferLength / barCount));
            let totalVolume = 0;
            const nextBars: number[] = [];

            for (let i = 0; i < barCount; i++) {
              const val = dataArray[i * step] || 0;
              totalVolume += val;
              const mapped = Math.max(14, Math.min(100, Math.round((val / 255) * 100)));
              nextBars.push(mapped);
            }

            // If background is very quiet, overlay subtle rhythmic breathing pulse
            if (totalVolume < 35) {
              fallbackTick += 0.08;
              const pulsed = nextBars.map((_, idx) => {
                const wave = Math.sin(fallbackTick + idx * 0.45) * 0.5 + 0.5;
                const wave2 = Math.cos(fallbackTick * 1.4 + idx * 0.25) * 0.3 + 0.3;
                return Math.round(18 + (wave + wave2) * 32);
              });
              setFrequencies(pulsed);
            } else {
              setFrequencies(nextBars);
            }

            animFrameRef.current = requestAnimationFrame(renderLoop);
          };

          animFrameRef.current = requestAnimationFrame(renderLoop);
          return;
        }
      } catch {
        // Fallback gracefully if getUserMedia is denied, mocked, or unsupported
      }

      // Synthetic dynamic audio visualizer fallback loop
      const fallbackLoop = () => {
        if (isCancelled) return;
        fallbackTick += 0.09;
        const fakeBars = Array.from({ length: 24 }, (_, i) => {
          const wave1 = Math.sin(fallbackTick * 1.8 + i * 0.4) * 0.5 + 0.5;
          const wave2 = Math.cos(fallbackTick * 2.2 + i * 0.3) * 0.3 + 0.3;
          return Math.round(20 + (wave1 + wave2) * 45);
        });
        setFrequencies(fakeBars);
        animFrameRef.current = requestAnimationFrame(fallbackLoop);
      };
      animFrameRef.current = requestAnimationFrame(fallbackLoop);
    };

    initAudio();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [isListening]);

  return (
    <div
      aria-hidden="true"
      className={`flex items-end justify-center gap-1 sm:gap-1.5 h-16 w-full px-4 py-2 select-none pointer-events-none ${className}`}
    >
      {frequencies.map((heightPct, idx) => (
        <span
          key={idx}
          style={{ height: `${heightPct}%` }}
          className={`w-1 sm:w-1.5 rounded-full transition-all duration-75 ${
            isListening
              ? "bg-gradient-to-t from-blue-600 via-sky-400 to-emerald-400 dark:from-blue-500 dark:via-cyan-300 dark:to-emerald-300 shadow-[0_0_8px_rgba(56,189,248,0.35)]"
              : "bg-slate-200 dark:bg-slate-700 h-2"
          }`}
        />
      ))}
    </div>
  );
}
