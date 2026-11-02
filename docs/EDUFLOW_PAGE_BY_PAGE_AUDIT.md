# EDUFLOW AI: Comprehensive Page-by-Page Audit

## 1. Admin Dashboard (`src/components/DashboardHome.jsx`)
**Current State:**  
The dashboard renders high-level KPI cards, predicted NAAC and NIRF score summaries, an interactive Recharts attendance/grades graph, and quick access widgets. While recent patches resolved the `-1` width/height Recharts calculation error via explicit container height and conditionally wrapping `<ResponsiveContainer>`, the page relies heavily on hardcoded mock values for performance charts (months July–Dec) and static SVG sparklines. Several action cards route to legacy or non-existent URLs (such as `/officer/accreditation` instead of `/officers/accreditation`), unauthenticated 401s clear tokens without redirecting the user, and widgets lack interactive live links or pagination.

**15 Improvements:**
1. **[Bug] Broken Route Navigation on Predicted NAAC Card:** Line 383 triggers `navigate('/officer/accreditation')`, which mismatches standard routes (`/officers/accreditation` or `/admin-dashboard/naac`), causing 404 fallback routing in some router setups.
2. **[Bug] Incomplete 401 Handling State:** Lines 112–116 strip `accessToken` and `token` from `localStorage` on a 401 response from `/v1/admin/dashboard-metrics`, but fail to invoke `navigate('/login')`, leaving the dashboard mounted in a broken, half-authenticated state.
3. **[Bug] Silent Failure on Metrics Fetch:** Lines 121–123 feature an empty `catch {}` block that swallows network errors silently, leaving the user with static default state and no visual indicator that live telemetry failed to load.
4. **[Bug] Hardcoded Collection Efficiency Metric:** Line 339 displays a static string `98.8%` regardless of real financial data from `adminMetrics.unpaidInvoices` or `/v1/invoices` records.
5. **[Feature] Dynamic Recharts Telemetry:** Replace static `chartData` (lines 91–98) with real monthly biometric attendance and continuous internal assessment (CIE) averages queried from `/v1/attendance/monthly-summary`.
6. **[Feature] Live System Alerts & Pending Approvals Feed:** Lines 57–60 define hardcoded mock strings ('High CPU Load on Server 2', 'Database Backup Completed'). Wire these directly to `/v1/monitoring/events` and `/v1/approvals/pending`.
7. **[Feature] Academic Year / Semester Filter Dropdown:** Add a global semester selector (e.g., Odd Term 2026 vs. Even Term 2026) in the header so metrics dynamically re-aggregate across chosen historical semesters.
8. **[Feature] Export Institutional Executive Summary:** Add a 1-click "Download Dean's Briefing (PDF/CSV)" action button in the welcome banner to export high-level metrics for Syndicate/Governing Council meetings.
9. **[UI] Static SVG Polyline Sparkline Replacement:** Lines 400–412 render a hardcoded static `<polyline>` (`0,22 30,18...`). Replace with dynamic SVG or micro-area chart plotting actual 5-year NAAC CGPA trends.
10. **[UI] Responsive Grid Breakpoint Wrap on Mobile:** Metric cards (`col-6 col-md-3`) wrap tightly on small viewports (< 375px), causing large number typography (`1.75rem`) to clip against badges and labels. Add `clamp()` font scaling or `col-12 col-sm-6 col-md-3`.
11. **[UI] Loading Skeletons for Metrics Cards:** When `fetchMetrics` runs, numbers abruptly jump from defaults to live values. Wrap metric tiles in `<SkeletonLoader variant="metric" />` until data resolution.
12. **[UI] Dark Mode Contrast on Widget Surface:** Widget containers use `var(--surface-bg)` with faint borders (`rgba(148,163,184,0.2)`), which creates low contrast against dark backgrounds. Enforce high-contrast border and card background tokens.
13. **[A11y] Missing Keyboard Event Handlers on Metric Cards:** Cards configured with `role="button"` and `tabIndex={0}` (lines 181, 202, 223, 244, 268) lack `onKeyDown` (Enter/Space) handlers, failing WCAG 2.1.1 Keyboard Accessible criteria.
14. **[A11y] Missing ARIA Labels on Trend Indicators:** The Trend indicator (`+8.5% YoY`, line 413) lacks an `aria-label="Increase of 8.5% year over year"`, causing screen readers to read raw punctuation.
15. **[A11y] Inadequate Contrast on Subtitle Typography:** Subtitle typography in the welcome banner (`rgba(255,255,255,0.75)`) against colored gradients fails the 4.5:1 WCAG AA contrast threshold under bright ambient lighting.

---

## 2. AI Officers Hub & Chat (`src/pages/ai/OfficersDashboard.jsx` & `components/OfficerLayout.jsx`)
**Current State:**  
The Officers Hub acts as the command center for the 5 autonomous AI Officers, displaying ROI metrics, individual officer cards, recent AI activity, and live SSE streaming chat. While the chat streaming supports Markdown rendering and file attachments, the WebSocket connection badge prematurely switches to "Offline" after 3 seconds of connecting, even when the server is actively processing. The "Copy" and "Edit" prompt buttons use unhandled clipboard APIs that can throw uncaught exceptions, and the officer history persists in localized `localStorage` rather than server-synced sessions.

