# EduFlow AI OS — Production Deployment Blueprint

## 1. Cloud Infrastructure (Render Blueprint)
The system is deployed via Render using `render.yaml`:
- **Backend Service:** Node.js 20 ESM web service with health check at `/api/health`.
- **Frontend Service:** Static site hosting React 18 SPA with rewrite rules in `public/_redirects`.
- **Managed Database:** Render PostgreSQL 16 instance connected via `DATABASE_URL`.

---

## 2. Linux VPS Topology (Ubuntu 22.04 LTS / Nginx / PM2)
- **Reverse Proxy:** Nginx with HTTP/2 and SSE streaming proxy buffering disabled (`proxy_buffering off;`).
- **Process Manager:** PM2 cluster mode running `node src/server.js` with auto-restart on memory threshold > 512MB.
- **SSL Termination:** Let's Encrypt automated renewal via Certbot.
