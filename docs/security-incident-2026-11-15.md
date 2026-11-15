# Security Incident Report — PostgreSQL Credential Exposure & Remediation

**Date:** 2026-11-15  
**Severity:** HIGH  
**Status:** REMEDIATED (Hardened in codebase + Rotation advisory logged)  
**Affected Resource:** PostgreSQL database instance hosted on Render (`eduflow_7n3y`)

---

## 1. Summary of Incident
During local test suite execution, seeder scripts in `eduflow-backend/scripts/` (`seed-demo.js`, `seed-dean-account.js`, `seed-naac-data.js`) were evaluated during module loading. Because fallback database URLs in those scripts referenced a remote Render database host (`dpg-*****.singapore-postgres.render.com`), test workers attempted remote connections and logged connection strings to terminal output and test logs.

## 2. Information Exposed
- Remote PostgreSQL hostname (`*.singapore-postgres.render.com`)
- Database user (`database_user`)
- Database name (`eduflow_7n3y`)
- Masked/plaintext connection strings in test logs

## 3. Immediate Remediation Actions Taken
1. **Network & Test Isolation Guard (P0.1)**:
   - Added `eduflow-backend/tests/helpers/testDb.js` providing in-memory pool emulation for `NODE_ENV=test` and `DB_MODE=memory`.
   - Added fatal assertion guard in `src/app.js` and `src/db/pool.js` preventing the server or tests from booting if `process.env.NODE_ENV === 'test'` targets any remote cloud provider (`render.com`, `amazonaws.com`, `azure`, `gcp`).
   - Wrapped all seeder scripts with immediate test-mode bypass (`if (process.env.NODE_ENV === 'test' || process.env.DB_MODE === 'memory') { return; }`).
2. **Credential Scrubbing**:
   - Scrubbed all host and connection string references from documentation, test suites, and git tracking.
   - Verified `.gitignore` prevents `.env` tracking in repository root and `eduflow-backend/`.

## 4. Manual Rotation Required in Render Dashboard
The user must perform the following actions in the Render Cloud Console:
1. Log into the Render dashboard: `https://dashboard.render.com`.
2. Navigate to the PostgreSQL database service `eduflow_7n3y`.
3. Under **Access Control / Info**, click **Reset Password** for `database_user`.
4. Update the `DATABASE_URL` environment variable in the corresponding EduFlow backend web service.
5. Deploy a restart of the web service.

## 5. Monitoring & Ongoing Detection
- Monitor Render access logs and connection metrics for unexpected connection spikes from unknown IP addresses.
- Automated CI and test runners now enforce zero network DB access under `NODE_ENV=test DB_MODE=memory`.
- Any git commit containing plaintext credentials or remote hostnames is blocked by audit checks.
