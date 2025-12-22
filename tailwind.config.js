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
          brown: '#8B6F47',
          'brown-light': '#B8956A',
          'brown-dark': '#6B5539',
          turquoise: '#40E0D0',
          'turquoise-light': '#7FFFD4',
          cream: '#F5F1E8',
        },
      },
      fontFamily: {
        'dubai': ['Dubai', 'sans-serif'],
        'arabic': ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
