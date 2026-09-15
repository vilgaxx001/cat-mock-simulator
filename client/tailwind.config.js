/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        canvas: "#F5F6F8",
        panel: "#FFFFFF",
        line: "#E2E5EA",
        ink: "#14181F",
        muted: "#5B6472",
        accent: {
          DEFAULT: "#3452C7",
          dark: "#26399B",
          light: "#EEF1FC",
        },
        status: {
          notvisited: "#C7CBD4",
          notanswered: "#B74432",
          answered: "#357B38",
          review: "#7C4FE0",
          answeredreview: "#1A755F",
        },
        warn: "#AD5F04",
        danger: "#B74432",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(20, 24, 31, 0.04), 0 1px 8px rgba(20, 24, 31, 0.03)",
      },
    },
  },
  plugins: [],
};
