"use client";

import React, { useState, useEffect, useRef } from "react";

export interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per tick (default: 12ms)
  delay?: number; // initial delay before starting (default: 0ms)
  className?: string;
  cursorClassName?: string;
  showCursor?: boolean;
  onTick?: (currentLength: number) => void;
  onComplete?: () => void;
  allowSkip?: boolean; // click to instantly reveal full text (default: true)
}

/**
 * Professional Typewriter Animation Component
 * Smoothly streams text with cadence, natural punctuation pauses, and animated cursor.
 */
export function TypewriterText({
  text,
  speed = 12,
  delay = 0,
  className = "",
  cursorClassName = "",
  showCursor = true,
  onTick,
  onComplete,
  allowSkip = true,
}: TypewriterTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!text) {
      setDisplayedLength(0);
      setIsTyping(false);
      return;
    }

    // Honor prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      onTickRef.current?.(text.length);
      onCompleteRef.current?.();
      return;
    }

    // Adaptive step size based on text length for professional, snappy pacing
    const step = text.length > 280 ? 3 : text.length > 120 ? 2 : 1;

    setDisplayedLength(0);
    setIsTyping(true);

    let currentIndex = 0;
    let timerId: NodeJS.Timeout | null = null;

    const tick = () => {
      currentIndex = Math.min(text.length, currentIndex + step);
      setDisplayedLength(currentIndex);
      onTickRef.current?.(currentIndex);

      if (currentIndex >= text.length) {
        setIsTyping(false);
        onCompleteRef.current?.();
      } else {
        const char = text[currentIndex - 1];
        // Natural micro-pause at punctuation
        const pause =
          char === "." || char === "!" || char === "?"
            ? speed + 45
            : char === "," || char === ":"
            ? speed + 20
            : speed;
        timerId = setTimeout(tick, pause);
      }
    };

    if (delay > 0) {
      timerId = setTimeout(tick, delay);
    } else {
      timerId = setTimeout(tick, speed);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [text, speed, delay]);

  const handleSkip = () => {
    if (allowSkip && isTyping) {
      setDisplayedLength(text.length);
      setIsTyping(false);
      onTickRef.current?.(text.length);
      onCompleteRef.current?.();
    }
  };

  const visibleText = text.slice(0, displayedLength);

  return (
    <span
      className={`inline ${className} ${allowSkip && isTyping ? "cursor-pointer" : ""}`}
      onClick={handleSkip}
      title={isTyping && allowSkip ? "Klik untuk tampilkan semua" : undefined}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {visibleText}
        {isTyping && showCursor && (
          <span
            className={`inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-blue-500 dark:bg-blue-400 rounded-xs animate-pulse ${cursorClassName}`}
          />
        )}
      </span>
    </span>
  );
}
