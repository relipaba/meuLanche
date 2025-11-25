/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      maxHeight: {
        50: '12.5rem',
      },
      colors: {
        blueTop: '#4E7AD7',
        blueBottom: '#274A92',
        accent: '#F6B21A',
      },
      boxShadow: {
        panel: '0 4px 10px rgba(0,0,0,.12)',
      },
      borderRadius: {
        pill: '9999px',
      },
    },
  },
  plugins: [],
}

