import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          dark: "var(--color-bg-dark)",
        },
        // Text colors
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          placeholder: "var(--color-text-placeholder)",
          inverse: "var(--color-text-inverse)",
          light: "var(--color-text-light)",
        },
        // Border colors
        border: {
          default: "var(--color-border-default)",
          focus: "var(--color-border-focus)",
          error: "var(--color-border-error)",
        },
        // Input colors
        input: {
          "bg-start": "var(--color-input-bg-start)",
          "bg-end": "var(--color-input-bg-end)",
        },
        // Accent colors
        accent: {
          primary: "var(--color-accent-primary)",
          hover: "var(--color-accent-hover)",
          selected: "var(--color-accent-selected)",
          border: "var(--color-accent-border)",
        },
        // Gradient colors
        gradient: {
          start: "var(--color-gradient-start)",
          mid: "var(--color-gradient-mid)",
          end: "var(--color-gradient-end)",
        },
        // Error colors
        error: {
          bg: "var(--color-error-bg)",
          text: "var(--color-error-text)",
        },
        // Selected button colors
        selected: {
          "bg-start": "var(--color-selected-bg-start)",
          "bg-end": "var(--color-selected-bg-end)",
          border: "var(--color-selected-border)",
          text: "var(--color-selected-text)",
        },
        // Unselected button colors
        unselected: {
          bg: "var(--color-unselected-bg)",
          border: "var(--color-unselected-border)",
          text: "var(--color-unselected-text)",
        },
      },
    },
  },
};
export default config;

