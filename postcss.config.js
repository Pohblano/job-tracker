/**
 * PostCSS pipeline for SVB; Tailwind + Autoprefixer only to keep output lean for the TV display.
 */
module.exports = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
}
