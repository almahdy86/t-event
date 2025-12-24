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
        'dubai': ['Dubai', 'sans-serif'],
        'arabic': ['Cairo', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
