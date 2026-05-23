import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FFF0F5',
          100: '#FFD6E7',
          200: '#FFB3CF',
          400: '#F472A8',
          600: '#D4537E',
          800: '#993556',
        },
        peach: {
          50: '#FFF7F0',
          100: '#FFE8D0',
          400: '#F5A86A',
          600: '#E07B3A',
        },
        sage: {
          50: '#F0FAF5',
          400: '#5DCAA5',
          600: '#3B9E7E',
        },
        'warm-gray': {
          50: '#FFFDF9',
          100: '#FBF8F3',
          200: '#F0EDE8',
          400: '#9B9590',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-rose': 'linear-gradient(135deg, #FFF0F5 0%, #FFF7F0 100%)',
      },
    },
  },
}

export default config
