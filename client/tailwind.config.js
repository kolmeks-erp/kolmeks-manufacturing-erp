/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#071220', // Deepest Navy
          900: '#0B1E36', // Main Dark Industrial Navy
          850: '#0F2C59', // Primary Deep Industrial Blue
          800: '#14386D',
          700: '#1D4ED8', // Accent Professional Blue
          600: '#2563EB',
          500: '#3B82F6',
          200: '#E2E8F0', // Border neutral
          100: '#F1F5F9', // Surface light
          50:  '#F8FAFC', // Background light
        },
        slate: {
          850: '#152033',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'industrial': '0 4px 20px -2px rgba(11, 30, 54, 0.08)',
        'industrial-lg': '0 10px 30px -4px rgba(11, 30, 54, 0.12)',
      }
    },
  },
  plugins: [],
}
