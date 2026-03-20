/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      padding: {
        'nav': 'calc(60px + env(safe-area-inset-bottom, 0px))',
      },
      minHeight: {
        'touch': '48px',
        'touch-large': '64px',
      },
      maxWidth: {
        'mobile': '480px',
      },
      height: {
        'nav': '60px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
