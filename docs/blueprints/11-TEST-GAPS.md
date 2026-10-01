# EduFlow AI OS — Test Gap Analysis & Defect Prevention

## 1. Executive Summary
This document provides an exhaustive inventory of untested code paths, edge cases, and architectural risk areas in the EduFlow AI OS platform prior to live institution presentations.

---

## 2. Features Without Full Automated Test Coverage

| Feature Component | Risk Level | Target Files | Uncovered Execution Paths | Priority |
|---|---|---|---|---|
| **Lead Pipeline UI** | HIGH | `web/src/pages/admin/LeadManagementPage.jsx` | Dynamic status transitions, blur autosave, phone format invalidation | P1 |
| **Report Delivery UI** | HIGH | `web/src/pages/admin/ReportDeliveryPage.jsx` | Large payload submission, link copying, lead autofill binding | P1 |
| **Invoice Generator UI** | HIGH | `web/src/pages/admin/InvoiceGeneratorPage.jsx` | Dynamic row calculations, GST calculation rounding, mark-paid action | P1 |
| **Public Report View** | HIGH | `web/src/pages/public/PublicReportViewer.jsx` | Expired token 404 rendering, PDF download action, print CSS media queries | P1 |
| **Lead Controller** | MEDIUM | `src/controllers/LeadController.js` | Internal notification email timeout, honeypot silent 200 bot rejection | P1 |
| **Report Controller** | HIGH | `src/controllers/ReportDeliveryController.js` | Token collision handling, binary PDF stream flushing, view count atomic increment | P1 |
| **Invoice Controller** | HIGH | `src/controllers/InvoiceController.js` | Sequential counter race condition, PDF buffer encoding, negative rate validation | P1 |
| **Pure JS PDF Engine** | MEDIUM | `src/controllers/OfficerExportController.js` | Content string escaping (parentheses, backslashes), multi-page overflow (>740 units) | P2 |
| **Observation Mode UI** | MEDIUM | `web/src/pages/demo/ObservationMode.jsx` | Presenter bar toggles, 2500ms step timeout interruption, ROI accumulator math | P2 |
| **Email Service** | MEDIUM | `src/services/email/emailService.js` | SMTP transport failure fallback, template string interpolation | P2 |
| **WebSocket GPS Tracker** | LOW | `src/server.js` | Client disconnect memory leak, intervals cleanup | P3 |
| **Backup Scripts** | MEDIUM | `scripts/backup.js`, `scripts/restore.js` | Non-existent directory handling, corrupted tarball gzip recovery | P2 |

---

## 3. High-Risk Edge Cases & Failure Scenarios

### Edge Case 1: JWT Expiration Mid-Stream
- **Symptom:** AI Officer stream begins successfully but JWT expires midway through a 90-second generation.
- **Current Behavior:** Backend stream continues because connection is established, but subsequent client-side PDF export or action fails with 401.
- **Remediation Plan:** Pre-flight token expiration check in `useStreamingOfficer.js`; auto-refresh access token if < 2 minutes remain before initiating SSE.

### Edge Case 2: Concurrent Multi-Officer Streaming
- **Symptom:** Presenter or user triggers multiple officers simultaneously across separate tabs.
- **Current Behavior:** Server handles requests independently, but global rate limiter (100 req/15 min) or LLM provider concurrency limit may trigger 429.
- **Remediation Plan:** Implement client-side debounce and priority queue for officer requests.

### Edge Case 3: Oversized Report Payload in PDF Generator
- **Symptom:** AI Officer outputs > 2,000 words.
- **Current Behavior:** Native PDF engine truncates text when Y-coordinate reaches minimum margin (`y < 60`).
- **Remediation Plan:** Add multi-page object support (`/Pages` array with dynamic kids) in `generatePdfBuffer`.

### Edge Case 4: Special Characters & Non-ASCII in Institution Names
- **Symptom:** College name contains regional characters or parentheses (e.g., `St. Xavier's (Autonomous)`).
- **Current Behavior:** `escapePdfText` escapes `\` and `()`, but non-Latin characters may render as blank glyphs in Helvetica.
- **Remediation Plan:** Add regex sanitization to strip non-ASCII or fallback to transliteration.

---

## 4. Priority Roadmap for Gap Closure

1. **P1 (Immediate — Before Live Demos):**
   - Add unit tests for `LeadController`, `ReportDeliveryController`, and `InvoiceController`.
   - Add integration tests for end-to-end Lead Intake → Delivery → Invoice flow.
2. **P2 (Near-Term — Production Pilot):**
   - Add Vitest component tests for `LeadManagementPage`, `ReportDeliveryPage`, and `InvoiceGeneratorPage`.
   - Implement multi-page PDF generation in pure JS engine.
3. **P3 (Long-Term — Scale & Enterprise):**
   - Set up Playwright E2E pipeline for full cross-browser testing.
   - Load test PostgreSQL pool under 50 simultaneous SSE streams.
