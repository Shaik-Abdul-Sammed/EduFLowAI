# EduFlow AI OS — Go-Live Verification Checklist (40 Items)

## I. Infrastructure & Hosting (1–8)
- [ ] 1. Production PostgreSQL instance upgraded to minimum 2 vCPU, 4GB RAM with automated backup snapshotting.
- [ ] 2. Render web service configured with auto-restart on unhandled exceptions.
- [ ] 3. Custom institutional sub-domain registered and DNS propagated with active Let's Encrypt SSL.
- [ ] 4. HTTP to HTTPS forced redirection verified across all routes.
- [ ] 5. CORS origins strictly bound to institutional domain without wildcard `*`.
- [ ] 6. Production rate limiting enabled (`express-rate-limit` active on `/api/v1/*`).
- [ ] 7. Request timeout configured to 45 seconds for AI streaming endpoints.
- [ ] 8. Healthcheck endpoint `/api/health` responding with HTTP 200 and `< 100ms` latency.

## II. Security, Session & Compliance (9–16)
- [ ] 9. `JWT_SECRET` and `JWT_REFRESH_SECRET` generated using cryptographically strong 256-bit random hex keys.
- [ ] 10. Default admin credentials (`admin@demo.edu`) rotated with unique institutional master password.
- [ ] 11. Password policy enforced: 10+ characters, uppercase, lowercase, number, special character.
- [ ] 12. Inactivity session timeout active (default 30–60 minutes configurable).
- [ ] 13. Per-user sliding window rate limiting active (Admin: 100, HOD: 50, Staff/Faculty: 30 / 15m).
- [ ] 14. Optional IP Whitelist tested and operational in Institution Settings.
- [ ] 15. DPDP Act 2023 compliant Terms of Service and Privacy Policy published at `/terms` and `/privacy`.
- [ ] 16. Institutional Data Processing Agreement (DPA) signed or acknowledged electronically.

## III. Database & Data Integrity (17–24)
- [ ] 17. Migrations 001 through 020 applied without schema errors.
- [ ] 18. Multi-tenant isolation verified with `institution_id` indices across all core tables.
- [ ] 19. Initial department catalog seeded with correct degree codes (CSE, ECE, EEE, MECH, etc.).
- [ ] 20. Faculty roster CSV imported with employee IDs and qualifications.
- [ ] 21. Student roster CSV imported with roll numbers and current semester standing.
- [ ] 22. Nightly automated backup verification worker (`backupVerifier.js`) executed and logged.
- [ ] 23. One-click data export (`/api/v1/institution/export`) verified generating complete ZIP archive.
- [ ] 24. Audit logging operational for all administrative mutations and login events.

## IV. Core Automation Modules (25–32)
- [ ] 25. Academic Calendar 2026 generated with regional state gazetted holidays (Pongal, Dussehra, Diwali).
- [ ] 26. Vacation adjustment recalculator tested: extending break by $+3$ days shifts exams correctly.
- [ ] 27. Attendance CSV ingestion verified with 75% and 60% shortage warning triggers.
- [ ] 28. SIS/ERP Portal fallback connector verified in demo and live mode.
- [ ] 29. Timetable Excel upload verified with conflict-free scheduling engine.
- [ ] 30. All 7 NAAC criteria generating distinct quantitative tables and qualitative narratives.
- [ ] 31. Student Success Officer generating at-risk student intervention alerts.
- [ ] 32. Branded PDF export functioning with institutional logo and watermark.

## V. Governance, Permissions & Financials (33–40)
- [ ] 33. Non-Teaching Staff role assigned with delegated officer permissions (Timetable, Accreditation).
- [ ] 34. Staff draft submission workflow requires HOD approval before publishing.
- [ ] 35. HOD approval/rejection actions updating audit logs and sending real-time notifications.
- [ ] 36. Top navigation Global Search functioning with debounced results across entities.
- [ ] 37. Notification Center displaying real-time badges with "Mark All Read" action.
- [ ] 38. Institution settings configured with valid GSTIN, billing address, and institutional UPI ID.
- [ ] 39. Invoices generate dynamic UPI payment links and printable QR codes.
- [ ] 40. Manual payment recording tested with transaction reference reconciliation.
