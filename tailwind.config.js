export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        yellow: 'var(--color-yellow)',
        bg: 'var(--color-bg)',
        text: 'var(--color-text)',
        bordercustom: 'var(--color-border)',
        headerbg: 'var(--color-header)',
        footerbg: 'var(--color-footer)',
        sidebarbg: 'var(--color-sidebar)',
      }
    },
  },
  plugins: [],
}