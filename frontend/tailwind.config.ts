import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e0f3fb',
          100: '#b3e0f6',
          200: '#80ccf0',
          300: '#4db8ea',
          400: '#26a8e6',
          500: '#0098e2',
          600: '#0077B6',
          700: '#005f96',
          800: '#004976',
          900: '#003256',
        },
        teal: { 400: '#00B4D8', 300: '#48CAE4', 200: '#90E0EF', 100: '#ADE8F4', 50: '#CAF0F8' },
        surface: { DEFAULT: '#F0F4F8', card: '#FFFFFF', border: '#E2E8F0' },
        ink: { DEFAULT: '#1A1A2E', muted: '#4A5568', subtle: '#718096' },
        danger: { DEFAULT: '#E63946', light: '#FFE4E6' },
        success: { DEFAULT: '#1B4332', light: '#D8F3DC', mid: '#2D6A4F' },
        warning: { DEFAULT: '#F4A261', light: '#FFF3E0', dark: '#7C4F00' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-right': 'slideRight 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'count-up': 'countUp 1s ease forwards',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideRight: { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,119,182,0.08)',
        'card-hover': '0 8px 32px rgba(0,119,182,0.16)',
        glow: '0 0 0 3px rgba(0,119,182,0.2)',
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem', '3xl': '1.5rem' },
    },
  },
  plugins: [],
}
export default config
