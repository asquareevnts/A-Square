/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          heading: ["Sora", "sans-serif"],
          body: ["Manrope", "sans-serif"],
          elegant: ["Sora", "sans-serif"],
        },
      },
    },
    plugins: [],
  };
  