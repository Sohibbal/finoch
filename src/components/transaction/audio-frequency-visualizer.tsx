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
    new Array(24).fill(14)
  );
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isListening) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setFrequencies(new Array(24).fill(14));
      return;
    }

    let tick = 0;
    const barCount = 24;
    const center = (barCount - 1) / 2;

    const renderLoop = () => {
      tick += 0.08;

      const nextBars = Array.from({ length: barCount }, (_, i) => {
        // Distance from center bell curve factor (peaked in middle, tapered at edges)
        const distFromCenter = Math.abs(i - center) / center;
        const bellCurve = Math.max(0.35, 1 - distFromCenter * 0.7);

        // Layered harmonic sine waves for organic, dynamic voice frequency simulation
        const wave1 = Math.sin(tick * 1.8 + i * 0.4) * 0.5 + 0.5;
        const wave2 = Math.cos(tick * 2.3 + i * 0.55) * 0.3 + 0.3;
        const wave3 = Math.sin(tick * 3.1 - i * 0.25) * 0.2 + 0.2;

        const combined = (wave1 + wave2 + wave3) * bellCurve;
        const heightPct = Math.max(16, Math.min(92, Math.round(18 + combined * 70)));
        return heightPct;
      });

      setFrequencies(nextBars);
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
