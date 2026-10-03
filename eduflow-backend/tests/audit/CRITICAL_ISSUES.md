# EduFlow AI — Critical Architectural Issues (Manual Review Required)

The following High-Risk architectural issues have been identified during the pre-APK audit. Per QA audit protocol, these are documented for team review and staged deployment rather than patched ad-hoc.

---

### Issue 1: Multi-Tenant Database Isolation Relies on Application-Level Filters
* **File:** `eduflow-backend/src/db/pool.js` & `eduflow-backend/src/routes/*.js`
* **Issue:** Tenant data isolation is enforced at the controller/query level via `WHERE institution_id = $1`, rather than PostgreSQL Row-Level Security (RLS).
* **Why Critical:** A single omitted `WHERE` clause in any custom administrative query or analytics export could expose one institution's student records, financial balances, or accreditation gap analyses to another tenant.
* **Suggested Fix:**
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation_policy ON users 
    USING (institution_id = NULLIF(current_setting('app.current_institution_id', true), '')::integer);
  ```
* **Requires:** Migration review, connection pool hook to set `SET LOCAL app.current_institution_id` per request transaction, and regression testing across all 186 backend tests.

---

### Issue 2: Mobile APK Dynamic Base URL & Production API Endpoint Configuration
* **File:** `eduflow-core/mobile/lib/core/api_client.dart`
* **Issue:** Default API client in Flutter must be configured via `--dart-define` environment variables to prevent compiled mobile binaries from falling back to local emulator IPs (`10.0.2.2:3000` or `127.0.0.1:3000`).
* **Why Critical:** If an APK is compiled without the production Render URL (`https://eduflow-backend-jvn8.onrender.com`), the mobile app will be unable to log in, stream AI Officer responses, or load student passports in production.
* **Suggested Fix:**
  ```dart
  const String kApiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://eduflow-backend-jvn8.onrender.com/api/v1',
  );
  ```
* **Requires:** CI/CD build script parameter verification (`flutter build apk --dart-define=API_BASE_URL=...`) before Google Play / APK distribution.

---

### Issue 3: Long-Lived Refresh Token Revocation & Inactivity Timeout
* **File:** `eduflow-backend/src/routes/authRoutes.js` & `eduflow-core/web/src/context/AuthContext.jsx`
* **Issue:** Refresh tokens have a 7-day expiration without active sliding-window inactivity revocation or device fingerprint binding.
* **Why Critical:** If an admin access device is left unattended in an academic institution office, long token validity periods increase exposure window without mandatory re-authentication.
* **Suggested Fix:** Implement automatic token revocation on password change or institutional permission downgrade, and enforce sliding 12-hour session expiry for administrative accounts.
* **Requires:** Security team policy sign-off and UX review.
