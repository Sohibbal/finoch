import type { Config } from "tailwindcss";

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
        sans: [
          "var(--font-plus-jakarta-sans)",
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: {
          50: "#FCFBF7",
          100: "#FAF7F0",
          200: "#F3EEDF",
          300: "#E7DFCC",
          400: "#D6C9B0",
          500: "#BDAC8D",
        },
        navy: {
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
