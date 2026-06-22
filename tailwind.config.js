/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Azur Caribe Design System — luxury dark base
        ink: {
          DEFAULT: '#0A0A0B', // page background (near-black)
          900: '#0A0A0B',
          800: '#111113',
          700: '#16161A',
          600: '#1C1C21',
          500: '#26262D',
        },
        gold: {
          DEFAULT: '#C8A45D', // champagne gold accent
          light: '#E4C988',
          soft: '#D8BC83',
          deep: '#9C7C3C',
        },
        cream: '#F6F2EA',
        mist: '#A6A39C', // muted text
        faint: '#6E6C66',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.28em',
        wide2: '0.18em',
      },
      maxWidth: {
        container: '1320px',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translateY(0)' },
          '100%': { transform: 'scale(1.12) translateY(-1.5%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        kenburns: 'kenburns 18s ease-out infinite alternate',
        shimmer: 'shimmer 2.2s linear infinite',
        floaty: 'floaty 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
