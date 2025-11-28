/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2EAC8A",
        "primary-dark": "#0E7C5D",
        "background-light": "#f6f8f8",
        "background-dark": "#10221d",
        "border-light": "#e5e7eb",
        "border-dark": "#23483f",
        // Site accent renkleri - dark/light uyumlu
        "accent-teal": "#14B8A6",
        "accent-orange": "#FB923C",
        "accent-rose": "#F43F5E",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

