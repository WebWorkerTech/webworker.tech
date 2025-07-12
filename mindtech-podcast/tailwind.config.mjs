/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF6',
          100: '#F9F5E7',
          200: '#F5F0E1',
          300: '#EFE6D3',
          400: '#E6D5B8',
          500: '#D9C19E',
        },
        mint: {
          50: '#F0FFFA',
          100: '#CCF5E7',
          200: '#99EBCF',
          300: '#66E1B7',
          400: '#34CC85', // 主题色
          500: '#2AA269',
        },
        slate: {
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        wave: 'wave 1s ease infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': {
            transform: 'scaleY(0.3)',
          },
          '50%': {
            transform: 'scaleY(1)',
          },
        },
      },
      backgroundImage: {
        'wave-pattern':
          "url(\"data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.09-.396C30.827 15.36 41.33 13 50 13c8.67 0 19.173 2.36 27.726 6.604 1.308.384 2.33 1.17 3.674 1.406 1.08.18 2.21.18 3.29 0 1.344-.236 2.366-1.022 3.674-1.406C95.85 15.077 100 13.12 100 10c0-2.209-4.03-4.077-9.326-5.604-1.344-.384-2.366-1.17-3.674-1.406-1.08-.18-2.21-.18-3.29 0-1.344.236-2.366 1.022-3.674 1.406C75.54 5.923 66.77 7 50 7 33.23 7 24.46 5.923 16.274 3.396 14.966 3.012 13.944 2.226 12.636 1.84 11.556 1.56 10.426 1.56 9.346 1.84C8.038 2.226 7.016 3.012 5.708 3.396 1.79 5.323 0 7.622 0 10c0 2.209 1.79 4.677 5.708 6.604 1.308.384 2.33 1.17 3.674 1.406 1.08.18 2.21.18 3.29 0 1.344-.236 2.366-1.022 3.674-1.406C17.818 19.736 19.49 20 21.184 20z' fill='%2334CC85' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
