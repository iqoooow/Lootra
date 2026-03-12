import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — PUBG / dark gaming aesthetic
        brand: {
          50:  '#fff9e6',
          100: '#fff0b3',
          200: '#ffe680',
          300: '#ffda4d',
          400: '#ffcf1a',
          500: '#f5b800', // primary gold
          600: '#cc9900',
          700: '#a37a00',
          800: '#7a5c00',
          900: '#523d00',
        },
        dark: {
          50:  '#eaeaec',
          100: '#c0c0c5',
          200: '#96969e',
          300: '#6c6c77',
          400: '#424250',
          500: '#1a1a2e', // deep navy
          600: '#16162b',
          700: '#121228',
          800: '#0e0e20',
          900: '#090918', // near-black
          950: '#050510',
        },
        accent: {
          blue:   '#00d4ff',
          purple: '#8b5cf6',
          green:  '#22c55e',
          red:    '#ef4444',
          orange: '#f97316',
        },
        surface: {
          DEFAULT: '#1a1a2e',
          raised:  '#1e1e35',
          overlay: '#252540',
          border:  '#2a2a45',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        display: ['var(--font-rajdhani)', ...fontFamily.sans],
        mono: [...fontFamily.mono],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/hero-bg.webp')",
        'gold-gradient': 'linear-gradient(135deg, #f5b800 0%, #ff8c00 100%)',
        'dark-gradient': 'linear-gradient(180deg, #090918 0%, #1a1a2e 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(245, 184, 0, 0.4)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'counter': 'counter 1s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245,184,0,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(245,184,0,0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      screens: {
        xs: '375px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
};

export default config;
