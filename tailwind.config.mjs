/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        // VECTICUM Brand Colors
        primary: {
          DEFAULT: "#2d3748",
          50: "#f8fafc",
          100: "#f1f5f9",
          500: "#2d3748",
          600: "#1a202c",
          900: "#171923",
        },
        secondary: {
          DEFAULT: "#3C7099",
          50: "#f0f6fb",
          100: "#e1edf7",
          500: "#3C7099",
          600: "#2d5577",
          900: "#1e3a55",
        },
        accent: {
          DEFAULT: "#C81E6A",
          50: "#fdf2f7",
          100: "#fce7f0",
          500: "#C81E6A",
          600: "#a01652",
          900: "#78103e",
        },
        // Semantic Colors
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        // UI Colors
        muted: {
          DEFAULT: "#6b7280",
          foreground: "#374151",
        },
        border: "#e5e7eb",
        ring: "#3b82f6",
      },
      fontFamily: {
        heading: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "h1": ["3rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "h2": ["2rem", { lineHeight: "1.3" }],
        "h3": ["1.5rem", { lineHeight: "1.4" }],
      },
      borderRadius: {
        "card": "12px",
        "button": "8px",
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "button": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "button-hover": "0 2px 4px 0 rgb(0 0 0 / 0.1)",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
