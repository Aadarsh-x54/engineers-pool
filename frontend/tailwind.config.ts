import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1180px"
      }
    },
    extend: {
      colors: {
        background: "#000000",
        foreground: "#f8fafc",
        muted: "#a1a1aa",
        border: "rgba(255,255,255,0.10)",
        panel: "rgba(18,18,18,0.74)",
        surface: "rgba(255,255,255,0.06)",
        google: {
          blue: "#8ab4f8",
          red: "#f28b82",
          yellow: "#fdd663",
          green: "#81c995"
        }
      },
      boxShadow: {
        soft: "0 16px 50px rgba(0,0,0,0.35)",
        card: "0 10px 30px rgba(0,0,0,0.28)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
