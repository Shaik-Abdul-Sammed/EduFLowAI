# 🎯 EduFlow AI OS — Demo Day Master Checklist

> **Target Audience:** College Principal, Dean of Academics, Directors  
> **Target Duration:** 10 Minutes (Scripted, Controlled Flow)  
> **Core Principle:** Show 5 features flawlessly. Never allow free-form exploration into mock screens.

---

## ⏱️ Timeline Countdown

### 📅 24 Hours Before the Demo
- [ ] **Force PostgreSQL Mode**: Verify `DB_MODE=postgres` in `eduflow-backend/.env`.
- [ ] **Execute Seed Script**:
  ```bash
  node eduflow-backend/scripts/seed-demo.js
  ```
- [ ] **Verify Seeded Data**:
  - Admin login: `admin@demo.edu` / `Demo@2026`
  - 50 student records exist (10 flagged as high risk)
  - 5 real audit log entries present in database
- [ ] **Verify Demo Mode Gating**:
  - Verify `VITE_DEMO_MODE=true` in `eduflow-core/web/.env`.
  - Confirm sidebar hides student/faculty/parent portals.
- [ ] **Pre-test LLM Prompts**:
  - Test Accreditation Officer with: `"Generate NAAC Criteria 2"`
  - Test Student Success Officer with: `"Predict student dropout risk"`
  - Confirm token latencies are under 10 seconds.
- [ ] **Prepare Backup Assets**:
  - Have pre-exported NAAC Criteria 2 PDF report in `/reports/` ready in case of internet drops.

---

### ⏰ 1 Hour Before the Demo
- [ ] **Restart Services Cleanly**:
  ```bash
  # Start Backend
  npm --prefix eduflow-backend start

  # Start Frontend
  npm --prefix eduflow-core/web run dev
  ```
- [ ] **Run Pre-Demo Health Check**:
  ```bash
  bash scripts/demo-check.sh
  ```
  *Ensure all 5 checks return `[✅ PASS]`.*
- [ ] **Verify Database Persistence**:
  - Make a test search or login.
  - Restart the backend process.
  - Verify audit log count remains intact.
- [ ] **Laptop Prep**:
  - Plug into AC power (do not run on battery).
  - Turn on **Do Not Disturb** / Disable Slack, WhatsApp, and email popups.
  - Ensure external display scaling is set to 1080p (readable projection).

---

### ⏱️ 5 Minutes Before the Demo
- [ ] **Browser Setup**:
  - Open Chrome/Brave in Fullscreen (`F11` or maximize).
  - Navigate to `http://localhost:5173/login`.
  - Zoom browser to **110%** for clear projection visibility.
  - Close all other tabs and developer consoles.
  - Pre-fill credentials: `admin@demo.edu` / `Demo@2026`.

---

## 🎬 The 10-Minute Scripted Demo Flow

| Time | Stage | Action | Talking Points |
|---|---|---|---|
| **0:00 - 1:30** | **1. Login & Multi-Tenancy** | Click "Sign In". Show auto-theme loading (Sri Sudha Institute branding). | *"EduFlow AI OS isn't just software; it's an AI administrative workforce custom-tuned to your institution's charter and policies."* |
| **1:30 - 3:00** | **2. Institution Dashboard** | View live ROI metrics, faculty count, and active officers summary. | *"Your executive team sees real-time administrative bandwidth saved, faculty capacity, and compliance readiness at a glance."* |
| **3:00 - 5:30** | **3. AI Accreditation Officer** | Navigate to `/officer/accreditation`. Click chip: `Generate NAAC Criteria 2`. | *"Consultants charge ₹2,500/hour and take 4 months for an SSR. Watch our Accreditation Officer cross-examine curriculum matrices and draft Criteria 2 in 8 seconds."* |
| **5:30 - 7:30** | **4. AI Student Success Officer** | Navigate to `/officer/student-success`. Click chip: `Predict student dropout risk`. | *"Notice it caught 10 students falling below the 60% attendance threshold with active backlogs before midterm exams, automatically drafting faculty mentor interventions."* |
| **7:30 - 8:45** | **5. Audit Logs & Governance** | Open `/admin-dashboard/audit-logs`. Show cryptographically signed timestamped records. | *"Every AI action, report generation, and admin override is permanently recorded in your institutional audit ledger for statutory compliance."* |
| **8:45 - 10:00** | **6. The Ask & Next Steps** | Transition to Q&A / Pilot deployment proposal. | *"We can deploy Sri Sudha Institute's dedicated AI workspace this week for your upcoming NAAC cycle. Shall we initiate the onboarding setup?"* |

---

## 🚫 What NEVER to Show During the Demo

> [!CAUTION]
> Navigating to these areas will show mock data or unrouted endpoints and will break institutional credibility:

1. ❌ **Student Portal** (All 24 student pages — mock data arrays)
2. ❌ **Faculty Portal** (All 15 faculty pages — in-memory state only)
3. ❌ **Parent Portal** (All 15 parent pages)
4. ❌ **Hostel Allocation & Campus Assets** (Orphan mock controllers)
5. ❌ **Transport & Live GPS Tracking** (Mock GPS interval)
6. ❌ **Mobile App** (Flutter UI not yet connected to production API)
7. ❌ **Online Fee Payment Gateway** (No Razorpay/Stripe integrated)
8. ❌ **WhatsApp / SMS Automation** (Only code comments exist)

---

## 🛡️ Emergency Recovery Protocol

- **Scenario A: LLM API times out (>15s delay)**
  - *Action:* Do not panic or re-click 10 times. Say: *"The officer is synthesizing across multi-semester criteria."* If it fails, click the prompt chip once more (the backend automatically triggers the fallback chain).
- **Scenario B: Dean asks: "Can I see the student attendance entry screen?"**
  - *Action:* Say: *"Today's preview focuses strictly on the Executive Intelligence layer — Accreditation and Student Success. Faculty operational inputs are scheduled for our Phase 2 technical rollout."*
- **Scenario C: Backend process halts or server crashes**
  - *Action:* Keep the browser on the pre-rendered screen. Open your pre-generated PDF report: *"Here is an example of the finalized high-resolution NAAC Self-Study export produced directly by the engine."*

---

## 🏁 Post-Demo Actions
- [ ] Export audit log record verifying demo activity.
- [ ] Note specific criteria queries the Dean asked about.
- [ ] Send follow-up summary with sample NAAC report PDF within 2 hours.
