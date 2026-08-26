/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
        success: '#27ae60',
        warning: '#f39c12',
        danger: '#e74c3c',
        dark: '#2c3e50',
        light: '#f5f6f7',
        muted: '#7f8c8d'
      },
      spacing: {
        128: '32rem'
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
        md: '0 4px 8px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 40px rgba(0, 0, 0, 0.2)'
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px'
      }
    }
  },
  plugins: []
}
