import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#ccccef",
          200: "#9999e0",
          300: "#6766d0",
          400: "#3433c1",
          500: "#0100b1",
          600: "#01008e",
          700: "#01006a",
          800: "#000047",
          900: "#000023",
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#3433c1",

          secondary: "#6766d0",

          accent: "#f97316",

          neutral: "#1e293b",

          "base-100": "#dbeafe",

          info: "#42ADBB",

          success: "#22BB33",

          warning: "#E97F14",

          error: "#DF1A2F",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
} satisfies Config;
