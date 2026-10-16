import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap'
    })
  ].filter(Boolean),
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Raise the warning limit slightly to allow larger but intentional chunks
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Manual chunking groups large libraries and officer pages into separate files
        manualChunks(id) {
          if (id.includes('pages/ai/officers/AccreditationOfficer')) return 'officer-accreditation'
          if (id.includes('pages/ai/officers/StudentSuccessOfficer')) return 'officer-student-success'
          if (id.includes('pages/ai/officers/TimetableOfficer')) return 'officer-timetable'
          if (id.includes('pages/ai/officers/AdmissionOfficer')) return 'officer-admissions'
          if (id.includes('pages/ai/officers/FinanceOfficer')) return 'officer-finance'

          if (id.includes('node_modules')) {
            if (id.includes('@mui') || id.includes('@emotion')) return 'vendor-mui'
            if (id.includes('recharts') || id.includes('d3') || id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts'
            if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('micromark') || id.includes('mdast') || id.includes('unist')) return 'vendor-markdown'
            if (id.includes('axios') || id.includes('date-fns') || id.includes('lodash') || id.includes('es-toolkit')) return 'vendor-utils'
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion') || id.includes('gsap')) return 'vendor-motion'
            if (id.includes('react-router') || id.includes('react-router-dom') || id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) return 'vendor-react'
            return 'vendor'
          }
        },
      },
    },
  },
})
