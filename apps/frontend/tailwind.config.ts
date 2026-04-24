import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Design System: Obra Fácil — per spec_ui.md "Diretrizes para IA"
      colors: {
        // ── Legacy semantic tokens (spec_ui.md) — mantidos para compat ──
        trust: "#1E40AF",
        error: "#EF4444",
        savings: "#10B981",
        brand: "#ec5b13",
        "brand-light": "#fff4ed",
        surface: "#f8f6f6",
        "on-trust": "#ffffff",
        "on-brand": "#ffffff",
        // ── Web design tokens (Stitch prototypes) ─────────────────────
        primary: {
          DEFAULT: "#00288e",
          container: "#1e40af",
          fixed: "#dde1ff",
        },
        secondary: {
          DEFAULT: "#006c49",
          container: "#6cf8bb",
          fixed: "#6ffbbe",
        },
        tertiary: {
          DEFAULT: "#70000c",
          fixed: "#ffdad7",
        },
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "on-primary-container": "#001d6d",
        "on-secondary-container": "#002114",
        "on-surface": "#191c1e",
        "on-surface-variant": "#444653",
        outline: "#757684",
        "outline-variant": "#c4c6d6",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-variant": "#e4e5f5",
        scrim: "#000000",
      },
      fontFamily: {
        // per spec_ui.md: "fontes robustas como Inter, pesos Medium/Semi-bold"
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      minHeight: {
        screen: "100%",
      },
    },
  },
  plugins: [],
};
export default config;
