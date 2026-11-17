# Attendance Presence Hardening — Sprint Blockers & Operational Log

**Sprint Target:** Complete P0, P1, and P2 Hardenings for BLE/Wi-Fi Attendance  
**Generated:** November 17, 2026  
**Status:** All tasks completed without blocking dependencies.

---

## 1. Resolved Sprint Items
- **P0.1 Identity Resolution:** Resolved by introducing `deviceInstallId` canonical resolution and `device_registrations` table migration. No blockers.
- **P0.2 Rotating Session Code:** Resolved by adding 90s session PIN and signed HMAC QR generation on faculty console with student pulse validation. No blockers.
- **P0.3 Confidence Bands & Faculty Review:** Resolved with `classifyPresence` 3-band model and faculty review workflow in `attendanceEntry.jsx`. No blockers.
- **P1.1 Per-Room Calibration:** Resolved with `computeCalibration` Gaussian boundary generator, table migration, and admin walk-test wizard. No blockers.
- **P1.2 Physical AP-to-Room Mapping:** Resolved with `ap_room_map` registry, multi-BSSID support, and bulk CSV upload. No blockers.
- **P1.3 DPDP 2023 Consent & Retention Split:** Resolved with explicit opt-in gate, 90-day raw telemetry purge, and 1-year UGC audit ledger preservation. No blockers.
- **P1.4 Rotating Webhook Secret:** Resolved with dual-secret window (`current` + `previous`) and admin rotate endpoint. No blockers.
- **P2.1 Reason-Coded Manual Override:** Resolved with standardized reason codes and neutral "Marked by faculty" student badge. No blockers.
- **P2.2 Session Health Degradation Alert:** Resolved with real-time ratio evaluator and amber faculty banner. No blockers.

---

## 2. Hardware Deployment Advisory (Campus IT Operational Notes)
While all software, protocol, and database layers are fully hardened and tested, campus network engineers should note:
1. **Wireless LAN Controller (WLC) Webhook Formats:**
   Cisco Catalyst Center / Aruba Central / Ruckus SmartZone send association syslog/JSON with differing payload keys (`ap_mac` vs `apBssid`, `station_mac` vs `clientMac`). EduFlow's `NetworkWebhookController` normalizes these formats, but webhook body signatures should use `x-network-signature: sha256=<hmac>` or `x-network-secret`.
2. **Room Calibration Frequency:**
   Per-room RSSI thresholds (`minDbm`, `maxDbm`) should be re-calibrated whenever physical room acoustics or partition layouts are altered, or if AP transmit power is modified in the WLC.
3. **Student Device Multi-Binding:**
   A student can only register one primary mobile device for automatic BLE/Wi-Fi presence. Secondary tablets or laptops should connect to the student Wi-Fi network without registering for attendance presence pulses.
