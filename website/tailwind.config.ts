import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f1',
          100: '#e6ebe1',
          200: '#cdd8c3',
          300: '#ACC4B2',
          400: '#9CAF88',
          500: '#7d9468',
          600: '#647a50',
          700: '#4d6040',
          800: '#3d4d34',
          900: '#2d3a28',
        },
        sand: {
          400: '#B2AC88',
          500: '#9e9774',
        },
      },
      fontFamily: {
        display: ['EB Garamond', 'Georgia', 'serif'],
        body: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