**15 Improvements:**
1. **[Bug] Premature "Offline" Connection Timeout:** `OfficerLayout.jsx` (lines 80–90) flags `connectionTimedOut = true` after a rigid 3000ms delay. Cloud LLM inferences on Render typically take 4–6 seconds to deliver first tokens, causing the UI badge to falsely display "Offline" before streaming begins. Increase threshold to 12s or add adaptive reconnect logic.
2. **[Bug] Unhandled Clipboard Exceptions in Prompt Copy:** `OfficerLayout.jsx` (lines 753–756) directly calls `navigator.clipboard.writeText(msg.content)` without a `catch` block or fallback for non-secure HTTP contexts or sandboxed iframes where clipboard access is denied.
3. **[Bug] Stale LocalStorage History Drift:** Chat history is saved only to `localStorage.getItem('officer_history_...')` (lines 72–76). If a user accesses EduFlow from another device or incognito window, past audit reports and chat transcripts are completely missing.
4. **[Bug] ROI Metrics Calculation Out-of-Sync:** In `OfficersDashboard.jsx` (lines 378–380), `officerRoi?.hoursSaved` defaults to `0 hrs` whenever `roi?.byOfficer` array is empty or during API lag, giving the false impression that zero ROI was generated.
5. **[Feature] Stop Generation (AbortController) Button:** While streaming is active (`status === 'streaming'`), add a visible "Stop Generating" button that aborts the underlying `ReadableStream` immediately to prevent unnecessary token consumption.
6. **[Feature] Multi-Turn Conversation Thread Branching:** Currently, submitting a new prompt appends to a flat list. Add conversation session management (e.g., "New Audit Session", "Historical Audits") in the sidebar with timestamped thread naming.
7. **[Feature] Server-Side PDF Generation with Digital Signatures:** `exportEndpoint` posts text payload to backend, but lacks options to append institutional letterhead, QR verification stamp, or cryptographic SHA-256 integrity hash.
8. **[Feature] In-Chat Citation Deep-Links:** When an officer cites a regulatory document (e.g., "AICTE APH Clause 2.14"), render it as a clickable badge that opens the verified clause preview in a slide-over drawer.
9. **[UI] Auto-Scroll Collision with Manual Scroll-Up:** In `OfficerLayout.jsx`, `messagesEndRef.current?.scrollIntoView()` fires on every single incoming streaming token, forcefully snapping the viewport to the bottom and preventing the user from reading previous messages while streaming.
10. **[UI] Officer Avatar & Status Indicator Alignment:** On small screens, the officer card header wraps awkwardly, pushing the status pill below the title and distorting the top border alignment.
11. **[UI] Prompt Input Textarea Auto-Resize Glitch:** The chat input textarea expands vertically as users type, but does not reset its height back to 40px after prompt submission, leaving an empty box until manual interaction.
12. **[UI] Empty State Graphic for New Sessions:** When opening an officer for the first time, the chat area is completely blank until the user sends a message. Add a welcoming domain briefing with key capabilities and quick-start prompt chips.
13. **[A11y] Missing `aria-live` Region for Streaming Tokens:** Incoming token chunks stream into the DOM without an `aria-live="polite"` or `aria-atomic="false"` container, preventing assistive screen readers from announcing streaming responses.
14. **[A11y] Icon-Only Action Buttons Missing Text Equivalents:** Share, Email, and Print icon buttons (lines 573–576) rely solely on SVG icons. Add hidden `<span className="visually-hidden">` text to guarantee full screen reader compatibility.
15. **[A11y] Keyboard Trap in Chat Textarea:** Tabbing through the prompt input area does not allow keyboard users to easily jump to the Send button or quick prompt pills without cycling through all history items.

---

## 3. Accreditation Officer (`src/pages/ai/officers/AccreditationOfficer.jsx`)
**Current State:**  
The Accreditation Officer page specializes in NAAC Self-Study Report (SSR) generation, NBA Outcome-Based Education (OBE) documentation, and Criteria 1–7 audits. It features a criterion dropdown, quick suggested prompts, and an interactive Readiness gauge. However, selecting a criterion forcefully overwrites any custom prompt typed into the textarea, the left action items (`NAAC Self Study Report`, `NBA Outcome Based Education Report`) submit raw label strings without context, and document previewing does not render standard A4 page breaks.

