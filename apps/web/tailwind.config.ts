import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFF8E7",
        surface: "#FFFFFF",
        primary: "#FFD43B",
        secondary: "#6750E8",
        outline: "#1A1A2E",
        cat: {
          corps: "#FF3B30",
          esprit: "#1E88E5",
          social: "#FF6FA5",
          altruisme: "#3DAE3D",
          productivite: "#FF8C00",
          creation: "#8E44AD",
          detox: "#FFD43B",
        },
      },
      fontFamily: {
        heading: ["var(--font-lilita)"],
        body: ["var(--font-fredoka)"],
        mono: ["var(--font-dm-mono)"],
      },
      borderRadius: {
        sticker: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
