"use client";

import React from "react";

// 24 subtle ambient floating particle dots scattered across the hero view matching Cobalt aesthetic
const PARTICLES = [
  { id: 1, top: "12%", left: "18%", size: 2, delay: "0s", duration: "9s", anim: "float-1", opacity: 0.65 },
  { id: 2, top: "16%", left: "42%", size: 1.5, delay: "2s", duration: "11s", anim: "float-2", opacity: 0.5 },
  { id: 3, top: "19%", left: "82%", size: 2, delay: "1.2s", duration: "8.5s", anim: "float-3", opacity: 0.7 },
  { id: 4, top: "27%", left: "14%", size: 1.5, delay: "3s", duration: "12s", anim: "float-2", opacity: 0.45 },
  { id: 5, top: "31%", left: "68%", size: 2.5, delay: "0.5s", duration: "10s", anim: "float-1", opacity: 0.8 },
  { id: 6, top: "36%", left: "26%", size: 2, delay: "4s", duration: "13s", anim: "float-3", opacity: 0.55 },
  { id: 7, top: "41%", left: "88%", size: 1.5, delay: "1s", duration: "9s", anim: "float-1", opacity: 0.6 },
  { id: 8, top: "46%", left: "35%", size: 2, delay: "2.5s", duration: "11.5s", anim: "float-2", opacity: 0.55 },
  { id: 9, top: "51%", left: "75%", size: 1.5, delay: "3.5s", duration: "14s", anim: "float-3", opacity: 0.45 },
  { id: 10, top: "57%", left: "16%", size: 2, delay: "1.5s", duration: "9.5s", anim: "float-1", opacity: 0.65 },
  { id: 11, top: "61%", left: "54%", size: 1.5, delay: "4.5s", duration: "12.5s", anim: "float-2", opacity: 0.5 },
  { id: 12, top: "67%", left: "29%", size: 2.5, delay: "0.8s", duration: "10.5s", anim: "float-3", opacity: 0.75 },
  { id: 13, top: "71%", left: "83%", size: 1.5, delay: "2.2s", duration: "13s", anim: "float-1", opacity: 0.5 },
  { id: 14, top: "77%", left: "47%", size: 2, delay: "3.8s", duration: "9.5s", anim: "float-2", opacity: 0.6 },
  { id: 15, top: "81%", left: "21%", size: 1.5, delay: "1.7s", duration: "11.5s", anim: "float-3", opacity: 0.5 },
  { id: 16, top: "85%", left: "71%", size: 2, delay: "4.2s", duration: "10s", anim: "float-1", opacity: 0.65 },
  { id: 17, top: "23%", left: "51%", size: 1.5, delay: "2.8s", duration: "12s", anim: "float-2", opacity: 0.4 },
  { id: 18, top: "44%", left: "63%", size: 2, delay: "0.2s", duration: "8.5s", anim: "float-3", opacity: 0.7 },
  { id: 19, top: "63%", left: "91%", size: 1.5, delay: "3.1s", duration: "13.5s", anim: "float-1", opacity: 0.45 },
  { id: 20, top: "75%", left: "11%", size: 2, delay: "1.9s", duration: "11s", anim: "float-2", opacity: 0.55 },
  { id: 21, top: "17%", left: "31%", size: 1.5, delay: "2.1s", duration: "10s", anim: "float-3", opacity: 0.5 },
  { id: 22, top: "34%", left: "77%", size: 2, delay: "3.4s", duration: "12s", anim: "float-1", opacity: 0.6 },
  { id: 23, top: "53%", left: "49%", size: 1.5, delay: "0.9s", duration: "9.5s", anim: "float-2", opacity: 0.5 },
  { id: 24, top: "87%", left: "59%", size: 2, delay: "2.7s", duration: "11s", anim: "float-3", opacity: 0.55 },
];

export function HeroParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className={`absolute rounded-full bg-blue-600/60 dark:bg-white animate-${p.anim}`}
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: p.duration,
            animationDelay: p.delay,
            boxShadow: `0 0 ${p.size * 2.5}px rgba(255, 255, 255, 0.95), 0 0 ${p.size * 5}px rgba(147, 197, 253, 0.7)`,
          }}
        />
      ))}
    </div>
  );
}