**15 Improvements:**
1. **[Bug] Form Input Overwrite without Warning:** In `AccreditationOfficer.jsx` (lines 124–128), selecting an option in `CRITERIA_OPTIONS` immediately overwrites `setInputValue(opt.prompt)` without checking if the user already wrote custom prompt instructions.
2. **[Bug] Incomplete Criterion Mapping in Prompt Auto-Detection:** `handlePromptChange` uses regex `/criterion\s*([1-7])/i`. If a user types "Teaching Learning" or "Curricular", the dropdown fails to detect the criterion because it only matches numeric indicators.
3. **[Bug] PDF Preview Modal Print Styling Break:** In `OfficerLayout.jsx` preview modal, printing the preview applies default browser margins that cut off markdown table columns (specifically Tables with > 5 columns such as Metric 2.1).
4. **[Bug] Missing Institution ID Context in SSE Payload:** `payloadBuilder` (lines 94–110) returns `reportType`, `action`, and `criterion`, but omits `institutionId`, causing multi-tenant backends to default to ID 1.
5. **[Feature] Interactive SSR Markdown Table Editor:** When the officer outputs Table 2.1 or 2.2, allow inline cell editing directly in the chat preview before exporting to official NAAC SSR PDF.
6. **[Feature] Document Validation & Verification (DVV) Checklist Generator:** Add a dedicated one-tap button to extract all required documentary evidence (e.g., sanctioned intake letters, syndicate approvals) into a downloadable zip checklist.
7. **[Feature] Benchmark Gap Comparison Tool:** Enable comparative scoring against benchmark institutions (e.g., "Compare our Criterion 3 research output against Tier-1 autonomous peers").
8. **[Feature] Metric-Level File Attachment Binding:** Allow users to drag-and-drop supporting proof files (e.g., `Criterion_2_Faculty_List.xlsx`) and tag them directly to specific NAAC metric codes (e.g., Metric 2.4.2).
9. **[UI] Hardcoded Circular Readiness Gauge:** Lines 34–39 render a circular gauge with static hardcoded CSS borders (`width: 100px`, `transform: rotate(45deg)`) displaying static `88.4%`. Bind this to live API readiness telemetry.
10. **[UI] Markdown Table Horizontal Scroll Overflows:** Markdown tables with 6+ columns overflow their chat bubble container on screens under 1024px, clipping content and causing horizontal body scrolls. Add an explicit `table-responsive` wrapper with sticky headers.
11. **[UI] Low Contrast on Criteria Selector Dropdown:** The dropdown element uses background `rgba(255,255,255,0.06)` with text `#f8fafc` which becomes faint and hard to click on certain monitors.
12. **[UI] Static Left Actions Visual Feedback:** Left action buttons (`NAAC Self Study Report`, `NBA Report`) have no active state, tooltip, or indication that clicking them immediately fires an automated SSE generation request.
13. **[A11y] Missing Focus Rings on Dropdown Selectors:** The `#naac-criteria-select` element uses `outline: 'none'` (line 129), eliminating the visible focus indicator for keyboard navigation users.
14. **[A11y] Circular Gauge Color Blindness Risk:** Readiness indicators (lines 41–44) rely on colored dots (`#10B981`, `#EF4444`) without descriptive icons (e.g., checkmark, warning triangle), failing WCAG 1.4.1 (Use of Color).
15. **[A11y] Missing Accessible Label for File Upload Input:** In `OfficerLayout.jsx`, the hidden file input (`fileInputRef`) lacks an explicit `aria-label` or linked `<label>`, failing automated screen reader form audits.

---

## 4. NAAC & NIRF Dashboards (`src/pages/admin/NaacDashboardPage.jsx` & `NirfDashboardPage.jsx`)
**Current State:**  
These dashboards provide institutional leadership with predicted scores, parameter breakdowns, radar/bar charts, peer comparisons, and improvement roadmaps for NAAC and NIRF. While recent contrast fixes improved title visibility, the NIRF export functionality silently falls back to generating a raw `.txt` file when the backend PDF route is unavailable. Furthermore, NAAC sub-charts rely entirely on static mock datasets, and errors during export trigger unstyled native browser `alert()` popups.

