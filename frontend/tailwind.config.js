/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070b16',
          900: '#0b1220',
          800: '#111827',
        },
        brand: {
          blue: '#3b82f6',
          violet: '#7c3aed',
        },
      },
      boxShadow: {
        glass: '0 20px 50px rgba(2, 6, 23, 0.45)',
      },
    },
  },
  plugins: [],
}
