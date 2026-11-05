import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: env.VITE_PRODUCTION_BACKEND_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
