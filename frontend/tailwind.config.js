/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0f172a',
        'primary-blue': '#1e3a8a',
        'primary-light': '#3b82f6',

        'secondary-purple': '#6d28d9',
        'secondary-light': '#8b5cf6',

        'accent-cyan': '#06b6d4',
        'accent-light': '#22d3ee',

        'light-text': '#f1f5f9',
        'dark-text': '#0f172a',

        'card-bg': 'rgba(15, 23, 42, 0.7)',

        'success-green': '#10b981',
        'error-red': '#ef4444',
        'warning-orange': '#f59e0b',
        'info-blue': '#3b82f6',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },

      boxShadow: {
        glow: '0 0 20px rgba(6, 182, 212, 0.3)',
        card: '0 8px 32px rgba(0, 0, 0, 0.2)',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-in': 'slideIn 0.5s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        slideIn: {
          '0%': {
            transform: 'translateX(-10px)',
            opacity: '0'
          },

          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          },
        },
      },
    },
  },

  plugins: [],
}