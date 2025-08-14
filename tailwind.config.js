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
        // Background colours
        bgSolidLight: "#FCFCFE",        // Light solid background for sections
        bgComponentDark: "#1d232a",     // For dark UI components (cards, badges, icon boxes)
        sectionDarkPrimary: "#1d232a",  // Main dark section background
        sectionDarkSecondary: "#191e25",// Alternate dark section background

        // Text colours
        textOnLight: "#1A2930", // Default text colour on light backgrounds
        textOnDark: "#a6adbb",  // Default text colour on dark backgrounds
        textMutedOnLight: "#475569cc", // slate-600/80
        textMutedOnDark: "#d1d5dbcc"  // slate-300/80
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};
