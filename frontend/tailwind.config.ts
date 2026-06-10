import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E0F11",
        "ink-2": "#1C1D20",
        blue: {
          DEFAULT: "#0066FF",
          dim: "#E8F0FF",
          dark: "#003DB5",
        },
        surface: "#F5F5F7",
        border: "#E2E2E6",
        muted: "#6B6E7A",
        text: "#0E0F11",
        white: "#FFFFFF",
      },
      fontFamily: {
        display: ["var(--font-bebas-neue)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "3px",
        none: "0px",
        sm: "3px",
        md: "3px",
        lg: "3px",
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
      },
      borderWidth: {
        DEFAULT: "0.5px",
        "0": "0px",
        "1": "1px",
        "2": "2px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
