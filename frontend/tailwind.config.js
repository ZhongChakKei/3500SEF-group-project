/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9defd',
          300: '#7cc4fb',
          400: '#36a7f7',
          500: '#0d8de9',
          600: '#0070c7',
          700: '#00599f',
          800: '#004b84',
          900: '#003f6d'
        }
      }
    },
  },
  plugins: [],
};
