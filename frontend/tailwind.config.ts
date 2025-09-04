import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}', // Added for broader coverage
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      // Custom container sizes from style guide
      screens: {
        xs: '420px', // Custom extra-small
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px', // Custom larger desktop
        '3xl': '1600px', // Custom extra-large desktop
      },
    },
    extend: {
      // Custom color palette
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          '50': 'hsl(var(--primary-50))',
          '100': 'hsl(var(--primary-100))',
          '200': 'hsl(var(--primary-200))',
          '300': 'hsl(var(--primary-300))',
          '400': 'hsl(var(--primary-400))',
          '500': 'hsl(var(--primary-500))', // Brand primary, e.g., Green-400
          '600': 'hsl(var(--primary-600))',
          '700': 'hsl(var(--primary-700))',
          '800': 'hsl(var(--primary-800))',
          '900': 'hsl(var(--primary-900))',
          '950': 'hsl(var(--primary-950))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          '50': 'hsl(var(--secondary-50))', // Neutral secondary
          '100': 'hsl(var(--secondary-100))',
          '200': 'hsl(var(--secondary-200))',
          '300': 'hsl(var(--secondary-300))',
          '400': 'hsl(var(--secondary-400))',
          '500': 'hsl(var(--secondary-500))',
          '600': 'hsl(var(--secondary-600))',
          '700': 'hsl(var(--secondary-700))',
          '800': 'hsl(var(--secondary-800))',
          '900': 'hsl(var(--secondary-900))',
          '950': 'hsl(var(--secondary-950))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          '500': 'hsl(var(--error-500))', // Error/Destructive
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom system colors
        success: {
          '500': 'hsl(var(--success-500))', // Green-500
          '600': 'hsl(var(--success-600))',
        },
        warning: {
          '500': 'hsl(var(--warning-500))', // Yellow-500
          '600': 'hsl(var(--warning-600))',
        },
        error: {
          '500': 'hsl(var(--error-500))', // Red-500
          '600': 'hsl(var(--error-600))',
        },
        // Neutral palette
        neutral: {
          '50': 'hsl(var(--neutral-50))',
          '100': 'hsl(var(--neutral-100))',
          '200': 'hsl(var(--neutral-200))',
          '300': 'hsl(var(--neutral-300))',
          '400': 'hsl(var(--neutral-400))',
          '500': 'hsl(var(--neutral-500))', // Default text/icon
          '600': 'hsl(var(--neutral-600))',
          '700': 'hsl(var(--neutral-700))',
          '800': 'hsl(var(--neutral-800))',
          '900': 'hsl(var(--neutral-900))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Custom rounded values (from style guide example)
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'full-circle': '9999px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-inter)', ...defaultTheme.fontFamily.sans], // For display headings
      },
      fontSize: {
        // Typography scale (from style guide)
        'display-lg': ['4rem', { lineHeight: '1.2', fontWeight: '800' }], // Extra-bold
        'display-md': ['3rem', { lineHeight: '1.25', fontWeight: '800' }],
        'display-sm': ['2.25rem', { lineHeight: '1.25', fontWeight: '800' }],
        'h1': ['2rem', { lineHeight: '1.3', fontWeight: '700' }], // Bold
        'h2': ['1.75rem', { lineHeight: '1.35', fontWeight: '700' }],
        'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }], // Semi-bold
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h5': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
        'h6': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }], // Regular
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      boxShadow: {
        // Custom shadows for modern look
        'soft': '0 4px 10px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 20px rgba(0, 0, 0, 0.08)',
        'hard': '0 12px 30px rgba(0, 0, 0, 0.12)',
        'primary': '0 5px 15px rgba(var(--primary-500-rgb), 0.2)', // For elements emphasizing primary action
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(var(--primary-500-rgb), 0.1)',
      },
      spacing: {
        // 8px spacing scale
        '0': '0px',
        'px': '1px',
        '0.5': '0.125rem', // 2px
        '1': '0.25rem', // 4px
        '1.5': '0.375rem', // 6px
        '2': '0.5rem', // 8px
        '2.5': '0.625rem', // 10px
        '3': '0.75rem', // 12px
        '3.5': '0.875rem', // 14px
        '4': '1rem', // 16px
        '5': '1.25rem', // 20px
        '6': '1.5rem', // 24px
        '7': '1.75rem', // 28px
        '8': '2rem', // 32px
        '9': '2.25rem', // 36px
        '10': '2.5rem', // 40px
        '11': '2.75rem', // 44px
        '12': '3rem', // 48px
        '14': '3.5rem', // 56px
        '16': '4rem', // 64px
        '20': '5rem', // 80px
        '24': '6rem', // 96px
        '28': '7rem', // 112px
        '32': '8rem', // 128px
        '36': '9rem', // 144px
        '40': '10rem', // 160px
        '44': '11rem', // 176px
        '48': '12rem', // 192px
        '52': '13rem', // 208px
        '56': '14rem', // 224px
        '60': '15rem', // 240px
        '64': '16rem', // 256px
        '72': '18rem', // 288px
        '80': '20rem', // 320px
        '96': '24rem', // 384px
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'shimmer': { // For skeleton loaders
          '100%': {
            transform: 'translateX(100%)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.3s ease-out forwards',
        'slide-out-left': 'slide-out-left 0.3s ease-out forwards',
        'shimmer': 'shimmer 1.5s infinite',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'opacity': 'opacity',
        'transform': 'transform',
        'colors': 'background-color, border-color, color, fill, stroke',
        // Custom transitions for micro-interactions
        'background': 'background-color',
        'shadow': 'box-shadow',
      },
      transitionDuration: {
        'DEFAULT': '300ms',
        '200': '200ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-in-out-quad': 'cubic-bezier(0.45, 0.03, 0.53, 0.96)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;