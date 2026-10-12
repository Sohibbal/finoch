"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  renderFormattedMarkdown,
  sanitizeBotMessage,
} from "@/components/copilot/formatted-message";

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
  formatMarkdown?: boolean; // enable rich formatting without raw asterisks
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
  formatMarkdown = false,
}: TypewriterTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const processedText = formatMarkdown ? sanitizeBotMessage(text) : text;

  useEffect(() => {
    if (!processedText) {
      setDisplayedLength(0);
      setIsTyping(false);
      return;
    }

    // Honor prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayedLength(processedText.length);
      setIsTyping(false);
      onTickRef.current?.(processedText.length);
      onCompleteRef.current?.();
      return;
    }

    // Adaptive step size based on text length for professional, snappy pacing
    const step = processedText.length > 280 ? 3 : processedText.length > 120 ? 2 : 1;

    setDisplayedLength(0);
    setIsTyping(true);

    let currentIndex = 0;
    let timerId: NodeJS.Timeout | null = null;

    const tick = () => {
      currentIndex = Math.min(processedText.length, currentIndex + step);
      setDisplayedLength(currentIndex);
      onTickRef.current?.(currentIndex);

      if (currentIndex >= processedText.length) {
        setIsTyping(false);
        onCompleteRef.current?.();
      } else {
        const char = processedText[currentIndex - 1];
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
  }, [processedText, speed, delay]);

  const handleSkip = () => {
    if (allowSkip && isTyping) {
      setDisplayedLength(processedText.length);
      setIsTyping(false);
      onTickRef.current?.(processedText.length);
      onCompleteRef.current?.();
    }
  };

  const visibleText = processedText.slice(0, displayedLength);

  return (
    <span
      className={`inline ${className} ${allowSkip && isTyping ? "cursor-pointer" : ""}`}
      onClick={handleSkip}
      title={isTyping && allowSkip ? "Klik untuk tampilkan semua" : undefined}
    >
      <span className="sr-only">{processedText}</span>
      <span aria-hidden="true" className={formatMarkdown ? "block w-full" : ""}>
        {formatMarkdown ? (
          <span className="inline-block w-full">
            {renderFormattedMarkdown(visibleText, isTyping)}
          </span>
        ) : (
          visibleText
        )}
        {isTyping && showCursor && (
          <span
            className={`inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-blue-500 dark:bg-blue-400 rounded-xs animate-pulse ${cursorClassName}`}
          />
        )}
      </span>
    </span>
  );
}
