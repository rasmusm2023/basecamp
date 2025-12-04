/**
 * Color System Documentation
 * 
 * This file documents the color system used throughout the application.
 * All colors are defined as CSS custom properties in app/globals.css
 * and can be accessed via Tailwind classes or CSS variables.
 * 
 * Usage in Tailwind:
 * - bg-bg-primary, bg-bg-secondary, bg-bg-dark
 * - text-text-primary, text-text-secondary, text-text-tertiary
 * - border-border-default, border-border-focus, border-border-error
 * - bg-accent-primary, bg-accent-hover, bg-accent-selected
 * - bg-gradient-start, bg-gradient-mid, bg-gradient-end
 * - bg-error-bg, text-error-text
 * 
 * Usage in CSS:
 * - var(--color-bg-primary)
 * - var(--color-text-primary)
 * - etc.
 * 
 * Colors automatically switch between light and dark modes based on
 * the .dark class on the html element.
 */

export const colorTokens = {
  // Background Colors
  bg: {
    primary: "var(--color-bg-primary)",
    secondary: "var(--color-bg-secondary)",
    dark: "var(--color-bg-dark)",
  },
  // Text Colors
  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
    tertiary: "var(--color-text-tertiary)",
    placeholder: "var(--color-text-placeholder)",
    inverse: "var(--color-text-inverse)",
    light: "var(--color-text-light)",
  },
  // Border Colors
  border: {
    default: "var(--color-border-default)",
    focus: "var(--color-border-focus)",
    error: "var(--color-border-error)",
  },
  // Input Colors
  input: {
    bgStart: "var(--color-input-bg-start)",
    bgEnd: "var(--color-input-bg-end)",
  },
  // Accent Colors
  accent: {
    primary: "var(--color-accent-primary)",
    hover: "var(--color-accent-hover)",
    selected: "var(--color-accent-selected)",
    border: "var(--color-accent-border)",
  },
  // Gradient Colors
  gradient: {
    start: "var(--color-gradient-start)",
    mid: "var(--color-gradient-mid)",
    end: "var(--color-gradient-end)",
  },
  // Error Colors
  error: {
    bg: "var(--color-error-bg)",
    text: "var(--color-error-text)",
  },
} as const;

