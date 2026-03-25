import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: true,
    cors: true,
    allowedHosts: true,
    // HMR clientPort helps w/ some proxies/HTTPS setups.
    hmr: {
      clientPort: 443
    }
  }
})
