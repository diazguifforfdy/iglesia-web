import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0b1e3b'
        },
        gold: {
          DEFAULT: '#d4af37'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(1000px circle at 50% -20%, rgba(212, 175, 55, 0.12), transparent 40%)',
        'hero': 'linear-gradient(180deg, rgba(11,30,59,0.95) 0%, rgba(11,30,59,0.75) 40%, rgba(11,30,59,0.6) 100%)'
      }
    }
  },
  plugins: []
} satisfies Config
