/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // 👇 이렇게 바꾸세요! (현재 폴더의 모든 하위 폴더를 다 뒤져라)
    "./**/*.{js,ts,jsx,tsx}",
    // 혹시 node_modules는 제외해야 하니 안전하게 아래처럼 명시하는 게 더 좋습니다.
    "!./node_modules/**",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // Slate 900 (아주 어두운 남색)
        surface: '#1e293b',    // Slate 800 (헤더용 약간 밝은 남색)
        primary: '#38bdf8',    // Sky 400 (포인트 컬러)
      },
      colors: {
        background: '#0f172a', // Slate 900
        surface: '#1e293b',    // Slate 800
        primary: '#3b82f6',    // Blue 500
        secondary: '#64748b',  // Slate 500
        accent: '#f59e0b',     // Amber 500
        company: '#ef4444',    // Red 500
        person: '#3b82f6',     // Blue 500
        tech: '#10b981',       // Emerald 500
        episode: '#8b5cf6',    // Violet 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
