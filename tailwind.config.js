/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      screens: {
        xs: '350px', // Extra small devices (phones, 350px and up)
      },
    },
  },
  plugins: [],
}

