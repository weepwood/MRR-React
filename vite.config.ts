import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
    server: {
      port: Number(env.VITE_PORT || 5173),
      host: "0.0.0.0",
      proxy: {
        "/proxy": {
          target: env.VITE_PROXY_TARGET || "http://127.0.0.1:8080",
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/proxy/, ""),
        },
      },
    },
    build: { sourcemap: false, chunkSizeWarningLimit: 1200 },
  }
})
