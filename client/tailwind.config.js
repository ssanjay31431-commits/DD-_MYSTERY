/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          midnight: '#060B1F',
          indigo: '#14103A',
          plum: '#2A0F2E',
          violet: '#7C5CFF',
          cyan: '#3DD9FF',
          magenta: '#FF4FA3',
          gold: '#FFB84D'
        },
        brand: {
          dark: '#0f0c1b',
          card: '#18132a',
          cardHover: '#231b3c',
          border: '#2e254d',
          pink: '#ec4899',
          purple: '#8b5cf6',
          violet: '#7c3aed',
          gold: '#f59e0b',
          amber: '#fbbf24',
          cyan: '#06b6d4',
          neon: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        accent: ['"Instrument Serif"', 'Georgia', 'serif']
      },
      borderRadius: {
        'glass-lg': '28px',
        'glass-md': '18px'
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%': { boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)' },
          '100%': { boxShadow: '0 0 30px rgba(236, 72, 153, 0.7)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
