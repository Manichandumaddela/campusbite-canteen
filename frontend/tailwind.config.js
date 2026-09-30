/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm2': '425px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(234, 88, 12, 0.12), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
        'glow-orange': '0 0 25px -5px rgba(249, 115, 22, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.35s ease-out forwards',
        'zoom-in': 'zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'cart-bump': 'cartBump 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'badge-pop': 'badgePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.8s infinite linear',
        'float-slow': 'float 5s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2.5s ease-in-out infinite',
        'scale-press': 'scalePress 0.15s ease-out',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        cartBump: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.35) rotate(-10deg)' },
          '60%': { transform: 'scale(1.2) rotate(8deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        badgePop: {
          '0%': { transform: 'scale(0.6)' },
          '50%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.82' },
        },
      },
    },
  },
  plugins: [],
}

