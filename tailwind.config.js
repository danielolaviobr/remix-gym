/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    // backdropOpacity: false,
    // backgroundOpacity: false,
    // borderOpacity: false,
    // divideOpacity: false,
    // ringOpacity: false,
    // textOpacity: false,
  },
  theme: {
    extend: {
      height: {
        header: "7rem",
        "header-offset": "calc(100% - theme('height.header'))",
        "standalone-header-offset":
          "calc(100% - theme('height.header')  - 12px)",
      },
      screens: {
        standalone: { raw: "(display-mode: standalone)" },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
