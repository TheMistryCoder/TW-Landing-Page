module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
    },
    extend: {
      colors: {
        solid: "#FCFCFE",
        surfaceDeep: "#1d232a",
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins: [],
};
