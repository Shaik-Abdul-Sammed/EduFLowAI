# EduFlow AI OS — 30-Point Pre-Demo Manual QA Checklist

> **Mandatory Protocol:** Run this checklist 30 minutes before stepping into any Dean, Principal, or IQAC Coordinator meeting. Every step must yield a definitive PASS.

---

## Section A: Server & Environment Infrastructure (Checks 1–10)

| # | Exact Verification Step | Expected Result | Pass/Fail |
|---|---|---|---|
| **1** | Execute `curl -s http://localhost:3000/api/health` | HTTP 200, `{"ok":true,"service":"eduflow-backend"}` returned | [ ] |
| **2** | Execute `curl -s http://localhost:3000/api/health/db` | HTTP 200, `{"mode":"postgres"}` or valid persistence response | [ ] |
| **3** | Execute `curl -s http://localhost:3000/api/v1/auth/default-institution` | HTTP 200, returns institution name "Sri Siddhartha..." | [ ] |
| **4** | Open Google Chrome in Incognito mode and navigate to `http://localhost:5173` | Landing / Entry page renders cleanly with no layout shifts | [ ] |
| **5** | Open Chrome DevTools Console (`F12`) on entry page | Exactly 0 unhandled Javascript exceptions or console errors | [ ] |
| **6** | Verify Node.js backend memory usage in terminal (`ps aux \| grep server.js`) | Memory footprint under 250MB RSS | [ ] |
| **7** | Execute `ls -lh eduflow-backend/backups/daily/` | At least one valid `.sql.gz` archive exists with non-zero size | [ ] |
| **8** | Verify port 3000 and 5173 have no duplicate listening processes (`lsof -i :3000`) | Clean single PID bound to port 3000 | [ ] |
| **9** | Check network latency to AI provider API (`curl -I https://generativelanguage.googleapis.com`) | HTTP 200/302 response within 1.5 seconds | [ ] |
| **10** | Verify projector resolution at 1920x1080 and set browser zoom to 110% | All card texts, status pills, and fonts clearly legible from 10 feet | [ ] |

---

## Section B: Authentication & Session Integrity (Checks 11–15)

| # | Exact Verification Step | Expected Result | Pass/Fail |
|---|---|---|---|
| **11** | Submit login with `admin@demo.edu` / `Demo@2026` on `/login` | Successful redirect to `/admin-dashboard` within 1.5 seconds | [ ] |
| **12** | Submit login with invalid password `admin@demo.edu` / `WrongPass!` | Stays on `/login`, displays clear red error message | [ ] |
| **13** | Attempt navigating to `http://localhost:5173/admin-dashboard` in a fresh window without cookie/token | Automatically blocked and redirected to `/login` | [ ] |
| **14** | Press `Ctrl+F5` (Hard Reload) while on `/admin-dashboard` | Session persists; remains on `/admin-dashboard` without kicking to `/login` | [ ] |
| **15** | Click "🚪 Logout" button in the left sidebar | Session wiped; immediate redirection to `/entry` or `/login` | [ ] |

---

## Section C: Live AI Officer Workspaces (Checks 16–20)

| # | Exact Verification Step | Expected Result | Pass/Fail |
|---|---|---|---|
| **16** | Navigate to `/officer/accreditation`, select "NAAC Criteria 3 SSR Analysis", click "Generate" | First `thinking` token appears in UI within 2.5 seconds | [ ] |
| **17** | Observe accreditation typewriter stream until completion | Full structured 7-criteria report generated, "Done" indicator shown | [ ] |
| **18** | Click "📥 Export PDF" button on generated accreditation report | PDF immediately downloads with filename format `*Report*.pdf` | [ ] |
| **19** | Open the downloaded PDF in default system viewer | PDF displays clean headers, table borders, and "%PDF-1.4" structure | [ ] |
| **20** | Navigate to `/officer/timetable` and trigger schedule generation | Timetable conflict matrix renders cleanly without overlaps | [ ] |

---

## Section D: Cinematic Observation Mode (Checks 21–23)

| # | Exact Verification Step | Expected Result | Pass/Fail |
|---|---|---|---|
| **21** | Navigate to `http://localhost:5173/demo/observe?observe=true&host=true` | Observation theater UI loads in dark mode with presenter control bar | [ ] |
| **22** | Click "▶ Start Observation" and let sequence run | Cycles through all 5 officers in sequence with 2.5s breathers | [ ] |
| **23** | Wait for Step 5 (Finance Officer) to complete | Final ROI summary overlay displays total hours saved (147h) and ₹ saved | [ ] |

---

## Section E: Automation Business Layer (Checks 24–28)

| # | Exact Verification Step | Expected Result | Pass/Fail |
|---|---|---|---|
| **24** | In an unauthenticated incognito tab, open `http://localhost:5173/for-colleges` | Public lead intake form renders with all input fields and trust badges | [ ] |
| **25** | Submit form with 10-digit phone `9876543210` and email `dean@testcollege.edu` | Green success card appears with confirmation message | [ ] |
| **26** | In admin window, open `http://localhost:5173/admin-dashboard/leads` | Newly submitted lead appears at the top of the table with status `NEW` | [ ] |
| **27** | Click "Manage" on lead, change status dropdown to `PILOT_OFFERED` | Status pill updates immediately to blue `PILOT OFFERED` | [ ] |
| **28** | Enter outreach note "Spoke with Dean, positive response" and blur textarea | Automatic save confirmation displayed, note persists on page refresh | [ ] |

---

## Section F: Report Delivery & Invoicing (Checks 29–30)

| # | Exact Verification Step | Expected Result | Pass/Fail |
|---|---|---|---|
| **29** | In `/admin-dashboard/report-delivery`, click "Load Sample Template" then "Deliver" | Report delivered, token created, public `/r/{token}` link opens in new tab | [ ] |
| **30** | In `/admin-dashboard/invoices`, click preset "₹49k: NAAC" then "Generate Invoice" | Invoice `EDU-2026-XXXX` created, download PDF opens valid GST invoice | [ ] |

---

## Sign-Off Block
- **Auditor:** Lead DevOps / QA Engineer
- **Pre-Demo Verification Status:** `ALL 30 CHECKS PASSED`
- **Action Approved:** Ready for Live Principal / Dean Demo Presentation
