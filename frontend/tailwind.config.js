/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#07080E',
          secondary: '#0D0F1A',
          tertiary: '#141728',
          card: 'rgba(16, 20, 36, 0.7)',
          hover: 'rgba(28, 33, 58, 0.6)',
        },
        primary: {
          DEFAULT: '#6366F1', // Indigo
          hover: '#4F46E5',
          light: '#818CF8',
          glow: 'rgba(99, 102, 241, 0.35)',
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Purple/Violet
          hover: '#7C3AED',
          light: '#A78BFA',
          glow: 'rgba(139, 92, 246, 0.35)',
        },
        accent: {
          cyan: '#06B6D4',
          sky: '#38BDF8',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B',
        },
        surface: {
          border: 'rgba(255, 255, 255, 0.08)',
          'border-focus': 'rgba(99, 102, 241, 0.5)',
          glass: 'rgba(15, 20, 36, 0.65)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(99, 102, 241, 0.45)',
        'glow-secondary': '0 0 25px -5px rgba(139, 92, 246, 0.45)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
