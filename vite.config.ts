/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 项目站点默认部署在 /<仓库名>/ 路径下。
// 通过 VITE_BASE_PATH 覆盖（例如部署到用户主页站点时为 '/'）。
// 该值只影响静态资源与路由前缀，不含任何敏感信息。
const base = process.env.VITE_BASE_PATH ?? '/city-soul-quiz/'

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