**15 Improvements:**
1. **[Bug] Silent Fallback to .txt on PDF Export:** In `NirfDashboardPage.jsx` (lines 212–220), if `/v1/nirf/export-pdf` encounters an error, it silently downloads a `.txt` plain text summary instead of alerting the user or displaying a recovery prompt.
2. **[Bug] Native Browser `alert()` Popups on Error:** In `NaacDashboardPage.jsx` (lines 232 and 236), download errors trigger crude `alert('Failed to generate PDF. Please try again.')` windows that freeze the main UI thread. Replace with `useToast`.
3. **[Bug] Unhandled Response JSON Parsing in NIRF Prediction:** In `NirfDashboardPage.jsx` (lines 101–110), `handlePredictRank` does not wrap `res.json()` in safe parsing; if Render returns an HTML 502/504 error page, the app crashes with a JSON SyntaxError.
4. **[Bug] Hardcoded Institutional Name in CSV Export:** In `NaacDashboardPage.jsx` (line 216), `institutionName` is hardcoded to `'Sri Sudha Institute of Technology'` rather than pulling from `user.institutionName` or settings.
5. **[Feature] Interactive What-If Simulation Sliders:** Allow Deans to adjust key parameters (e.g., increase Ph.D. faculty from 68% to 80% or Scopus publications from 182 to 250) and observe real-time predicted rank/grade recalculation.
6. **[Feature] SSR Quantitative Metrics Data Sync:** Add a direct "Sync Metrics with Institutional ERP" button that automatically updates student count, faculty credentials, and financial expenditures from live database tables.
7. **[Feature] Multi-Year NIRF Trend Overlay:** Currently only displays the current ranking band (`101-150`). Add multi-year historical trend line tracking TLR, RPC, GO, OI, and PR scores over the past 5 ranking cycles.
8. **[Feature] Peer Institution Gap Heatmap:** Display a side-by-side metric matrix comparing the college against top 3 regional competitors (e.g., SSIT vs. BMSCE vs. JSSATE) with highlighted negative deltas.
9. **[UI] 110px Fixed Height Chart Squishing:** In `NaacDashboardPage.jsx` (lines 540, 558, 576, 596, 614), the 5 Recharts components are locked into `height: 110px` containers, causing X-axis labels and legends to overlap and become illegible. Increase height to 180px with responsive aspect ratio.
10. **[UI] Radar Chart Polar Grid Clipping:** The Criterion 7 Institutional Values Radar Chart (`CRITERION_7_CHART_DATA`) clips metric labels on viewport widths below 1200px due to fixed `outerRadius={38}`.
11. **[UI] Dark Mode Table Header Inconsistency:** Table headers in the criteria breakdown use Bootstrap's `.table-light`, which renders an inverted bright white band inside dark theme mode.
12. **[UI] Missing Empty State for NIRF Improvement Plan:** When target rank is selected but "Generate Plan" hasn't been clicked, the area shows an empty white card with no placeholder or guidance text.
13. **[A11y] Unlabeled Category Tabs in NIRF Dashboard:** Category selector tabs ('Engineering', 'Overall', 'Management') do not use standard ARIA `role="tablist"` and `role="tab"` attributes with `aria-selected` states.
14. **[A11y] Color Contrast Deficit in Parameter Progress Bars:** In `NirfDashboardPage.jsx`, sub-metric progress bars use light pastel fills with low contrast ratios against light gray background tracks.
15. **[A11y] Missing Table Headers (`scope="col"`) in Peer Rankings:** The peer comparison table lacks `scope="col"` and `scope="row"` headers, making navigation via screen reader virtual tables confusing.

---

## 5. Academic Calendar (`src/pages/admin/AcademicCalendarPage.jsx`)
**Current State:**  
The Academic Calendar page handles institutional semester scheduling, AI holiday drift diagnosis, compensatory working Saturday allocations, and event adjustments. Although the recently added interactive 7-column month grid and AI festival diagnosis work well, changing state or academic year parameters uses local mock fallbacks when API endpoints lag. Holiday overlap detection does not automatically reschedule conflicting exam blocks, and custom dates entered in the settings panel do not automatically synchronize with the published student view.

**15 Improvements:**
1. **[Bug] Holiday vs. Exam Date Collision Detection:** While the AI diagnosis flags that holidays reduce teaching days, it does not prevent a user or admin from scheduling an exam event on top of an existing Gazetted Public Holiday (e.g. scheduling Internal Assessment 2 on Diwali).
2. **[Bug] Hardcoded Event Dates on State Change:** In `AcademicCalendarPage.jsx` (lines 194–202), `loadDefaultCalendar` hardcodes Dussehra (`10-18`) and Diwali (`11-06`) dates for all states, ignoring regional variations (e.g. Durga Puja in West Bengal vs. Onam in Kerala).
3. **[Bug] Missing Confirmation on Calendar Publish:** Lines 302–320 allow clicking "Publish Academic Calendar" with an immediate API call; there is no confirmation modal warning the admin that publishing freezes changes and alerts the entire student/faculty body.
4. **[Bug] Date Range Paradox Validation Missing:** The custom calendar form allows setting `collegeEndDate` earlier than `collegeStartDate` without client-side form validation, resulting in negative working day calculations.
5. **[Feature] Drag-and-Drop Event Rescheduling:** Allow administrators to drag exam blocks, cultural festivals, or compensatory classes across the visual month grid and automatically update backend date timestamps.
6. **[Feature] Google Calendar & iCal Feed Export:** Add an "Add to Google Calendar / Outlook (.ics)" subscription link so faculty and students can sync the published academic schedule to their mobile devices.
7. **[Feature] Autonomous UGC 90-Day Working Day Calculator:** As dates are adjusted, maintain a live floating counter showing remaining instructional days versus the statutory UGC 90-day requirement for both Odd and Even semesters.
8. **[Feature] Multi-Shift / Timetable Integration:** Link calendar teaching days directly to the AI Timetable Officer so that compensatory Saturday classes automatically inherit corresponding Monday/Wednesday timetables.
9. **[UI] Month Navigation Overflow on Mobile:** In the Interactive Month View, the 12 month selector buttons (`July` to `June`) wrap into 4 uneven rows on mobile viewports, consuming half the vertical screen space. Implement a horizontal swipeable pill carousel.
10. **[UI] Calendar Cell Number Clipping:** On screen widths below 768px, 7-column calendar day cells shrink below 36px width, causing day numbers, badges, and event indicators to overlap into an unreadable cluster.
11. **[UI] Badge Color Ambiguity:** Gazetted holidays are Red, Exam windows are Amber, and At-Risk dates are also Amber. Introduce distinct iconography (e.g., 📝 for Exams, 🚩 for Holidays, 🔄 for Compensatory Days) to eliminate visual confusion.
12. **[UI] Truncated Event Reason in Adjustments Table:** Long adjustment reasons (e.g. "Severe monsoon waterlogging and district collector order") are cut off without ellipsis or hover tooltips in the history table.
13. **[A11y] Missing ARIA Grid Semantics for Calendar:** The 7-column interactive calendar is constructed using standard `div` elements without `role="grid"`, `role="row"`, and `role="gridcell"`, making keyboard traversal impossible for screen readers.
14. **[A11y] Missing Keyboard Arrow Navigation between Days:** Users cannot use Left/Right/Up/Down arrow keys to move focus between calendar day cells, violating WAI-ARIA Date Picker Authoring Practices.
15. **[A11y] Unannounced Month Changes:** When switching between academic months using navigation arrows, the new month heading is not announced to assistive technology because it lacks an `aria-live="polite"` attribute.

