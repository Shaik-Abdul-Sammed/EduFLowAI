# EduFlow AI OS — Production Runbook

## Section 1 — Prerequisites
- Node.js >= 20.0.0
- PostgreSQL 16+ with SSL enabled
- Domain with DNS A / CNAME records pointed to host
- Active AI provider API keys (Google Gemini / OpenAI GPT-4 / Anthropic Claude)
- Minimum 4GB RAM, 2 vCPU VPS or Render standard web service

## Section 2 — Domain Setup (Custom Domain via Render)
1. Add custom domain `portal.yourcollege.edu` on the Render dashboard under Service Settings.
2. In your institutional DNS registrar (GoDaddy/Cloudflare/NIC.in), create:
   - `CNAME` pointing `portal.yourcollege.edu` to `eduflow-web.onrender.com`
   - `CNAME` pointing `api.yourcollege.edu` to `eduflow-backend-jvn8.onrender.com`
3. Verify DNS propagation using `dig +short portal.yourcollege.edu`.

## Section 3 — Environment Variables Checklist
- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL=postgres://user:password@hostname:5432/eduflow?sslmode=require`
- `JWT_SECRET=min-64-character-random-hex-string`
- `JWT_REFRESH_SECRET=min-64-character-random-hex-string`
- `CORS_ORIGIN=https://portal.yourcollege.edu`
- `AI_PROVIDER=gemini`
- `AI_API_KEY=your-gemini-pro-api-key`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_AUTH=150`

## Section 4 — Database Migration Steps
1. Connect via psql: `psql $DATABASE_URL`
2. Execute migration series in order:
   ```bash
   for f in src/db/migrations/*.sql; do psql $DATABASE_URL -f "$f"; done
   ```
3. Confirm table integrity: `\dt`

## Section 5 — Seeding Real Data
1. Launch onboarding wizard at `/admin-dashboard/onboarding`
2. Alternatively run institutional seed: `node scripts/seed-demo.js`
3. Verify initial departments and HOD credentials.

## Section 6 — SSL Certificate Verification
1. Render / Nginx provisions Let's Encrypt certificates automatically.
2. Validate using `openssl s_client -connect portal.yourcollege.edu:443 -servername portal.yourcollege.edu`.
3. Confirm HTTP Strict Transport Security (HSTS) headers return `max-age=31536000`.

## Section 7 — Monitoring Setup
- Health endpoint: `GET /api/v1/monitoring/health`
- Uptime robot ping set to 60-second intervals for `/api/health`.
- Client-side error telemetry reporting to `/api/v1/monitoring/client-error`.

## Section 8 — Backup Scheduling
- Nightly cron job runs `node src/workers/backupVerifier.js` at 02:00 AM IST.
- Manual trigger endpoint: `GET /api/v1/admin/backup/verify`.
- Exports zipped archive via `GET /api/v1/institution/export`.

## Section 9 — User Provisioning for First College
1. Superadmin sets college profile.
2. Invite HODs for CSE, ECE, EEE, Mechanical, Civil, IT, AI, MBA.
3. Import faculty and student rosters using batch CSV templates.
4. Establish delegated staff permissions for Timetable & Accreditation coordinators.

## Section 10 — First Week Support Checklist
- Day 1: Verify all faculty can log in without session timeouts.
- Day 2: Test Academic Calendar generation with regional holidays.
- Day 3: Verify Attendance CSV ingestion with portal fallback.
- Day 4: HOD drafts first conflict-free timetable revision.
- Day 5: Generate Criterion 1 & 2 NAAC SSR drafts.
- Day 6: Test invoice creation and UPI QR remittance.
- Day 7: Execute full data export verification.

## Section 11 — Common Issues and Fixes
- **Issue: CORS error on frontend**  
  *Fix:* Confirm `CORS_ORIGIN` matches exact protocol and domain in Render env.
- **Issue: AI token timeout**  
  *Fix:* Provider automatic fallback chain transitions to cached SSR templates without blocking.
- **Issue: Session expired too fast**  
  *Fix:* Adjust `sessionTimeoutMinutes` in Institution Settings.

## Section 12 — Rollback Procedure
1. Revert Render commit or checkout prior git tag: `git checkout v1.0.0`
2. Run database rollback if schema modified.
3. Restart application service.

## Section 13 — On-Call Escalation Contacts
- Lead Engineer: Shaik Abdul Sammed (Lead Full-Stack)
- Cloud Operations: devops@eduflow.ai
- Institutional Support Desk: support@eduflow.ai / +91-800-EDU-FLOW
