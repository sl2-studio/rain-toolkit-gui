const production = !process.env.ROLLUP_WATCH;
const colors = require("tailwindcss/colors");
module.exports = {
  purge: {
    content: ["./src/**/*.svelte"],
    enabled: production, // disable purge in dev
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 10s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      colors: {
        gray: colors.stone,
      },
      width: {
        600: "600px",
        900: "900px"
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
};
