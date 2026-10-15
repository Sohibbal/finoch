"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

/**
 * Viewport reveal wrapper with smooth cubic-bezier ease-out.
 * Fully accessible and flicker-free on reload/refresh:
 * - Above-the-fold/in-viewport elements stay smoothly visible without flashing.
 * - Below-the-fold elements smoothly reveal when scrolled into view.
 */
export function RevealSection({
  children,
  className = "",
  delayMs = 0,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isBelowFold, setIsBelowFold] = useState(false);

  useEffect(() => {
    // If user prefers reduced motion or IntersectionObserver is not supported, reveal immediately
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsRevealed(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Check if element is already within the visible viewport on mount
    const rect = element.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewport) {
      setIsRevealed(true);
      return;
    }

    // Element is below the viewport: safely mark as below fold so it can animate upon scrolling
    setIsBelowFold(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.02,
        rootMargin: "0px 0px 50px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // During SSR or if already in viewport on mount, render visible (no flash/double-animation)
  const activeClass = isBelowFold && !isRevealed
    ? "opacity-0 translate-y-8 pointer-events-none"
    : "opacity-100 translate-y-0";

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: delayMs > 0 ? `${delayMs}ms` : undefined,
      }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${activeClass} ${className}`}
    >
      {children}
    </div>
  );
}
