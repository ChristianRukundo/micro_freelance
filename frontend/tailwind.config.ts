import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        xs: "420px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
        "3xl": "1600px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          "50": "hsl(var(--primary-50))",
          "100": "hsl(var(--primary-100))",
          "200": "hsl(var(--primary-200))",
          "300": "hsl(var(--primary-300))",
          "400": "hsl(var(--primary-400))",
          "500": "hsl(var(--primary-500))",
          "600": "hsl(var(--primary-600))",
          "700": "hsl(var(--primary-700))",
          "800": "hsl(var(--primary-800))",
          "900": "hsl(var(--primary-900))",
          "950": "hsl(var(--primary-950))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          "50": "hsl(var(--success-50))",
          "500": "hsl(var(--success-500))",
          "600": "hsl(var(--success-600))",
        },
        warning: {
          "50": "hsl(var(--warning-50))",
          "500": "hsl(var(--warning-500))",
          "600": "hsl(var(--warning-600))",
        },
        error: {
          "50": "hsl(var(--error-50))",
          "500": "hsl(var(--error-500))",
          "600": "hsl(var(--error-600))",
        },
        neutral: {
          "50": "hsl(var(--neutral-50))",
          "100": "hsl(var(--neutral-100))",
          "200": "hsl(var(--neutral-200))",
          "300": "hsl(var(--neutral-300))",
          "400": "hsl(var(--neutral-400))",
          "500": "hsl(var(--neutral-500))",
          "600": "hsl(var(--neutral-600))",
          "700": "hsl(var(--neutral-700))",
          "800": "hsl(var(--neutral-800))",
          "900": "hsl(var(--neutral-900))",
          "950": "hsl(var(--neutral-950))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "display-lg": ["4rem", { lineHeight: "1.2", fontWeight: "800" }],
        "display-md": ["3rem", { lineHeight: "1.25", fontWeight: "800" }],
        "display-sm": ["2.25rem", { lineHeight: "1.25", fontWeight: "800" }],
        h1: ["2rem", { lineHeight: "1.3", fontWeight: "700" }],
        h2: ["1.75rem", { lineHeight: "1.35", fontWeight: "700" }],
        h3: ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        h4: ["1.25rem", { lineHeight: "1.4", fontWeight: "600" }],
        h5: ["1.125rem", { lineHeight: "1.5", fontWeight: "600" }],
        h6: ["1rem", { lineHeight: "1.5", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      boxShadow: {
        // --- Light Mode Shadows ---
        soft: "0 4px 10px rgba(0, 0, 0, 0.05)",
        medium: "0 8px 20px rgba(0, 0, 0, 0.08)",
        hard: "0 12px 30px rgba(0, 0, 0, 0.12)",
        primary: "0 5px 15px hsl(var(--primary-500) / 0.2)",
        "card-hover":
          "0 10px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px hsl(var(--primary-500) / 0.2)",

        // --- NEW: Dark Mode Shadows ---
        // These are subtle and use a very dark blue for a hint of color.
        "soft-dark": "0 4px 10px rgba(0, 0, 0, 0.2)",
        "medium-dark": "0 8px 24px rgba(0, 0, 0, 0.3)",
        "hard-dark": "0 12px 32px rgba(0, 0, 0, 0.4)",
        "primary-dark": "0 5px 20px hsl(var(--primary-400) / 0.2)",
        "card-hover-dark":
          "0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px hsl(var(--primary-400) / 0.3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
