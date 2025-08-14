/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./scripts/**/*.js"
  ],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        // Light solid backgrounds
        sectionLightSolidPrimary: "#FCFCFE",
        sectionLightSolidSecondary: "#F5F7FA",

        // Dark solid backgrounds
        sectionDarkSolidPrimary: "#1d232a",
        sectionDarkSolidSecondary: "#191e25",

        // Component backgrounds
        bgComponentDark: "#1d232a",

        // Text colours
        textOnLight: "#1A2930",
        textOnDark: "#a6adbb",
        textMutedOnLight: "#475569cc",
        textMutedOnDark: "#d1d5dbcc"
      }
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};
