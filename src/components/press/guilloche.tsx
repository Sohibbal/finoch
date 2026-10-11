import React, { useMemo } from "react";

/** Small seeded PRNG (mulberry32): same seed, same rosette on server and client. */
function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

/**
 * One closed hypotrochoid in a 100x100 box centred on 0:
 * x = a·cos t + b·cos(k t), y = a·sin t − b·sin(k t), k = (p − q) / q, t ∈ [0, 2πq].
 * p petals, q loops; a + b is the outer radius.
 */
export function hypotrochoidPath(radius: number, inner: number, petals: number, loops: number): string {
  const q = loops / gcd(petals, loops);
  const k = (petals - loops) / loops;
  const a = radius - inner;
  const steps = Math.min(2400, petals * q * 10);
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI * q;
    const x = a * Math.cos(t) + inner * Math.cos(k * t);
    const y = a * Math.sin(t) - inner * Math.sin(k * t);
    d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d + "Z";
}

/** The line families of a rosette, derived from `seed` only. */
export function rosetteFamilies(seed: number, families = 4): string[] {
  const rand = prng(seed);
  const paths: string[] = [];
  for (let i = 0; i < families; i++) {
    const radius = 48 - i * 9;
    const petals = 18 + Math.floor(rand() * 24);
    const loops = 1 + Math.floor(rand() * 4);
    const inner = radius * (0.18 + rand() * 0.3);
    paths.push(hypotrochoidPath(radius, inner, petals, loops));
  }
  return paths;
}

interface GuillocheProps {
  seed: number;
  /** Rendered size in px (square). */
  size?: number;
  /** Extra rotation in degrees; changing it turns the rosette (transition lives on the SVG). */
  turn?: number;
  families?: number;
  className?: string;
}

/** Procedural guilloche rosette: hairline ink line families, purely decorative. */
export function Guilloche({ seed, size = 160, turn = 0, families = 4, className = "" }: GuillocheProps) {
  const paths = useMemo(() => rosetteFamilies(seed, families), [seed, families]);
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="-50 -50 100 100"
      width={size}
      height={size}
      className={`text-ink motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      style={{ transform: `rotate(${turn}deg)` }}
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeOpacity={0.55 - i * 0.08}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
