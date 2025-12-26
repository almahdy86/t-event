/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#CE7B5B',
          secondary: '#9C7DDE',
          accent: '#3D2031',
          highlight: '#234024',
          gold: '#AB8025',
        },
        tanfeethi: {
          brown: 'rgb(var(--tanfeethi-brown-rgb) / <alpha-value>)',
          'brown-light': 'rgb(var(--tanfeethi-brown-light-rgb) / <alpha-value>)',
          'brown-dark': 'rgb(var(--tanfeethi-brown-dark-rgb) / <alpha-value>)',
          turquoise: 'rgb(var(--tanfeethi-turquoise-rgb) / <alpha-value>)',
          'turquoise-light': 'rgb(var(--tanfeethi-turquoise-light-rgb) / <alpha-value>)',
          cream: 'rgb(var(--tanfeethi-cream-rgb) / <alpha-value>)',
        },
      },
      fontFamily: {
        'aktiv': ['Aktiv Grotesk', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'sans': ['Aktiv Grotesk', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
