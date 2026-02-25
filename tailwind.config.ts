import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Marketdesk Design System ──────────────────────────────
        md: {
          // Backgrounds
          night:    '#070A12',
          surface:  '#0B1220',
          surface2: '#0F1A2B',
          surface3: '#101F36',
          // Text
          text:     '#E7EAF0',
          text2:    '#B6C2D1',
          muted:    '#9AA6B2',
          // Brand
          blue:     '#7AA7FF',
          blueHover:'#5F92FF',
          cyan:     '#59E6D6',
          // States
          bullish:  '#59E6D6',
          bearish:  '#FF5C7A',
          warn:     '#FFC24A',
          neutral:  '#CBD5E1',
        },
        // Legacy aliases (pour ne pas casser les composants existants)
        surface: {
          900: '#070A12',
          800: '#0B1220',
          700: '#0F1A2B',
          600: '#101F36',
        },
        accent: {
          cyan:    '#59E6D6',
          green:   '#59E6D6',
          red:     '#FF5C7A',
          amber:   '#FFC24A',
          purple:  '#7AA7FF',
          blue:    '#7AA7FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Marketdesk type scale (no text below 12px)
        'micro':   ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'label':   ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'body':    ['14px', { lineHeight: '1.6', fontWeight: '450' }],
        'body-lg': ['15px', { lineHeight: '1.6', fontWeight: '450' }],
        'card':    ['15px', { lineHeight: '1.4', fontWeight: '600' }],
        'h2':      ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'h1':      ['28px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        'card': '20px',
        'btn':  '10px',
        'chip': '8px',
      },
      boxShadow: {
        'card':    '0 0 0 1px rgba(148,163,184,0.12), 0 12px 28px rgba(0,0,0,0.35)',
        'card-hover': '0 0 0 1px rgba(148,163,184,0.18), 0 16px 32px rgba(0,0,0,0.40)',
        'focus':   '0 0 0 3px rgba(122,167,255,0.45)',
        // Legacy
        'glow-cyan':   '0 0 12px rgba(89,230,214,0.15)',
        'glow-green':  '0 0 12px rgba(89,230,214,0.15)',
        'glow-red':    '0 0 12px rgba(255,92,122,0.15)',
        'glow-amber':  '0 0 12px rgba(255,194,74,0.15)',
        'glow-purple': '0 0 12px rgba(122,167,255,0.15)',
      },
      animation: {
        'skeleton':  'skeleton-anim 1.5s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'fade-in':   'fade-in 0.15s ease-out',
      },
      keyframes: {
        'skeleton-anim': {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.4', transform: 'scale(0.75)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        DEFAULT: '150ms',
        'fast':  '150ms',
        'base':  '200ms',
      },
      spacing: {
        // Base-8 system
        '4.5': '18px',
        '18': '72px',
        '68': '272px',
      },
    },
  },
  plugins: [],
}

export default config
