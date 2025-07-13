/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      screens: {
        xxs: '375px',
        xs: '480px', // Extra small devices (eg. phones, 350px and up)
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

