/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slack: {
          purple: '#4A154B',
          darkBg: '#1A1D21',
          darkSidebar: '#19171D',
          darkCard: '#222529',
          darkBorder: '#383B40',
          accent: '#611f69',
          blue: '#1264a3'
        }
      }
    },
  },
  plugins: [],
}
