"use client";

import React from "react";

export interface BrandLogoProps {
  variant?: "full" | "symbol" | "wordmark" | "stacked";
  theme?: "auto" | "light" | "dark";
  className?: string;
  ariaLabel?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "full",
  theme = "auto",
  className = "h-7 w-auto",
  ariaLabel = "finoch.id",
}) => {
  // Color styling logic
  const isAuto = theme === "auto";
  const isDark = theme === "dark";

  // Stem & Main Monolith
  const stemClass = isAuto
    ? "fill-[#0B192C] dark:fill-white transition-colors duration-200"
    : isDark
    ? "fill-white"
    : "fill-[#0B192C]";

  // Top Cantilever Facet (60° chamfer)
  const topClass = isAuto
    ? "fill-[#2563EB] dark:fill-[#3B82F6] transition-colors duration-200"
    : isDark
    ? "fill-[#3B82F6]"
    : "fill-[#2563EB]";

  // Mid Cantilever Facet
  const midClass = isAuto
    ? "fill-[#0B192C] dark:fill-white transition-colors duration-200"
    : isDark
    ? "fill-white"
    : "fill-[#0B192C]";

  // Acoustic Node (0.3s Voice Trigger) & Dot & Badge
  const accentClass = isAuto
    ? "fill-[#0284C7] dark:fill-[#38BDF8] transition-colors duration-200"
    : isDark
    ? "fill-[#38BDF8]"
    : "fill-[#0284C7]";

  // Wordmark Letters
  const textClass = isAuto
    ? "fill-[#0B192C] dark:fill-white transition-colors duration-200"
    : isDark
    ? "fill-white"
    : "fill-[#0B192C]";

  // ID Pill Badge background
  const badgeBgClass = isAuto
    ? "fill-[#2563EB] dark:fill-[#38BDF8] transition-colors duration-200"
    : isDark
    ? "fill-[#38BDF8]"
    : "fill-[#2563EB]";

  // ID Letters text inside badge
  const badgeTextClass = isAuto
    ? "fill-white dark:fill-[#0A1120] transition-colors duration-200"
    : isDark
    ? "fill-[#0A1120]"
    : "fill-white";

  // 1. SYMBOL ONLY
  if (variant === "symbol") {
    return (
      <svg
        viewBox="0 0 192 192"
        className={className}
        role="img"
        aria-label={ariaLabel}
      >
        <g transform="translate(31.56, 18.0) scale(0.8478)">
          <path className={stemClass} d="M 0 23 L 40 0 V 184 H 0 Z" />
          <path className={topClass} d="M 40 0 H 152 L 126 45 H 40 Z" />
          <path className={midClass} d="M 40 78 H 116 L 90 123 H 40 Z" />
          <polygon
            className={accentClass}
            points="126,78 152,78 126,123 100,123"
          />
        </g>
      </svg>
    );
  }

  // 2. WORDMARK ONLY
  if (variant === "wordmark") {
    return (
      <svg
        viewBox="0 0 550 100"
        className={className}
        role="img"
        aria-label={ariaLabel}
      >
        <g transform="translate(20, 10)">
          {/* F with 60° bevel */}
          <path
            className={textClass}
            d="M 0 80 V 0 H 60 L 42 24 H 22 V 36 H 50 L 36 56 H 22 V 80 Z"
          />
          {/* I */}
          <rect
            className={textClass}
            x="74"
            y="0"
            width="22"
            height="80"
            rx="3"
          />
          {/* N */}
          <path
            className={textClass}
            d="M 110 80 V 0 H 130 L 158 50 V 0 H 178 V 80 H 158 L 130 30 V 80 Z"
          />
          {/* O */}
          <path
            className={textClass}
            fillRule="evenodd"
            d="M 214 0 H 248 C 268 0 278 10 278 40 C 278 70 268 80 248 80 H 214 C 194 80 184 70 184 40 C 184 10 194 0 214 0 Z M 216 22 H 246 C 254 22 258 28 258 40 C 258 52 254 58 246 58 H 216 C 208 58 204 52 204 40 C 204 28 208 22 216 22 Z"
          />
          {/* C */}
          <path
            className={textClass}
            fillRule="evenodd"
            d="M 312 0 H 346 L 332 22 H 314 C 306 22 302 28 302 40 C 302 52 306 58 314 58 H 332 L 346 80 H 312 C 292 80 282 70 282 40 C 282 10 292 0 312 0 Z"
          />
          {/* H */}
          <path
            className={textClass}
            d="M 360 80 V 0 H 382 V 30 H 406 V 0 H 428 V 80 H 406 V 50 H 382 V 80 Z"
          />
          {/* Rhombus Dot */}
          <polygon
            className={accentClass}
            points="444,64 458,64 448,80 434,80"
          />
          {/* ID Pill Badge */}
          <rect
            className={badgeBgClass}
            x="466"
            y="18"
            width="44"
            height="26"
            rx="6"
          />
          {/* ID Letters */}
          <path
            className={badgeTextClass}
            d="M 476 36 V 26 H 480 V 36 Z M 486 36 V 26 H 492 C 498 26 500 28 500 31 C 500 34 498 36 492 36 Z M 490 28 V 34 H 492 C 494 34 495 33 495 31 C 495 29 494 28 492 28 Z"
          />
        </g>
      </svg>
    );
  }

  // 3. STACKED VERTICAL
  if (variant === "stacked") {
    return (
      <svg
        viewBox="0 0 600 500"
        className={className}
        role="img"
        aria-label={ariaLabel}
      >
        <g transform="translate(213.6, 60) scale(1.15)">
          <path className={stemClass} d="M 0 23 L 40 0 V 184 H 0 Z" />
          <path className={topClass} d="M 40 0 H 152 L 126 45 H 40 Z" />
          <path className={midClass} d="M 40 78 H 116 L 90 123 H 40 Z" />
          <polygon
            className={accentClass}
            points="126,78 152,78 126,123 100,123"
          />
        </g>
        <g transform="translate(90.9, 317.6) scale(0.82)">
          <path
            className={textClass}
            d="M 0 80 V 0 H 60 L 42 24 H 22 V 36 H 50 L 36 56 H 22 V 80 Z"
          />
          <rect
            className={textClass}
            x="74"
            y="0"
            width="22"
            height="80"
            rx="3"
          />
          <path
            className={textClass}
            d="M 110 80 V 0 H 130 L 158 50 V 0 H 178 V 80 H 158 L 130 30 V 80 Z"
          />
          <path
            className={textClass}
            fillRule="evenodd"
            d="M 214 0 H 248 C 268 0 278 10 278 40 C 278 70 268 80 248 80 H 214 C 194 80 184 70 184 40 C 184 10 194 0 214 0 Z M 216 22 H 246 C 254 22 258 28 258 40 C 258 52 254 58 246 58 H 216 C 208 58 204 52 204 40 C 204 28 208 22 216 22 Z"
          />
          <path
            className={textClass}
            fillRule="evenodd"
            d="M 312 0 H 346 L 332 22 H 314 C 306 22 302 28 302 40 C 302 52 306 58 314 58 H 332 L 346 80 H 312 C 292 80 282 70 282 40 C 282 10 292 0 312 0 Z"
          />
          <path
            className={textClass}
            d="M 360 80 V 0 H 382 V 30 H 406 V 0 H 428 V 80 H 406 V 50 H 382 V 80 Z"
          />
          <polygon
            className={accentClass}
            points="444,64 458,64 448,80 434,80"
          />
          <rect
            className={badgeBgClass}
            x="466"
            y="18"
            width="44"
            height="26"
            rx="6"
          />
          <path
            className={badgeTextClass}
            d="M 476 36 V 26 H 480 V 36 Z M 486 36 V 26 H 492 C 498 26 500 28 500 31 C 500 34 498 36 492 36 Z M 490 28 V 34 H 492 C 494 34 495 33 495 31 C 495 29 494 28 492 28 Z"
          />
        </g>
      </svg>
    );
  }

  // 4. FULL MASTER HORIZONTAL (DEFAULT)
  return (
    <svg
      viewBox="0 0 720 180"
      className={className}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Symbol */}
      <g transform="translate(25.87, 16.0) scale(0.8043)">
        <path className={stemClass} d="M 0 23 L 40 0 V 184 H 0 Z" />
        <path className={topClass} d="M 40 0 H 152 L 126 45 H 40 Z" />
        <path className={midClass} d="M 40 78 H 116 L 90 123 H 40 Z" />
        <polygon
          className={accentClass}
          points="126,78 152,78 126,123 100,123"
        />
      </g>
      {/* Wordmark */}
      <g transform="translate(184.15, 50.0)">
        <path
          className={textClass}
          d="M 0 80 V 0 H 60 L 42 24 H 22 V 36 H 50 L 36 56 H 22 V 80 Z"
        />
        <rect
          className={textClass}
          x="74"
          y="0"
          width="22"
          height="80"
          rx="3"
        />
        <path
          className={textClass}
          d="M 110 80 V 0 H 130 L 158 50 V 0 H 178 V 80 H 158 L 130 30 V 80 Z"
        />
        <path
          className={textClass}
          fillRule="evenodd"
          d="M 214 0 H 248 C 268 0 278 10 278 40 C 278 70 268 80 248 80 H 214 C 194 80 184 70 184 40 C 184 10 194 0 214 0 Z M 216 22 H 246 C 254 22 258 28 258 40 C 258 52 254 58 246 58 H 216 C 208 58 204 52 204 40 C 204 28 208 22 216 22 Z"
        />
        <path
          className={textClass}
          fillRule="evenodd"
          d="M 312 0 H 346 L 332 22 H 314 C 306 22 302 28 302 40 C 302 52 306 58 314 58 H 332 L 346 80 H 312 C 292 80 282 70 282 40 C 282 10 292 0 312 0 Z"
        />
        <path
          className={textClass}
          d="M 360 80 V 0 H 382 V 30 H 406 V 0 H 428 V 80 H 406 V 50 H 382 V 80 Z"
        />
        <polygon
          className={accentClass}
          points="444,64 458,64 448,80 434,80"
        />
        <rect
          className={badgeBgClass}
          x="466"
          y="18"
          width="44"
          height="26"
          rx="6"
        />
        <path
          className={badgeTextClass}
          d="M 476 36 V 26 H 480 V 36 Z M 486 36 V 26 H 492 C 498 26 500 28 500 31 C 500 34 498 36 492 36 Z M 490 28 V 34 H 492 C 494 34 495 33 495 31 C 495 29 494 28 492 28 Z"
        />
      </g>
    </svg>
  );
};