---

## 6. Attendance & WhatsApp Intelligence (`src/pages/admin/AttendanceIntegrationPage.jsx` & `WhatsAppAttendancePage.jsx`)
**Current State:**  
This suite manages biometric attendance aggregation, ERP synchronizations, UGC < 75% defaulter lists, and the simulated WhatsApp Business webhook environment. While the simulator allows testing inbound messages ("CSE 3A present 45 absent 5") and staging queue approvals, clicking "Load Demo Reports" only updates component memory state without persisting to the database, and the message logs table exhibits horizontal cutoff on standard laptop viewports.

**15 Improvements:**
1. **[Bug] Ephemeral Demo Reports Disappear on Refresh:** In `WhatsAppAttendancePage.jsx` (lines 103–140), `handleLoadDemoReports` sets `demoLogs` solely in component state (`setLogsList`). Refreshing the browser instantly wipes all sample data back to an empty state.
2. **[Bug] Hardcoded Webhook URL in Simulator:** Line 25 displays a hardcoded backend URL `https://eduflow-backend-jvn8.onrender.com/api/v1/whatsapp/webhook`. If running in local development (`localhost:3000`) or a custom staging domain, the displayed webhook URL is wrong.
3. **[Bug] Roll Number and Phone Number Formatting Inconsistencies:** In `AttendanceIntegrationPage.jsx` (lines 354–360), student roll numbers and phone numbers are displayed with mixed casing and inconsistent spacing without standardization formatters.
4. **[Bug] Missing Error State on CSV Upload Failure:** In `AttendanceIntegrationPage.jsx`, uploading a malformed CSV file logs to console but does not display a clear alert explaining which rows had invalid formats.
5. **[Feature] Real-Time Biometric Scanner Webhook Gateway:** Implement an active WebSocket listener or polling status indicating live connectivity to hardware biometric devices (e.g., ZKTeco, eSSL) deployed across campus gates.
6. **[Feature] Bulk WhatsApp Parent Alert Dispatcher:** Add a single-click modal to trigger customized template WhatsApp messages to all parents of students falling below 75% attendance with personalized student name, percentage, and meeting schedule.
7. **[Feature] Interactive Message Simulator with Instant Staging:** When a simulated message is posted in `WhatsAppAttendancePage.jsx`, automatically update the Staged Queue without requiring the user to manually click "Refresh".
8. **[Feature] Multi-Filter Support on Message Logs:** Add search and filter bars to query message logs by phone number, student roll number, date range, or message delivery status (`DELIVERED`, `READ`, `FAILED`).
9. **[UI] Message Body Column Truncation & Table Cutoff:** In `WhatsAppAttendancePage.jsx` (line 445), the table is constrained with `minWidth: '600px'` inside a card, causing the body message column (`maxWidth: '280px'`) to cut off multi-line alert texts on mobile.
10. **[UI] Staged Queue Approve/Reject Visual Clarity:** Approve and Reject buttons in the staged attendance table use tiny text buttons (`Approve`, `Reject`). Replace with clear green checkmark and red cross icon buttons with tooltips.
11. **[UI] Defaulter Percentage Badge Contrast:** In `AttendanceIntegrationPage.jsx` (line 365), `<span className="badge bg-danger text-white">` against white table rows has harsh glare in light mode and lacks visual hierarchy.
12. **[UI] Absence Count Warning Visual Hierarchy:** Students with 16+ absences look visually identical in the table to those with 10 absences. Add graduated color indicators (Amber for 10-12, Red for 13-15, Dark Crimson for 16+).
13. **[A11y] Missing Table Caption & Summary:** Neither the At-Risk table nor the WhatsApp logs table include `<caption>` elements or `aria-describedby` summaries explaining table contents to assistive screen readers.
14. **[A11y] Inaccessible Status Indicators in Logs:** Outbound and Inbound message direction is indicated by tiny diagonal arrows (`ArrowDownLeft`, `ArrowUpRight`) without screen-reader accessible text labels.
15. **[A11y] Form Control Associations in WhatsApp Simulator:** Simulator phone input and message textarea lack explicit `<label htmlFor="...">` bindings, failing WCAG 3.3.2 (Labels or Instructions).

---

