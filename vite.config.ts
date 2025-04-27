import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

const root = path.resolve(__dirname, "src")

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": root, // Map @ to ./src
    }
  }
})
