/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        brand: {
          black: '#1A1A1A',
          cream: '#FAF9F6',
          pink: '#FFD6E8',
          lavender: '#E0BBE4',
          yellow: '#FEF9E7',
          mint: '#D1F2EB',
        },
      },
      fontFamily: {
        heading: ['Archivo Black', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      boxShadow: {
        'editorial': '4px 4px 0px #1A1A1A',
        'editorial-lg': '5px 5px 0px #1A1A1A',
      },
    },
  },
  plugins: [],
}
