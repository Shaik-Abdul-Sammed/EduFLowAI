# EduFlow AI OS — QA & Testing Strategy

## 1. Test Pyramid & Methodology
- **Unit Tests:** `node:test` (backend) and Jest/Vitest (frontend) covering controllers, repositories, and custom hooks.
- **Integration Tests:** Verifying API routing, middleware execution, database query persistence, and token lifecycles.
- **Smoke Tests:** Automated shell verification (`scripts/demo-check.sh`) executed prior to any live institutional demo.
