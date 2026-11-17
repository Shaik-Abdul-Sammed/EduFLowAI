# Attendance Presence Hardening — Sprint Audit Matrix

**Date:** November 17, 2026  
**Module:** Hardware-free Campus Wi-Fi AP Telemetry & BLE Beacons Automatic Attendance  
**Status:** All P0, P1, and P2 gaps resolved and verified by automated tests.

---

## 1. Before vs. After Hardening Matrix

| Priority | Issue / Risk | Before (Vulnerable State) | After (Hardened State) | Verification Test |
|---|---|---|---|---|
| **P0.1** | **MAC Randomization Breakage** | Identity chain used hardware `macAddress` / `macHash`. Roaming & phone sleep randomized MACs, breaking student identity resolution every few minutes. | Canonical identity migrated to app-installed UUIDv4 (`deviceInstallId`). MAC hashes retained solely for initial device-binding and fraud detection. | `tests/integration/attendance.identity.test.js` |
| **P0.2** | **Proxy Attendance Via Dorm Devices** | Device presence alone triggered attendance. Students left phones with roommates in dorms to record illegitimate attendance. | Introduced session-bound 90-second rotating PIN + HMAC-signed QR code. Ingest requires valid session code pulse; duplicate `deviceInstallId` reporting is rejected. | `tests/integration/attendance.proxy-guard.test.js` |
| **P0.3** | **Binary Dwell Threshold Falsing** | Binary rule (`≥80% dwell = Present`) flagged 30–50% of legitimate students absent due to sleep mode and AP roaming. | Replaced with 3-band confidence classifier (`auto_present`, `needs_review`, `auto_absent`). Faculty console splits roster into "Auto-marked (confident)" and "Needs your review (N)". Finalization requires resolving review items. | `tests/unit/presence.classify.test.js`<br>`tests/integration/attendance.review-flow.test.js` |
| **P1.1** | **Fixed RSSI Signal Misclassification** | Static -75 dBm threshold failed across different room sizes and wall materials. | Per-room dynamic Gaussian RSSI calibration (`minDbm = mean - 2*stddev`, `maxDbm = mean + stddev`). Added admin walk-test wizard tab and faculty uncalibrated room warning banner. | `tests/unit/presence.rssi.test.js` |
| **P1.2** | **Coarse Zone Blacklist Spillage** | Checked cafeteria/hallway blacklist; couldn't distinguish students inside enrolled classroom from students standing in the adjacent corridor. | Physical `ap_room_map` matching BSSIDs to specific classrooms. Supports multi-BSSID (dual-band 2.4/5GHz) and bulk CSV uploads. Unknown or misallocated APs classified with low confidence. | `tests/unit/presence.ap-mapping.test.js` |
| **P1.3** | **DPDP Act 2023 Non-Compliance & Data Sprawl** | Continuous tracking without explicit consent violated DPDP §6; telemetry retained indefinitely violated data minimization §8. | Explicit opt-in consent gate (`/api/v1/consent/presence-tracking`). Unconsented telemetry dropped at ingest. Retention split: raw telemetry hard-deleted after 90 days; final marks preserved for 1 academic year (UGC audit). Student UI toggle added. | `tests/integration/consent.presence.test.js`<br>`attendanceOverview.test.jsx` |
| **P1.4** | **Static Webhook Secret Leakage** | Single static secret `NETWORK_WEBHOOK_SECRET` risked campus-wide attendance forgery if leaked. | Dual-secret rotation window (`current` + `previous`). Admin rotation endpoint (`POST /api/v1/admin/ap-secret/rotate`) with 24-hour fleet migration grace. Stale secrets rejected with 401 and logged `STALE_WEBHOOK_SECRET`. | `tests/unit/ap-webhook.auth.test.js` |
| **P2.1** | **Second-Class Manual Attendance Friction** | Manual changes stigmatized as "exceptions". Students without smartphones suffered friction. | Manual override made a first-class citizen with standardized reason codes (`no_device`, `device_dead`, `accessibility`, `health`, `manual_verified`, `other`). Student UI displays neutral badge: "Marked by faculty". | `tests/integration/attendance.manual-override.test.js` |
| **P2.2** | **Silent Gateway / AP Hardware Failures** | Faculty had to guess why many students were missing when AP or BLE gateway failed. | Automated session health classifier flags degraded signal when `needs_review > 20%` or `valid_code_coverage < 60%`. High-visibility amber banner prompts switch to full manual attendance. | `tests/unit/presence.session-health.test.js`<br>`attendanceEntry.test.jsx` |

---

## 2. Test Verification Summary

All fixes have been validated with isolated automated test suites without hitting any external database:
- `tests/integration/attendance.identity.test.js` (4 tests passing)
- `tests/integration/attendance.proxy-guard.test.js` (5 tests passing)
- `tests/unit/presence.classify.test.js` (4 tests passing)
- `tests/integration/attendance.review-flow.test.js` (3 tests passing)
- `tests/unit/presence.rssi.test.js` (4 tests passing)
- `tests/unit/presence.ap-mapping.test.js` (4 tests passing)
- `tests/integration/consent.presence.test.js` (4 tests passing)
- `tests/unit/ap-webhook.auth.test.js` (4 tests passing)
- `tests/integration/attendance.manual-override.test.js` (3 tests passing)
- `tests/unit/presence.session-health.test.js` (4 tests passing)
- `eduflow-core/web/src/pages/faculty/__tests__/attendanceEntry.test.jsx` (6 tests passing)
- `eduflow-core/web/src/tests/AttendanceIntegrationPage.test.jsx` (6 tests passing)
- `eduflow-core/web/src/pages/student/__tests__/attendanceOverview.test.jsx` (3 tests passing)
