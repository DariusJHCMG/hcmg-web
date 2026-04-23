import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF7800",
          light: "#FFAF00",
          dark: "#E84F00",
          soft: "#FFF3E6",
        },
        ink: "#1A2B42",
        sand: "#F8FAFC",
        line: "#E2E8F0",
        muted: "#64748B",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15,23,42,0.08)",
        card: "0 20px 60px rgba(15,23,42,0.10)",
        orange: "0 8px 32px rgba(255,120,0,0.25)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        "ok-gradient": "linear-gradient(135deg, #FFAF00 0%, #FF7800 45%, #E84F00 100%)",
        "ok-gradient-soft": "linear-gradient(135deg, rgba(255,175,0,0.12) 0%, rgba(255,120,0,0.08) 100%)",
        "hero-glow": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,120,0,0.15) 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
