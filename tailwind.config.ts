import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Using CSS variables for theme support
        background: {
          DEFAULT: "var(--background)",
          secondary: "var(--background-secondary)",
          card: "var(--background-card)",
          hover: "var(--background-hover)",
        },
        primary: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          light: "#60a5fa",
          dark: "#1d4ed8",
        },
        accent: {
          purple: "#8b5cf6",
          pink: "#ec4899",
          cyan: "#06b6d4",
          green: "#10b981",
          orange: "#f97316",
          red: "#ef4444",
        },
        border: {
          DEFAULT: "var(--border)",
          light: "var(--border-light)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glow-blue": "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
        "glow-purple": "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(59, 130, 246, 0.4)",
        "glow-purple": "0 0 20px rgba(139, 92, 246, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
