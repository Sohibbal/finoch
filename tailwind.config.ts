import type { Config } from "tailwindcss";

// Theme-aware colors live as "R G B" channels in globals.css so `/opacity` modifiers still work.
const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "-apple-system", "sans-serif"],
        // Heavy banknote numerals and headings only; never body text.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      // The press scale: meta, body, head, plus the giant numeral.
      fontSize: {
        meta: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        body: ["0.9375rem", { lineHeight: "1.4rem" }],
        head: ["1.375rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        numeral: ["clamp(3.5rem, 17vw, 5rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
        // The same numeral for 7+ digit amounts, so "Rp 1.850.000" stays on one line at 342px.
        "numeral-long": ["clamp(2.5rem, 12vw, 5rem)", { lineHeight: "1", letterSpacing: "-0.03em" }],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Lembar Rupiah: ink on note paper, flipped in dark mode.
        paper: { DEFAULT: channel("paper"), sheet: channel("paper-sheet"), deep: channel("paper-deep") },
        ink: { DEFAULT: channel("ink"), soft: channel("ink-soft"), rule: channel("ink-rule") },
        aman: { DEFAULT: channel("aman"), ink: channel("aman-ink") },
        mepet: { DEFAULT: channel("mepet"), ink: channel("mepet-ink") },
        habis: { DEFAULT: channel("habis"), ink: channel("habis-ink") },
        // Teal and slate are fixed per theme (light, then "-dark"); never status green/ochre/red.
        denom: {
          blue: channel("denom-blue"),
          violet: channel("denom-violet"),
          teal: "#1D6B73",
          "teal-dark": "#5FB3B9",
          slate: "#4A5568",
          "slate-dark": "#AEB8C6",
        },
        cream: {
          50: "#FBF8F1",
          100: "#F5EFE0",
          200: "#ECE4D0",
          300: "#DDD2B8",
          400: "#C7B999",
          500: "#A8977A",
          600: "#8C7B5F",
        },
        navy: {
          50: "#F3F5F8",
          100: "#E4E9F0",
          200: "#C9D3E0",
          // 300 is for rules/icons only; 400+ pass AA as text on paper.
          300: "#8A9FB8",
          400: "#4F6B8F",
          500: "#3D6491",
          950: "#070E1A",
          900: "#0B192C",
          850: "#0F223B",
          800: "#152B4D",
          700: "#1C3C68",
          600: "#275490",
          surface: "var(--navy-surface)",
          border: "var(--navy-border)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
