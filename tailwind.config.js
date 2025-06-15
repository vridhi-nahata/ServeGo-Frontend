/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      screens: {
        xs: '350px', // Extra small devices (eg. phones, 350px and up)
      },
      fontFamily: {
        nosifer: ['Nosifer', 'sans-serif'],
      },transformOrigin: {
        'center': 'center',
      },
    },
  },
  plugins: [],
}

