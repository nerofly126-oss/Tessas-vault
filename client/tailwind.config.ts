import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        lilac: '#B9A7E8',
        sky: '#BFE3F8',
        sunshine: '#F8D84E',
      },
    },
  },
  plugins: [],
} satisfies Config;
