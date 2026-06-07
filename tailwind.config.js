/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#e87c2d',
        surface: {
          DEFAULT: '#1a1a1a',
          2: '#222222',
          3: '#2a2a2a',
        },
      },
    },
  },
  plugins: [],
}
