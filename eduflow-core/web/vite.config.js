import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
