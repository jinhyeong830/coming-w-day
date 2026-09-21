import type { Config } from "tailwindcss";

// 이번 마이그레이션에서는 mockup/index.html의 CSS를 app/globals.css로 그대로 옮겨서 쓴다.
// Tailwind는 향후 새 기능을 개발할 때 점진적으로 활용하기 위해 설정만 해두고,
// 기존 디자인을 Tailwind 유틸리티로 재해석하지 않는다.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
