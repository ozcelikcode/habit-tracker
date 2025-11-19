import forms from '@tailwindcss/forms';

const withOpacityValue = (variable) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variable}) / ${opacityValue})`;
    }
    return `rgb(var(${variable}) / 1)`;
  };
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: withOpacityValue('--color-primary'),
        accent: withOpacityValue('--color-accent'),
        background: withOpacityValue('--color-bg'),
        'background-alt': withOpacityValue('--color-bg-alt'),
        card: withOpacityValue('--color-card'),
        'card-deep': withOpacityValue('--color-card-deep'),
        border: withOpacityValue('--color-border'),
        foreground: withOpacityValue('--color-foreground'),
        muted: withOpacityValue('--color-muted'),
        'on-primary': withOpacityValue('--color-on-primary'),
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
        panel: '0 20px 40px rgba(0, 0, 0, 0.32)',
      },
    },
  },
  plugins: [forms],
};
