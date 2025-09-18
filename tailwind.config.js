/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme financial colors
        financial: {
          // Profit colors (green spectrum)
          profit: {
            light: '#10b981', // emerald-500
            DEFAULT: '#059669', // emerald-600
            dark: '#047857', // emerald-700
          },
          // Loss colors (red spectrum)
          loss: {
            light: '#ef4444', // red-500
            DEFAULT: '#dc2626', // red-600
            dark: '#b91c1c', // red-700
          },
          // Neutral/breakeven colors
          neutral: {
            light: '#6b7280', // gray-500
            DEFAULT: '#4b5563', // gray-600
            dark: '#374151', // gray-700
          },
          // Target colors (blue spectrum)
          target: {
            light: '#3b82f6', // blue-500
            DEFAULT: '#2563eb', // blue-600
            dark: '#1d4ed8', // blue-700
          },
          // Stop-loss colors (amber spectrum)
          stopLoss: {
            light: '#f59e0b', // amber-500
            DEFAULT: '#d97706', // amber-600
            dark: '#b45309', // amber-700
          }
        },
        // Dark theme background colors
        dark: {
          // Main backgrounds
          bg: {
            primary: '#0f172a', // slate-900
            secondary: '#1e293b', // slate-800
            tertiary: '#334155', // slate-700
          },
          // Surface colors
          surface: {
            primary: '#1e293b', // slate-800
            secondary: '#334155', // slate-700
            tertiary: '#475569', // slate-600
          },
          // Border colors
          border: {
            primary: '#334155', // slate-700
            secondary: '#475569', // slate-600
            tertiary: '#64748b', // slate-500
          },
          // Text colors
          text: {
            primary: '#f8fafc', // slate-50
            secondary: '#e2e8f0', // slate-200
            tertiary: '#cbd5e1', // slate-300
            muted: '#94a3b8', // slate-400
          }
        }
      },
      fontFamily: {
        // Financial data optimized fonts
        'financial': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Financial display sizes
        'financial-xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'financial-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'financial-base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.025em' }],
        'financial-lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
        'financial-xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0.025em' }],
      },
      spacing: {
        // Financial layout spacing
        'financial': '0.125rem', // 2px for tight financial layouts
      },
      borderRadius: {
        // Financial component borders
        'financial': '0.375rem', // 6px
      },
      boxShadow: {
        // Financial component shadows for dark theme
        'financial': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'financial-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        // Smooth animations for financial data updates
        'profit-pulse': 'profit-pulse 2s ease-in-out infinite',
        'loss-pulse': 'loss-pulse 2s ease-in-out infinite',
        'price-update': 'price-update 0.3s ease-out',
      },
      keyframes: {
        'profit-pulse': {
          '0%, 100%': { backgroundColor: 'rgb(16, 185, 129)', opacity: '0.8' },
          '50%': { backgroundColor: 'rgb(5, 150, 105)', opacity: '1' },
        },
        'loss-pulse': {
          '0%, 100%': { backgroundColor: 'rgb(239, 68, 68)', opacity: '0.8' },
          '50%': { backgroundColor: 'rgb(220, 38, 38)', opacity: '1' },
        },
        'price-update': {
          '0%': { transform: 'scale(1)', backgroundColor: 'rgb(59, 130, 246)' },
          '50%': { transform: 'scale(1.05)', backgroundColor: 'rgb(37, 99, 235)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'transparent' },
        },
      },
    },
  },
  plugins: [],
}