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
        // Semantic colors (spec_ui.md)
        trust: "#1E40AF",      // Azul Escuro — segurança, CTAs primários
        error: "#EF4444",      // Vermelho Soft — erros e alertas
        savings: "#10B981",    // Verde Brando — economia, boas práticas
        // Brand colors (Stitch prototypes)
        brand: "#ec5b13",      // Laranja — identidade visual, header chat
        "brand-light": "#fff4ed", // Laranja claro — backgrounds
        // Neutral
        surface: "#f8f6f6",    // Fundo neutro claro
        "on-trust": "#ffffff",
        "on-brand": "#ffffff",
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
