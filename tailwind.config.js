/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#0063FF', // Your primary blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          green: '#10B981', // Teal green for gradient
          red: '#EF4444',   // Red for negative states
          purple: '#8B5CF6' // Purple for steps
        }
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, #0063FF, #10B981)', // Blue to teal gradient
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'medium': '0 10px 15px rgba(0, 0, 0, 0.08)',
        'large': '0 20px 25px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}