import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Tokens resolve to CSS custom properties (RGB triplets) defined per theme
      // in app/globals.css, so every existing utility (bg-paper, text-ink, …)
      // switches with [data-theme] without any call site changing.
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        rule: "rgb(var(--color-rule) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        "accent-soft": "rgb(var(--color-accent-soft) / <alpha-value>)",
        // live data / present role — git "added" green
        live: "rgb(var(--color-live) / <alpha-value>)",
        "live-soft": "rgb(var(--color-live-soft) / <alpha-value>)",
        // manual data / confidential — amber, deliberately warm against the blue
        manual: "rgb(var(--color-manual) / <alpha-value>)",
        "manual-soft": "rgb(var(--color-manual-soft) / <alpha-value>)",
        // project category accents
        teal: "rgb(var(--color-teal) / <alpha-value>)",
        "teal-soft": "rgb(var(--color-teal-soft) / <alpha-value>)",
        violet: "rgb(var(--color-violet) / <alpha-value>)",
        "violet-soft": "rgb(var(--color-violet-soft) / <alpha-value>)",
        // the gutter — a structural dark sidebar, not a page-wide theme
        gutter: "rgb(var(--color-gutter) / <alpha-value>)",
        "gutter-line": "rgb(var(--color-gutter-line) / <alpha-value>)",
        "gutter-muted": "rgb(var(--color-gutter-muted) / <alpha-value>)",
        "gutter-accent": "rgb(var(--color-gutter-accent) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
