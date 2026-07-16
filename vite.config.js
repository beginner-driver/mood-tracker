import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages는 https://<user>.github.io/<repo>/ 서브경로로 배포된다.
// 아래 base를 실제 저장소 이름으로 바꿔라. (사용자/커스텀 도메인이면 '/'로)
export default defineConfig({
  plugins: [react()],
  base: '/mood-tracker/',
})
