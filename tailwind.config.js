/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}", // This covers files in the root too
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

