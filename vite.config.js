import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages 는 https://k1mg0eun.github.io/okashi-konbini/ 처럼 하위 경로에 뜨므로 에셋 경로 앞에 붙일 base 를 지정한다
export default defineConfig({
  base: "/okashi-konbini/",
  plugins: [react()],
});
