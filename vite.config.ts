import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://portal.kpspestcontrol.co.za',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    // Production optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroui/react', 'framer-motion'],
          icons: ['lucide-react'],
          utils: ['axios', 'zustand']
        }
      }
    },
    // Enable compression
    minify: 'terser',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  // PWA optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@heroui/react']
  },
  preview: {
    host: true,
  }
}))