## 7. Finance & Portal Connections (`src/pages/finance/FinanceDashboardPage.jsx` & `PortalConnectionPage.jsx`)
**Current State:**  
The finance module handles fee collection snapshots, aging defaulter matrices, payment reconciliation queues, Dean waiver approvals, and external database portal connectors (MySQL, PostgreSQL, Oracle, Fedena). However, the portal connection test button simulates success under all conditions (even with invalid credentials or network dropouts), and the UPI collection screen relies on an unauthenticated third-party public API to generate QR images.

**15 Improvements:**
1. **[Bug] False Success on Portal Connection Tests:** In `PortalConnectionPage.jsx` (lines 148–155), the `catch` block and error branches explicitly set `setTestStatus('success')` and toast "Connection test verified", completely masking invalid hostnames, wrong passwords, and network failures.
2. **[Bug] Third-Party Public QR Code Privacy Leak:** In `UPICollectionPage.jsx`, dynamic payment QR codes are generated by sending student fee amounts and institutional UPI IDs to `api.qrserver.com`. This exposes internal financial telemetry to an external third-party server and fails in air-gapped environments. Replace with an in-bundle SVG QR generator (`qrcode.react`).
3. **[Bug] Unenforced Dean Waiver Authorization Gate:** In `FinanceDashboardPage.jsx`, waiver approval buttons can be clicked by accounts staff without verifying if the user has statutory Dean credentials, violating the Dean Financial Policy ordinance.
4. **[Bug] Hardcoded 12-Month Financial Trend Data:** Lines 39–52 in `FinanceDashboardPage.jsx` display a static mock array of monthly collections (Nov through Oct) that never updates after manual fee reconciliations.
5. **[Feature] Direct Bank Statement Parser (MT940 & Excel):** Add a drag-and-drop ingestion interface for official bank reconciliation files (SBI, HDFC, ICICI) that automatically matches UTR numbers against unpaid student invoices.
6. **[Feature] GST Form 10B Compliance Exemption Audit:** Provide automated verification reports confirming that $\ge 85\%$ of institutional collections are applied towards educational objectives under Section 10(23C) non-profit rules.
7. **[Feature] Graduated Defaulter Notice Generation:** Enable 1-click batch generation of Tier 1 (polite reminder), Tier 2 (formal notice), and Tier 3 (statutory Dean summons) PDF demand notices with dynamic rupee amounts.
8. **[Feature] Test Connection Diagnostic Breakdown:** When testing database portal connections (MySQL/Oracle), display round-trip latency (ms), database engine version, SSL status, and schema permissions.
9. **[UI] Rupee Formatting Inconsistencies:** Rupee amounts are displayed inconsistently (some as `₹18450000`, others as `₹1,84,50,000` using Indian Lakh/Crore numbering). Enforce standard `formatRupees` helper across all cards.
10. **[UI] Portal Connection Modal Field Clutter:** In `PortalConnectionPage.jsx`, the "Add Source" modal shows all fields (Host, Port, Database, API Key, Sheet ID) simultaneously regardless of selected source type. Dynamically hide database fields when "Google Sheets" or "Biometrics" is selected.
11. **[UI] Reconciliation Match Confidence Badges:** Match confidence badges (`HIGH`, `MEDIUM`, `LOW`) use unstyled text. Style with green/amber/red pills and display matching algorithm score percentage.
12. **[UI] Fee Collection Workflow Tabs Layout Shift:** Switching between "Batch Invoice Dispatch", "Manual UTR Entry", and "Waiver Approvals" causes vertical height jumping that disrupts page scroll position.
13. **[A11y] Missing Form Input Error Descriptors:** In `FinanceDashboardPage.jsx`, manual UTR submission inputs lack `aria-invalid` and `aria-errormessage` links when submitted empty.
14. **[A11y] Inaccessible QR Code Image:** The generated UPI QR code image lacks an informative `alt` tag detailing the payee name, VPA, and amount for visually impaired users.
15. **[A11y] Keyboard Navigation Trap in Portal Preview Modal:** When opening the "Preview Records" modal in `PortalConnectionPage.jsx`, focus is not trapped inside the dialog, allowing background table elements to receive tab focus.

---

## 8. Lead Management & CRM (`src/pages/admin/LeadManagementPage.jsx`)
**Current State:**  
The Lead Management CRM tracks prospective student inquiries, enterprise college pilot requests, and institutional demo leads. It provides status pipeline filtering (`NEW`, `CONTACTED`, `PILOT_OFFERED`, `WON`, `LOST`), pilot offer dispatching, and CRUD operations. However, lead deletion operations swallow backend errors and remove items optimistically from local state, causing "ghost leads" to reappear upon browser reload, and the table lacks pagination controls for large volumes.

