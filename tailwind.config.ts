import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { cocoa: 'var(--cocoa)', surface: 'var(--surface)', brand: 'var(--brand)', cyan: 'var(--cyan)', cookie: 'var(--cookie)', peach: 'var(--peach)', cream: 'var(--cream)' },
      fontFamily: { display: ['Cormorant Garamond', 'serif'], body: ['Sora', 'sans-serif'] },
      boxShadow: { product: '0 28px 58px rgba(0,0,0,.46), 0 10px 22px rgba(255,179,107,.09)' }
    }
  },
  plugins: []
} satisfies Config
