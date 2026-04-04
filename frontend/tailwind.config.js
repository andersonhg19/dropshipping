import primitives from './src/theme/colors.ts'

/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './package/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: primitives.brand,
        gray: primitives.gray,
        success: primitives.green,
        warning: primitives.orange,
        danger: primitives.red,
        // ... otros si quieres
      },
    },
  },
  plugins: [],
}
