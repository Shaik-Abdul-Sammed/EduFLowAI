# EduFlow AI OS — Observability & Incident Response

## 1. High-Performance Structured Logging (Pino)
All HTTP requests, SSE streaming connections, and database interactions emit JSON logs via `pino` and `pino-http`.

## 2. Health Monitoring & Runbook
- `GET /api/health`: Validates service liveness and uptime.
- `GET /api/health/db`: Validates database pool connectivity and mode (`postgres` vs `memory`).