**15 Improvements:**
1. **[Bug] False Deletion on Backend Error (Ghost Leads):** In `LeadManagementPage.jsx` (lines 197–202), when `DELETE /v1/leads/:id` fails, the `catch` block optimistically filters the lead out of state and shows "Lead deleted successfully". When the page reloads, the undeleted lead reappears.
2. **[Bug] Hardcoded Pilot Offer Email Body:** Lines 215–225 construct pilot offer email templates with hardcoded pricing and features, ignoring the specific service or student strength selected by the applicant.
3. **[Bug] Date Range Filter Timezone Shift:** Lines 94–100 compare `created_at` using client local time (`setHours(0,0,0,0)`), which causes leads created near UTC midnight to disappear or display in the wrong calendar date bucket.
4. **[Bug] Unhandled Error State on Lead Notes Update:** Updating internal notes does not roll back the optimistic UI state if the backend network request fails mid-flight.
5. **[Feature] Server-Side Pagination & Cursor Navigation:** The current fetch requests `limit=200` in a single query (line 61). For scaled production databases, add server-side pagination with items-per-page selectors (`25`, `50`, `100`).
6. **[Feature] One-Click Institutional Pilot Provisioning:** Add an action button on `WON` leads to instantly provision a new multi-tenant database tenant and email welcome credentials to the Dean.
7. **[Feature] CSV / Excel Export of Filtered Lead Lists:** Provide an export button allowing admissions teams to download filtered candidate cohorts for offline calling campaigns.
8. **[Feature] Automated WhatsApp Status Webhook Integration:** When a lead's status is changed to `PILOT_OFFERED`, automatically dispatch a WhatsApp confirmation message to the applicant's registered phone number.
9. **[UI] Filter Bar Spacing & Wrap Collapse:** On screen widths between 768px and 1024px, the status dropdown, automation type filter, and two date inputs wrap into an uneven, broken multi-row layout. Consolidate into a responsive filter toolbar.
10. **[UI] Lead Detail Slide-Over Animation Glitch:** Opening a lead's detailed dossier renders instantly without a smooth transition or backdrop blur, creating an abrupt visual jump.
11. **[UI] Status Badge Color Uniformity:** `NEW` and `WON` both use blue shades in certain CSS rules. Enforce distinct colors: `NEW` (Cyan), `CONTACTED` (Indigo), `PILOT_OFFERED` (Purple), `WON` (Green), `LOST` (Gray).
12. **[UI] Missing Empty Search Result State:** When date filters return zero leads, the table shows a completely blank white box without an icon or "No leads match your criteria" empty state.
13. **[A11y] Missing Confirmation Dialog Accessibility:** The delete action uses raw `window.confirm()` (line 183), which behaves inconsistently across screen readers and mobile browsers. Replace with an accessible accessible ARIA modal.
14. **[A11y] Unannounced Status Filter Changes:** Changing the status filter updates the list without notifying screen readers of how many matching records remain.
15. **[A11y] Low Contrast on Date Input Placeholders:** The placeholder text in the date filter inputs has a contrast ratio below 3:1 against white backgrounds.

---

## 9. Login & Onboarding (`src/pages/public/LoginPage.jsx` & `InstitutionRegister.jsx`)
**Current State:**  
The login and registration flow supports institutional Single Sign-On (Google Workspace OIDC, Shibboleth/SAML 2.0, LDAP), demo credential auto-fill buttons (Admin and Dean), emergency database seeding triggers, and a 3-step institutional registration wizard. However, the input fields still suffer from left padding alignment glitches when icons are present, error alerts render raw unformatted strings, and the 3-step registration wizard allows navigating between steps without field validation.

**15 Improvements:**
1. **[Bug] Left-Padding Input Clipping with Icons:** In `LoginPage.jsx`, standardizing input padding with fixed left icons causes text characters to disappear behind the SVG icon on initial focus in certain browsers (Chrome on Linux).
2. **[Bug] Hardcoded Emergency Seed URL:** Line 502 links to `https://eduflow-backend-jvn8.onrender.com/api/v1/auth/emergency-seed?secret=eduflow2026`. This hardcoded URL bypasses local development servers and custom enterprise staging environments.
3. **[Bug] Unvalidated Step Progression in Institution Registration:** In `InstitutionRegister.jsx`, clicking "Next Step" allows users to advance from Step 1 to Step 2 even if mandatory fields (e.g. Subdomain, Official Email) are completely blank.
4. **[Bug] Unhandled SSO Callback Failures:** In `LoginPage.jsx` (lines 85–100), if SAML or Google Workspace callback returns a non-200 status, the loading spinner spins indefinitely without displaying an error alert.
5. **[Feature] Password Strength Meter in Registration:** Add an interactive real-time entropy calculator (checking length, uppercase, numbers, symbols) on Step 2 of `InstitutionRegister.jsx` to prevent weak admin passwords.
6. **[Feature] Live Subdomain DNS Availability Check:** While typing the institution subdomain (e.g., `ssit`), perform a debounced live API lookup against `/v1/institutions/check-subdomain` and display a green checkmark or red "Subdomain taken" badge.
7. **[Feature] Magic Link / Passwordless Email Login:** Provide a "Send Magic Login Link" option for Deans and senior faculty who prefer not to enter complex passwords during mobile inspections.
8. **[Feature] Remember Me Token Persistence via Cookies/LocalStorage:** Fully wire the "Remember Me" checkbox (line 31) to persist a secure 30-day refresh token rather than merely saving the email string.
9. **[UI] Auto-Fill Buttons Visual Hierarchy:** The "Fill Admin Credentials" and "Fill Dean Credentials" buttons currently dominate the page above the real login form, confusing standard production users. Place them in a collapsible or clearly marked "Demo Sandbox" side-panel.
10. **[UI] Password Visibility Toggle Eye Icon Alignment:** The password show/hide eye icon is misaligned vertically by 3px within the input field container, causing an asymmetrical border gap.
11. **[UI] Error Alert Box Text Overflow:** When database connection errors occur, long technical stack traces or service unavailable messages overflow the container boundaries without wrapping properly.
12. **[UI] Multi-Step Registration Progress Indicator:** Step numbers (1, 2, 3) lack responsive labels on mobile devices, displaying unstyled floating numbers without descriptions.
13. **[A11y] Missing Form `<label>` Elements for Credentials:** Several input fields rely purely on `placeholder` attributes without linked `<label htmlFor="...">` tags, violating WCAG 1.3.1.
14. **[A11y] Eye Icon Toggle Lacks `aria-pressed` State:** The password visibility toggle button lacks an `aria-pressed` or `aria-label="Show password as plain text"` attribute for screen readers.
15. **[A11y] Inaccessible Checkbox Controls:** Custom checkbox styling in the Terms & Conditions agreements fails keyboard navigation focus states (Tab + Spacebar selection).

