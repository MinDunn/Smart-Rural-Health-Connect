/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00482f",
        secondary: "#006241",
        "starbucks-green": "#006241",
        "house-green": "#1E3932",
        "neutral-warm": "#f2f0eb",
      },
    },
  },
  plugins: [],
}
