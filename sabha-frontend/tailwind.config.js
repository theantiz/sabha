/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slowSpin: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        gentlePulse: {
          "0%,100%": {
            boxShadow:
              "inset 0 0 0 1px rgba(255,245,227,.9), inset 0 8px 16px rgba(255,255,255,.4), 0 18px 40px rgba(104,68,39,.28), 0 0 40px rgba(178,124,56,.12)",
          },
          "50%": {
            boxShadow:
              "inset 0 0 0 1px rgba(255,245,227,.95), inset 0 8px 16px rgba(255,255,255,.5), 0 22px 48px rgba(104,68,39,.32), 0 0 50px rgba(178,124,56,.18)",
          },
        },
        fadeUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      animation: {
        slowSpin: "slowSpin 24s linear infinite",
        gentlePulse: "gentlePulse 4s ease-in-out infinite",
        fadeUp: "fadeUp .8s cubic-bezier(.4,0,.2,1) both",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
        serif: ["Marcellus", "ui-serif", "Georgia"],
        dev: ["Noto Serif Devanagari", "serif"],
      },
      colors: {
        sabhaBg: "#f6efe1",
        sabhaText: "#2d2018",
        sabhaMuted: "#7f6350",
        sabhaAccent: "#8b3e2f",
        sabhaGold: "#b27c38",
      },
      boxShadow: {
        sabha: "0 18px 40px rgba(66,39,22,.12)",
      },
    },
  },
  plugins: [],
};
