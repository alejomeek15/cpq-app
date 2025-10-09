import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal de la aplicación
        background: '#0A0A0A',
        surface: '#1A1A1A',
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
        },
        border: 'rgba(255, 255, 255, 0.1)',
        'text-primary': '#F5F5F5',
        'text-secondary': '#A3A3A3',
        
        // Paleta específica para el Sidebar (usando variables CSS)
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar) / <alpha-value>)',
          foreground: 'oklch(var(--sidebar-foreground) / <alpha-value>)',
          primary: 'oklch(var(--sidebar-primary) / <alpha-value>)',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground) / <alpha-value>)',
          accent: 'oklch(var(--sidebar-accent) / <alpha-value>)',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground) / <alpha-value>)',
          border: 'oklch(var(--sidebar-border) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      borderRadius: {
        'large': '12px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 70, 229, 0.2)',
      }
    },
  },
  plugins: [],
}