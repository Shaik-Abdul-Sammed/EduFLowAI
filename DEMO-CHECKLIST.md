# EduFlow AI - Demo Lockdown Runbook & Presenter Checklist

Follow this 10-step protocol **10 minutes before** a live presentation to a College Dean, Vice-Chancellor, or Smart India Hackathon (SIH) evaluation panel to guarantee a flawless, bulletproof demonstration with zero downtime, crashes, or empty states.

---

## 📋 10-Step Pre-Demo Checklist

1. **Verify & Reset Pristine Demo Data**
   Trigger the demo lockdown reset to ensure all database tables (`demo_students`, `demo_faculty`, `demo_courses`, `invoices`, `leads`, `student_attendance`) are populated with consistent, factory-grade demo records:
   ```bash
   curl -X POST "https://eduflow-api.onrender.com/api/v1/admin/reset-demo-data?secret=eduflow2026"
   # Or locally:
   curl -X POST "http://localhost:5001/api/v1/admin/reset-demo-data?secret=eduflow2026"
   ```
   *Expected Response:* `{"success": true, "message": "Demo dataset successfully wiped and re-seeded..."}`

2. **Verify Backend Health & Readiness**
   Ping the health check endpoint to verify database connectivity, uptime, and AI engine status:
   ```bash
   curl -i https://eduflow-api.onrender.com/health
   # Or locally:
   curl -i http://localhost:5001/health
   ```
   *Expected Response:* HTTP `200 OK` with status `online`.

3. **Open Frontend in a Clean Incognito / Private Window**
   Always launch the application in an Incognito window (`Ctrl + Shift + N` or `Cmd + Shift + N`) to bypass stale service worker caches, previous sessions, or lingering tokens:
   - Live URL: `https://eduflow-web.onrender.com`
   - Local URL: `http://localhost:5173`

4. **Demonstrate One-Tap Access via the Demo Credentials Card**
   On the login page, point out the prominent **Try the Demo** card and click the **Fill Admin Credentials** button. This automatically populates:
   - Email: `admin@demo.edu`
   - Password: `Demo@2026`
   Click **Sign In** to transition smoothly into the workspace dashboard.

5. **Execute the Standard AI Officer Showcase Sequence**
   Walk through the five autonomous AI Officers in this exact order to show end-to-end institutional workflow coverage:
   1. **Accreditation Officer (NAAC / NIRF):** Automated SSR generation, metric gap analysis, and peer benchmarking.
   2. **Timetable Officer:** NEP 2020 credit allocation, faculty load balancing, and automated room clash resolution.
   3. **Student Success Officer:** Early warning dropout indicators, attendance telemetry, and assigned faculty mentors.
   4. **Finance & Fee Officer:** Fee reconciliation, aging buckets, defaulter follow-ups, and automated reminder dispatches.
   5. **Admissions Officer:** Multi-channel lead intake, conversion funnel tracking, and automated document verification.

6. **Trigger Streaming Report Generation on Accreditation Officer**
   Navigate to the Accreditation Officer and click **Generate Criterion Report** (or prompt for *Criterion 2* / *Sanctioned Intake*). Point out the smooth token-by-token streaming output simulating live generative AI inference without UI freezes.

7. **Demonstrate Real-Time Academic Calendar & State Holiday Sync**
   Open the **Academic Calendar** module. Switch the State dropdown (e.g., *Telangana* to *Maharashtra*) or change the Academic Year. Show how Central and State gazetted holidays instantly refresh, UGC 90-day teaching norms recalculate, and exam milestones dynamically cascade.

8. **Showcase Non-Teaching Staff Delegation & Dean Approval Control**
   Open the **Staff Activity & Delegation** panel. Explain how Deans and HODs delegate routine data preparation to administrative assistants with `DRAFT` permissions. Highlight the audit trail and show that generated reports require Dean approval before formal submission.

9. **Present WhatsApp & Multi-Modal Attendance Ingestion**
   Navigate to the WhatsApp Attendance interface. Explain how non-technical faculty send daily attendance photos or roster texts over WhatsApp, which are parsed and staged for one-click admin confirmation with zero manual spreadsheet entry.

10. **Emergency Fallback Safety Net**
    If the presenter's laptop loses internet connectivity or third-party LLM rate limits hit mid-presentation:
    - Press `Ctrl + Shift + R` (hard reload).
    - The client-side fail-safe and the backend `FallbackProvider` / `MockProvider` will automatically step in without errors or broken states, maintaining realistic domain-specific output across all 5 officers.
