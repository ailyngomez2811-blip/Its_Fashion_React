/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          dark: '#0f172a',
          light: '#f8fafc',
          accent: '#2563eb',
          muted: '#64748b'
        }
      }
    },
  },
  plugins: [],
}
