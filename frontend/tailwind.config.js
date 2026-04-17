/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#10b981", /* Emerald */
        secondary: "#8b5cf6", /* Violet */
        "bg-dark": "#0B1120", /* Very dark blue for contrast */
        "glass-border": "rgba(255, 255, 255, 0.1)",
        "text-muted": "#94a3b8",
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
      }
    },
  },
  plugins: [],
}
