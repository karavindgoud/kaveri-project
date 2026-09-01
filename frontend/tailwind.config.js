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
        gold: {
          50: '#fdfbf7',
          100: '#f9f4ea',
          200: '#f1e6cd',
          300: '#e5d1a4',
          400: '#d7b774',
          500: '#c9a84c',
          600: '#b48e3a',
          700: '#946f2e',
          800: '#79582b',
          900: '#644726',
        },
        obsidian: {
          950: '#070709',
          900: '#0c0d12',
          850: '#111218',
          800: '#161720',
          700: '#1e202c',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #c9a84c 0%, #f3e5ab 50%, #c9a84c 100%)',
        'gold-gradient-subtle': 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(243,229,171,0.05) 100%)',
        'dark-glass': 'linear-gradient(135deg, rgba(20,21,28,0.75) 0%, rgba(10,11,15,0.85) 100%)',
      }
    },
  },
  plugins: [],
}