---

## 10. Global UI, Settings & Docs (`src/components/NavBar.jsx`, `Sidebar.jsx`, & `pages/public/DocsPage.jsx`)
**Current State:**  
The global shell provides the top navigation bar, collapsible role-based sidebar, multi-language selector, theme toggler, real-time WebSocket connection pill, and interactive API documentation. However, the dark mode stylesheet causes white-on-white text in specific dropdown menus, the notification bell badge occasionally displays phantom unread counts, and wide markdown tables in `DocsPage.jsx` force horizontal overflow on tablet and mobile viewports.

**15 Improvements:**
1. **[Bug] Dark Mode White-on-White Text Glitch:** In `NavBar.jsx`, the language selector dropdown and user profile dropdown inherit hardcoded `.dropdown-menu { background: #ffffff; }` in specific CSS rules while text color adapts to dark mode (`color: #f8fafc`), making dropdown text completely invisible.
2. **[Bug] Phantom Unread Notification Badge:** In `NotificationCenter.jsx`, if the network request fails or returns an empty array, `unreadCount` can retain stale integer values from prior sessions, showing a persistent red notification dot when no unread notifications exist.
3. **[Bug] Duplicate Theme Keys in LocalStorage:** `NavBar.jsx` writes to both `eduflow-ai-theme` and `eduflow-ai-dark-mode` while cleaning up `sri-sudha-theme`, but other legacy components still check `sri-sudha-theme`, creating conflicting theme states.
4. **[Bug] Docs Page Sidebar Mobile Navigation Collapse:** In `DocsPage.jsx`, on screen widths below 992px, the left category navigation sidebar is completely hidden, leaving mobile users unable to jump between API, Webhook, and Architecture documentation sections.
5. **[Feature] Global Omnibar Search Command Palette (Ctrl+K):** Upgrade `GlobalSearch.jsx` into a keyboard-first command palette (accessible via `Ctrl+K` or `Cmd+K`) allowing instant jumping to students, faculty, AI officers, or system settings.
6. **[Feature] Dark/Light Theme System Sync:** Add a "Sync with System OS" option to the theme switcher so EduFlow automatically mirrors the user's macOS/Windows/Linux dark mode preferences.
7. **[Feature] API Docs Interactive "Try It Live" Sandbox:** Add a functional cURL / Fetch runner inside `DocsPage.jsx` that lets developers execute live test requests against `/v1/health` and `/v1/naac/score` using their active session token.
8. **[Feature] In-App Notification Sound & Push Webhook:** Add an optional audio chime and browser Web Push notification for high-priority student safety or server downtime alerts.
9. **[UI] Docs Markdown Tables Screen Overflow on Mobile:** Wide REST endpoint and parameter tables in `DocsPage.jsx` force the entire document body into horizontal overflow on mobile screens. Wrap all documentation tables in responsive scroll containers with visual shadow indicators.
10. **[UI] Top Navbar Overlap on Fixed Viewports:** On specific laptop screen heights, the sticky navbar (`position: sticky; top: 0`) overlaps the topmost padding of inner page cards, obscuring page titles.
11. **[UI] Sidebar Collapse Icon Misalignment:** When the sidebar is collapsed into mini-icon mode (`width: 80px`), module icons are off-center by 6px, and text labels clip awkwardly against the edge.
12. **[UI] Notification Bell Ringing Animation Stutters:** The CSS keyframe animation for new notifications stutters when multiple real-time WebSocket events arrive simultaneously.
13. **[A11y] Missing Skip-to-Content Link:** The application shell lacks a "Skip to Main Content" link at the very top of the DOM, forcing keyboard-only users to tab through the entire sidebar and navbar on every page load (WCAG 2.4.1).
14. **[A11y] Inaccessible Theme Switcher Toggle:** The theme toggle button lacks an `aria-label` describing its current state and action (e.g., `aria-label="Switch to dark theme"`).
15. **[A11y] Poor Color Contrast on Inactive Sidebar Links:** Inactive navigation links in `Sidebar.jsx` use `rgba(255,255,255,0.45)`, which fails the minimum 4.5:1 contrast ratio against the dark navy background (`#0A0E27`).
