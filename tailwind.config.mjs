/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2d3748",
        },
        secondary: {
          DEFAULT: "#3C7099",
        },
        accent: {
          DEFAULT: "#C81E6A",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
