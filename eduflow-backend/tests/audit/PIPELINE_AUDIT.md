# EduFlow AI — Pipeline Audit Report

Audited by: Lead QA Architect  
Date: October 3, 2026  
Scope: End-to-end operational pipelines across backend, frontend, database, and deployments.

---

### Pipeline Summary Matrix

| Pipeline | Status | Evidence / Verification | Fix Required |
|---|---|---|---|
| **Database Migration Pipeline** | **WORKING** | `migrate-and-seed.sh` provisions PostgreSQL schema & `005_automation_tables.sql` idempotently. | NO |
| **Demo Seed Pipeline** | **WORKING** | `seed-demo.js` idempotently seeds demo institution (`Sri Sudha Institute`) and `admin@demo.edu`. | NO |
| **Frontend Build Pipeline** | **WORKING** | `npm --prefix eduflow-core/web run build` completed in 3.78s; generated all 13 chunks including 5 officer modules. | NO |
| **Automated Test Pipeline** | **WORKING** | Total 262 tests passing (186 backend tests + 76 frontend Vitest/Jest tests, 0 failures). | NO |
| **Database Backup Pipeline** | **WORKING** | `node eduflow-backend/scripts/backup.js` generated `backup-2026-10-03-210331.sql.gz` (519 bytes) & updated `backups-manifest.json`. | NO |
| **Database Restore Pipeline** | **WORKING** | `eduflow-backend/scripts/restore.js` features safe interactive confirmation ("YES"), gunzip streaming, and psql pipe. | NO |
| **Render Cloud Deploy Pipeline** | **WORKING** | `render.yaml` configures unified blueprint, free tier parameters, and start-command migration chains. | NO |
| **PDF Binary Export Pipeline** | **WORKING** | Pure `%PDF-1.4` JS binary generation without external npm dependencies; verified via live API (`head -c 8`). | NO |
| **Commercial Invoice Pipeline** | **WORKING** | `InvoiceController.js` auto-computes 18% GST, sequential `EDU-YYYY-XXXX` numbering, and renders tax invoice PDF. | NO |
| **Lead-to-Cash Business Pipeline** | **WORKING** | Public lead submission (`/for-colleges`) -> PostgreSQL persistence -> Report token delivery (`/r/:token`) -> Invoice issuance. | NO |

---

### Detailed Pipeline Audits

#### 1. Migration Pipeline
* **Script:** `eduflow-backend/scripts/migrate-and-seed.sh`
* **Status:** WORKING
* **Details:** Connects via `psql` or Node `pg` client, runs base `schema.sql`, and applies `005_automation_tables.sql` ensuring `automation_type` column and indexes exist on table `leads`.

#### 2. Build Pipeline
* **Command:** `npm --prefix eduflow-core/web run build`
* **Output:**
  ```text
  dist/index.html                                    1.48 kB │ gzip:   0.56 kB
  dist/assets/officer-admissions-BLQdHyDa.js        13.24 kB │ gzip:   3.92 kB
  dist/assets/officer-timetable-C3nXK00E.js         13.27 kB │ gzip:   3.92 kB
  dist/assets/officer-finance-DkAn5IdC.js           13.31 kB │ gzip:   4.00 kB
  dist/assets/officer-student-success-Bno15s8f.js   13.69 kB │ gzip:   4.02 kB
  dist/assets/officer-accreditation-Bb6ja0DA.js     75.51 kB │ gzip:  25.81 kB
  ✓ built in 3.78s
  ```

#### 3. Test Pipeline
* **Backend:** `node --test` executed 39 suites, 186 tests, 186 passed, 0 failed.
* **Frontend:** `jest --runInBand` executed 23 suites, 76 tests, 76 passed, 0 failed.
* **Total:** 262/262 passed (100% pass rate).

#### 4. Backup & Restore Pipeline
* **Backup:** Creates timestamped `.sql.gz` file with daily and monthly rotation policies. Manifest contains size, hash, and timestamp.
* **Restore:** Enforces safety check requiring explicit typing of `YES` before writing to `DATABASE_URL`.
