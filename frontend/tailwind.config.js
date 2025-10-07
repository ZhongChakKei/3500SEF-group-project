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
        },
        surface: {
          50: '#0b1522',
          100: '#0f1e2f',
          200: '#132a41',
          300: '#16324c',
          400: '#1d3f5e',
          500: '#21496b',
          600: '#27587f',
          700: '#2e6b99',
          800: '#347cad',
          900: '#3c90c6'
        }
      }
    },
  },
  plugins: [],
};
