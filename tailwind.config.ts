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
      colors: {
        dark: {
          950: "#09090B",
          900: "#0F0F12",
          850: "#141418",
          800: "#1A1A22",
          700: "#272732",
          600: "#3F3F50",
        },
        gold: {
          300: "#F3E5AB",
          400: "#E6CA65",
          500: "#D4AF37",
          600: "#AA8C2C",
          700: "#8B6508",
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#128C7E",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.4s ease both",
        fadeIn: "fadeIn 0.3s ease both",
        slideInRight: "slideInRight 0.35s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
