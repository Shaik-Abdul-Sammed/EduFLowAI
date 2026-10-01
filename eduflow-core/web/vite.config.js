import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Raise the warning limit slightly to allow larger but intentional chunks
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Manual chunking groups large libraries into separate files
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion')) return 'vendor-motion'
            if (id.includes('chart.js') || id.includes('react-chartjs-2') || id.includes('recharts')) return 'vendor-charts'
            if (id.includes('gsap')) return 'vendor-gsap'
            if (id.includes('axios')) return 'vendor-ajax'
            return 'vendor'
          }
        },
      },
    },
  },
})
