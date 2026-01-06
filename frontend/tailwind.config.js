/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aasko-blue': '#1e40af',
        'aasko-blue-light': '#3b82f6',
        'aasko-blue-dark': '#1e3a8a',
        'aasko-grey': '#6b7280',
        'aasko-grey-light': '#f3f4f6',
        'aasko-grey-dark': '#374151',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
