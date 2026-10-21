/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#1C2541',
          900: '#0B132B',
          950: '#050A18',
        },
        ai: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          violet: '#8B5CF6',
        },
        surface: {
          light: '#F8FAFC',
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'ai-glow': '0 0 15px -3px rgba(99, 102, 241, 0.25), 0 4px 6px -4px rgba(99, 102, 241, 0.2)',
        'glow-lg': '0 0 40px -8px rgba(99, 102, 241, 0.45)',
      },
      borderRadius: {
        'saas': '0.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-up-delay-1': 'fade-up 0.6s 0.15s ease-out both',
        'fade-up-delay-2': 'fade-up 0.6s 0.3s ease-out both',
        'fade-up-delay-3': 'fade-up 0.6s 0.45s ease-out both',
        'fade-up-delay-4': 'fade-up 0.6s 0.6s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'slide-down': 'slide-down 0.25s ease-out forwards',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
