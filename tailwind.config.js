/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#fcf9f1',
        primary: '#001736',
        secondary: '#904d00',
        'secondary-container': '#fe932c',
        surface: '#fcf9f1',
        'surface-container': '#f1eee6',
        'surface-low': '#f6f3eb',
        'surface-high': '#ebe8e0',
        'surface-highest': '#e5e2da',
        'on-surface': '#1c1c17',
        'on-surface-variant': '#43474f',
        outline: '#747780',
        'outline-variant': '#c4c6d0',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        headline: ['Newsreader', 'serif'],
        body: ['Newsreader', 'serif'],
        label: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
