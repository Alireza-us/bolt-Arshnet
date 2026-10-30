/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14141A',
          600: '#3A3A42',
          500: '#6B6B76',
          400: '#8A8A93',
        },
        cream: {
          DEFAULT: '#F6F4EF',
          50: '#FBFAF8',
          100: '#F6F4EF',
          200: '#EFECE5',
        },
        surface: '#FFFFFF',
        hairline: '#E7E3DA',
        emerald: {
          DEFAULT: '#1F3D36',
          50: '#EDF2F0',
          100: '#D5DFDB',
          600: '#1F3D36',
          700: '#163029',
          800: '#0F2520',
        },
        champagne: {
          DEFAULT: '#C8A15A',
          50: '#F7F0E1',
          100: '#E8D9B8',
          400: '#C8A15A',
          600: '#A8842F',
        },
        accent: {
          DEFAULT: '#1F3D36',
          50: '#EDF2F0',
          100: '#D5DFDB',
          400: '#2A5249',
          500: '#1F3D36',
          600: '#1F3D36',
          700: '#163029',
        },
        navy: {
          950: '#F6F4EF',
          900: '#F6F4EF',
          800: '#FFFFFF',
          700: '#FBFAF8',
          600: '#EFECE5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(20, 20, 26, 0.08)',
        card: '0 2px 12px -4px rgba(20, 20, 26, 0.06)',
        glow: '0 6px 24px -8px rgba(31, 61, 54, 0.20)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
