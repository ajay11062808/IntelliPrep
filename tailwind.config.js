/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/**.{jsx,js,jsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};

