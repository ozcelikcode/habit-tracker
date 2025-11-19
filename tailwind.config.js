import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2EAC8A',
        accent: '#13ECB6',
        'background-dark': '#051612',
        'card-dark': '#10221d',
        'card-deeper': '#0b1c18',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        panel: '0 20px 40px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [forms],
};
