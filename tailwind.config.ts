import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        prime: "#1E40AF",
        sec: "#F59E0B",
        dang: "#EF4444",
      },
    },
  },
  plugins: [],
};

export default config;
