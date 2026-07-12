/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0B1120',
          surface: '#111827',
          card: '#1F2937',
        },
        border: {
          DEFAULT: '#374151',
        },
        brand: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#60A5FA',
        },
        success: {
          DEFAULT: '#22C55E',
          bg: 'rgba(34,197,94,0.12)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245,158,11,0.12)',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239,68,68,0.12)',
        },
        text: {
          DEFAULT: '#F9FAFB',
          secondary: '#9CA3AF',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
        popover: '0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        glow: '0 0 0 1px rgba(59,130,246,0.4), 0 0 20px rgba(59,130,246,0.15)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        toastIn: { '0%': { opacity: 0, transform: 'translateY(-8px) scale(0.98)' }, '100%': { opacity: 1, transform: 'translateY(0) scale(1)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.25s ease-out',
        slideInRight: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)',
        toastIn: 'toastIn 0.2s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};
