import {heroui} from '@heroui/theme';
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "custom-orange": "#F97316",
      },
      backgroundImage: {
        "pink-gradient": "linear-gradient(to bottom, #FEE2E2, #FFF)",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
