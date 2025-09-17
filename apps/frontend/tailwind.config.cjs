/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1D3557',
        teal: '#1CA2A1',
        gold: '#F4A261',
      },
    },
  },
  plugins: [],
};
