import type { Config } from "tailwindcss";

const config: Config = {
  // Removed "darkMode: class" - This locks the site to Light Mode
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          cream: "#F9F8F4",      // Main Background
          latte: "#E6DCCF",      // Secondary Background
          gold: "#C6A87C",       // Primary Accent
          brown: "#5D4037",      // Text / Dark Accent (replacing black)
          tan: "#D4C5B0",        // Soft border color
        },
      },
      animation: {
        'luxury-flow': 'luxury 15s ease infinite',
      },
      keyframes: {
        luxury: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
export default config;