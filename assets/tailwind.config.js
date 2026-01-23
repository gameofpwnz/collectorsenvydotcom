/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        // We define your museum's specific colors here
        'museum-gold': '#c5a059',
        'museum-blue': '#3b82f6',
      }
    },
  },
  plugins: [],
}
