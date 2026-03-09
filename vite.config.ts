import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
