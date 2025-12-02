import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic background colors
        bg: {
          primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          card: 'rgb(var(--color-bg-card) / <alpha-value>)',
          input: 'rgb(var(--color-bg-input) / <alpha-value>)',
          hover: 'rgb(var(--color-bg-hover) / <alpha-value>)',
        },
        // Semantic text colors
        content: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          placeholder: 'rgb(var(--color-text-placeholder) / <alpha-value>)',
        },
        // Border colors
        line: {
          DEFAULT: 'rgb(var(--color-border-default) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
        },
        // Accent color
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          hover: 'rgb(var(--color-accent-hover) / <alpha-value>)',
        },
        // Energy class colors
        energy: {
          a: 'rgb(var(--energy-a) / <alpha-value>)',
          b: 'rgb(var(--energy-b) / <alpha-value>)',
          c: 'rgb(var(--energy-c) / <alpha-value>)',
          d: 'rgb(var(--energy-d) / <alpha-value>)',
          e: 'rgb(var(--energy-e) / <alpha-value>)',
          f: 'rgb(var(--energy-f) / <alpha-value>)',
          g: 'rgb(var(--energy-g) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
