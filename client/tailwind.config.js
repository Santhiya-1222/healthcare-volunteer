/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        "soft-sm": "0 2px 8px 0 rgba(0,0,0,0.06)",
        "soft":    "0 4px 16px 0 rgba(0,0,0,0.08)",
        "soft-lg": "0 8px 32px 0 rgba(0,0,0,0.10)",
        "soft-xl": "0 16px 48px 0 rgba(0,0,0,0.12)",
        "glow":    "0 0 24px rgba(8,145,178,0.25)",
        "glow-lg": "0 0 48px rgba(8,145,178,0.30)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #083344 0%, #155e75 35%, #0e7490 65%, #0891b2 100%)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-up":    "fadeUp 0.6s ease-out both",
        "fade-in":    "fadeIn 0.5s ease-out both",
        "slide-down": "slideDown 0.3s ease-out both",
        "float":      "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-14px)" },
        },
      },
    },
  },
  plugins: [],
};
