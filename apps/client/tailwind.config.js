/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F766E',
        accent: '#F97316',
        slate: {
          900: '#0f172a'
        }
      }
    }
  },
  plugins: []
};
