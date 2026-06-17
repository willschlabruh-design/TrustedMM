module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        accent: {
          DEFAULT: '#E5B423',
          hover: '#F0C94A',
          foreground: '#0B1228',
        },
        deep: '#081229',
        navy: {
          950: '#050b1a',
          900: '#081229',
          800: '#0c1835',
          700: '#101f45',
        },
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(2,6,23,0.35)',
        'card-hover':
          '0 0 0 1px rgba(129,140,248,0.15), 0 16px 48px rgba(2,6,23,0.45)',
        glow: '0 0 40px rgba(59,130,246,0.12)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-up': 'slideUp 0.45s ease both',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
