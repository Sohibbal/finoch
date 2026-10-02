"use client";

import React from "react";

export function WaveBackground() {
  return (
    <div className="navy-hero-canvas select-none" aria-hidden="true">
      {/* Dynamic Radial Color Blobs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl dark:from-blue-500/20 dark:via-indigo-900/30 dark:to-transparent animate-mesh-pulse" />
      <div className="absolute top-10 left-[10%] w-[450px] h-[350px] rounded-full bg-gradient-to-r from-sky-500/10 to-blue-700/10 blur-3xl dark:from-blue-600/15 dark:to-indigo-950/20 animate-mesh-pulse" style={{ animationDelay: "-4s" }} />
      <div className="absolute top-20 right-[10%] w-[500px] h-[400px] rounded-full bg-gradient-to-bl from-indigo-500/10 via-blue-600/10 to-transparent blur-3xl dark:from-indigo-600/20 dark:via-blue-900/25 dark:to-transparent animate-mesh-pulse" style={{ animationDelay: "-7s" }} />

      {/* Flowing Organic SVG Waves */}
      <div className="absolute inset-0 flex flex-col justify-end opacity-40 dark:opacity-60 overflow-hidden">
        {/* Wave Layer 1 */}
        <svg
          className="w-[120%] -ml-[10%] h-44 sm:h-64 animate-wave-1 text-blue-200/40 dark:text-blue-900/30 fill-current"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,122.7C672,117,768,171,864,192C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>

        {/* Wave Layer 2 */}
        <svg
          className="w-[130%] -ml-[15%] -mt-20 h-48 sm:h-72 animate-wave-2 text-indigo-200/50 dark:text-indigo-950/40 fill-current"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path d="M0,64L48,96C96,128,192,192,288,202.7C384,213,480,171,576,149.3C672,128,768,128,864,154.7C960,181,1056,235,1152,229.3C1248,224,1344,160,1392,128L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>

        {/* Wave Layer 3 */}
        <svg
          className="w-[115%] -ml-[5%] -mt-16 h-36 sm:h-52 animate-wave-3 text-blue-100/60 dark:text-blue-950/60 fill-current"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,218.7C840,235,960,245,1080,218.7C1200,192,1320,128,1380,96L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
      </div>
    </div>
  );
}
