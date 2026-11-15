# Frontend Bundle Size Audit Report

**Date:** November 15, 2026  
**Build Tool:** Vite 5 + Rollup  
**Application:** `eduflow-core/web`  
**Target Environment:** Production SPA  

---

## 1. Executive Summary

This audit assesses chunk distribution, tree-shaking efficiency, and lazy-loading boundaries across EduFlowAI's web client. Following optimization in Sprint Phase 1, `AcademicCalendarPage` was reduced from **118.30 kB** to **38.91 kB** (-67% reduction) by extracting canvas charts, PDF export builders, and tab modals into dynamically imported chunks.

---

## 2. Top Largest Chunks Distribution

| Chunk Asset | Raw Size | Gzip Size | Chunk Type | Loading Strategy |
|---|---|---|---|---|
| `dist/assets/vendor-charts-qWLQXe0u.js` | 369.31 kB | 100.87 kB | Vendor Library (Recharts / Chart.js) | Lazy (Only loaded on analytics views) |
| `dist/assets/vendor-IxE6lW8w.js` | 308.52 kB | 100.37 kB | Shared Vendor Infrastructure | Eager Shell |
| `dist/assets/index-DJxLytJX.js` | 229.47 kB | 57.48 kB | Main App Entrypoint & Route Table | Eager App Shell |
| `dist/assets/vendor-react-D4RimLG0.js` | 228.73 kB | 74.29 kB | React & React-DOM Core | Eager Vendor Base |
| `dist/assets/vendor-mui-9L_IuTga.js` | 97.40 kB | 34.52 kB | UI Component Primitives | Lazy / Route scoped |
| `dist/assets/OfficerLayout-B5Zf80sO.js` | 62.58 kB | 15.33 kB | Officer Portal Shell Layout | Lazy (Route: `/officer/*`) |
| `dist/assets/DocsPage-BVdbZXRP.js` | 44.54 kB | 12.13 kB | Statutory Documentation Viewer | Lazy (Route: `/docs`) |
| `dist/assets/NaacAiAnalysisPage-B2v_bHhe.js` | 43.52 kB | 10.77 kB | NAAC AI Advisor Screen | Lazy (Route: `/naac-analysis`) |
| `dist/assets/vendor-utils-FFVgWBKZ.js` | 42.96 kB | 16.95 kB | Shared Math & Matrix Utilities | Lazy / Route shared |
| `dist/assets/NirfDashboardPage-BcV3a2ry.js` | 42.95 kB | 9.56 kB | NIRF Scoring Dashboard | Lazy (Route: `/nirf-dashboard`) |
| `dist/assets/vendor-markdown-l6sm8RnU.js` | 40.08 kB | 12.44 kB | Markdown & LaTeX Parser | Lazy (SSR/Report views) |
| `dist/assets/AcademicCalendarPage-DKZCQOG7.js` | 38.91 kB | 9.99 kB | Academic Calendar Operations | Lazy (Reduced from 118 kB) |
| `dist/assets/vendor-icons-C9oZOZTl.js` | 37.80 kB | 12.49 kB | Lucide Icon Subsets | Shared Vendor |
| `dist/assets/LiveDataPage-7AZyk-10.js` | 37.24 kB | 10.05 kB | Real-Time Regulatory Feeds | Lazy (Route: `/live-data`) |
| `dist/assets/NaacDashboardPage-D7WDVf21.js` | 36.74 kB | 8.35 kB | NAAC Metrics Dashboard | Lazy (Route: `/naac-dashboard`) |
| `dist/assets/WhatsAppAttendancePage-B5nDq12D.js` | 36.31 kB | 9.48 kB | WhatsApp Attendance Staging Queue | Lazy (Route: `/admin/whatsapp`) |

---

## 3. Analysis of Chunks Exceeding 200 kB

### `vendor-charts-*.js` (369.31 kB raw / 100.87 kB gzip)
- **Included Packages:** `recharts`, `d3-shape`, `d3-scale`, SVG canvas chart elements.
- **Loading Behavior:** Fully isolated behind `React.lazy()` boundaries. Users viewing landing pages, attendance marking, student complaints, or calendar tables do not incur this download cost.
- **Audit Verdict:** Acceptable for a complex data intelligence ERP.

### `vendor-IxE6lW8w.js` (308.52 kB raw / 100.37 kB gzip)
- **Included Packages:** `react-router-dom`, core navigation context, event emitters.
- **Loading Behavior:** Eagerly downloaded as part of the initial bootstrap.
- **Audit Verdict:** Standard baseline for React Router v6 apps with 150+ declared route switches.

### `index-*.js` (229.47 kB raw / 57.48 kB gzip)
- **Contents:** Top-level route switch, navigation layout providers, authentication barriers, global toast notifications.
- **Audit Verdict:** Clean code-splitting with 100% route-level `React.lazy()` configuration.

### `vendor-react-*.js` (228.73 kB raw / 74.29 kB gzip)
- **Contents:** `react` 18.x and `react-dom` runtime.
- **Audit Verdict:** Standard React runtime footprint.

---

## 4. Academic Calendar Chunk Optimization Case Study

- **Original Monolithic Chunk:** `118.30 kB`
- **Subcomponents Extracted:**
  - `CalendarAnalyticsChart.jsx` (3.76 kB) — Lazy loaded on demand
  - `CalendarGridTab.jsx` (3.74 kB) — Lazy loaded on tab selection
  - `CalendarDiagnosisTab.jsx` (4.86 kB) — Lazy loaded on tab selection
  - `CalendarPreviewExportModals.jsx` (11.41 kB) — Dynamic modal with lazy PDF generation
  - `AcademicCalendarClientPdfBuilder.js` (11.71 kB) — Dynamic `import()` only when user initiates PDF download
- **Optimized Page Chunk:** **38.91 kB** (67.1% reduction)
- **Gzip Footprint:** **9.99 kB**
