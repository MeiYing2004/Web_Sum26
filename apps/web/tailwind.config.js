/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#0066ff',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#0066ff',
          700: '#0052cc',
          800: '#003d99',
          900: '#002966',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#ff6b35',
          light: '#fff0eb',
          dark: '#e85a28',
        },
        ink: {
          DEFAULT: '#0a1628',
          muted: '#5c6b7f',
          subtle: '#8b9cb3',
        },
        surface: {
          DEFAULT: '#f6f8fb',
          raised: '#ffffff',
          sunken: '#eef2f7',
          hero: '#0a1628',
        },
        success: {
          DEFAULT: '#059669',
          light: '#d1fae5',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
        },
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        card: '1rem',
        panel: '1.25rem',
        ticket: '1.75rem',
        pill: '9999px',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,22,40,0.04), 0 4px 16px rgba(10,22,40,0.06)',
        elevated:
          '0 2px 8px rgba(10,22,40,0.04), 0 12px 32px rgba(0,102,255,0.08), 0 24px 48px rgba(10,22,40,0.06)',
        overlay:
          '0 8px 24px rgba(10,22,40,0.1), 0 32px 64px rgba(0,102,255,0.12)',
        nav: '0 4px 20px rgba(10,22,40,0.08), 0 1px 3px rgba(10,22,40,0.04)',
        glass: '0 8px 32px rgba(0,102,255,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
        search:
          '0 4px 6px rgba(10,22,40,0.02), 0 20px 50px rgba(0,102,255,0.12), 0 0 0 1px rgba(255,255,255,0.8)',
        'inner-soft': 'inset 0 2px 4px rgba(10,22,40,0.04)',
      },
      fontSize: {
        display: [
          'clamp(2rem, 5vw, 3rem)',
          { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '700' },
        ],
        title: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em', fontWeight: '600' }],
        subtitle: ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        body: ['0.9375rem', { lineHeight: '1.5rem' }],
        caption: ['0.8125rem', { lineHeight: '1.25rem' }],
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(0,82,204,0.75) 50%, rgba(10,22,40,0.88) 100%)',
        'mesh-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0,102,255,0.15), transparent), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(255,107,53,0.08), transparent)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
