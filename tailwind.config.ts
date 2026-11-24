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
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#128C7E",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
