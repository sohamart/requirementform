/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6b00', // Primary Vibrant Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          accent: '#ff6b00',
        },
        charcoal: {
          950: '#09090b', // Deepest background
          900: '#121216', // Primary dark background
          850: '#18181e', // Card background dark
          800: '#22222a', // Card hover / elevated
          750: '#2c2c36', // Border dark
          700: '#3f3f4c', // Muted text dark
          600: '#5c5c6f',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(255, 107, 0, 0.3)',
        'glow-sm': '0 0 15px -3px rgba(255, 107, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
