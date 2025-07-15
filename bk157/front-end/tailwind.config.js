/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E40AF', // Màu chủ đạo (xanh đậm)
        'secondary': '#9333EA', // Màu phụ (tím)
      },
    },
  },
  plugins: [],
}

