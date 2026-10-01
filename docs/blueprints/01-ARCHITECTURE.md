# EduFlow AI OS — System Architecture Blueprint

## 1. Technology Stack Overview

### Frontend Architecture
| Layer | Technology | Specification / Version | Rationale |
|---|---|---|---|
| Core Framework | React | 18.3.1 (SPA) | Declarative UI, extensive ecosystem, robust state model |
| Build Toolchain | Vite | 6.x | Instant HMR, roll-up based production code-splitting |
| Routing | React Router DOM | 6.x | Client-side routing, protected routes, declarative nested routes |
| UI Componentry | Bootstrap 5 + Vanilla CSS | Custom tokens + Dark Theme | Zero overhead, predictable layout, high performance |
| Motion & Animation | Framer Motion | 11.x | Cinematic transitions, streaming typewriter effects |
| Data Visualization | Chart.js & Recharts | 4.x / 2.x | Real-time ROI accumulation and metric analytics |
| Streaming Client | Custom SSE Hook | `useStreamingOfficer.js` | Native Fetch Streams API with AbortController lifecycle |
| Testing Stack | Vitest + Testing Library | React Testing Library | Fast in-memory unit and component testing |

### Backend Architecture
| Layer | Technology | Specification / Version | Rationale |
|---|---|---|---|
| Runtime | Node.js (ESM) | >= 20.0.0 (LTS) | Native fetch, modern async pipeline, ESM import/export |
| HTTP Web Framework | Express | 4.21.2 | Lightweight, stable, middleware-rich HTTP engine |
| Real-time WebSockets | Socket.IO | 4.8.3 | Live fleet GPS tracking and instant administrative broadcast |
| Authentication | jsonwebtoken & bcryptjs | JWT (15m access / 7d refresh) | Stateless token auth with salted 12-round password hashes |
| Input Validation | Zod | 3.25.76 | Runtime schema parsing with fail-fast strict validation |
| Structured Logging | Pino & pino-http | High-performance JSON | Low overhead structured JSON logging with request tracing |
| Rate Limiting | express-rate-limit | 7.5.1 | Production-grade tiered IP rate limiting with Retry-After headers |
| PDF Compilation | Native Binary Generator | Pure JS (%PDF-1.4 spec) | Zero-dependency, deterministic PDF generation without native binaries |
| Test Runner | node:test | Native Node test runner | Zero external test runner dependencies, native parallel suites |

### Data & Caching Architecture
| Layer | Technology | Specification | Fallback / Redundancy |
|---|---|---|---|
| Relational Storage | PostgreSQL 16 | ACID multi-tenant tables | In-memory `MemoryPool` mock for offline development |
| Vector Engine | pgvector | Extension | Embedding similarity search for institutional knowledge |
| In-Memory Cache | LRU-Cache & Redis | 4.6.12 | In-memory LRU with transparent Redis distributed fallback |

---

## 2. Microservice & Modular Subsystems

```mermaid
graph TB
    subgraph ClientTier["Client Tier (React 18 + Vite)"]
        Landing["Public Portal\n(/entry, /for-colleges)"]
        OfficerUI["AI Officer Workspaces\n(5 Streaming Views)"]
        AdminUI["Admin Control Plane\n(/admin-dashboard/*)"]
        ObsUI["Observation Hub\n(/demo/observe)"]
    end

    subgraph GatewayTier["API Gateway & Middleware Tier"]
        SecHeaders["Security Headers\n(CSP, HSTS, X-Frame)"]
        PinoLogger["Pino HTTP Tracing\n(req/res logging)"]
        RateLimiter["Tiered Rate Limiter\n(100 auth / 20 unauth)"]
        AuthMiddleware["JWT Verification\n& Role Guard"]
    end

    subgraph ServiceTier["Backend Core Services (Express ESM)"]
        AuthSvc["Auth Service\n(Login, Token Refresh, Password)"]
        OfficerOrch["Officer Orchestrator\n(Prompt Assembly, SSE Stream)"]
        LeadPipeline["Lead & CRM Pipeline\n(Intake, Status, Outreach)"]
        ReportDelivery["Report Delivery Engine\n(32-char Tokens, PDF Engine)"]
        InvoiceEngine["Invoice Generator\n(GST 18%, Auto-numbering)"]
        AuditService["Audit Log Subsystem\n(Security & Compliance)"]
    end

    subgraph ProviderTier["AI Provider Abstraction Layer"]
        GeminiAdapter["Google Gemini SDK\n(Primary Cloud LLM)"]
        OpenAIAdapter["OpenAI GPT-4 SDK\n(Secondary Cloud LLM)"]
        ClaudeAdapter["Anthropic Claude SDK\n(Enterprise Specialist)"]
        OllamaAdapter["Ollama / Local LLM\n(Air-gapped Environments)"]
        MockAdapter["Mock Provider\n(Zero-latency Test Fallback)"]
    end

    subgraph PersistenceTier["Data Storage Tier"]
        PostgreSQL[("PostgreSQL 16\n(Multi-tenant DB)")]
        RedisCache[("Redis Cache\n(Session / Query cache)")]
        MemoryFallback[("MemoryPool Storage\n(Zero-dependency Fallback)")]
    end

    ClientTier --> GatewayTier
    GatewayTier --> ServiceTier
    OfficerOrch --> ProviderTier
    ServiceTier --> PersistenceTier
```

### Subsystems Implemented Today vs Planned
- **Implemented Today:**
  - `AuthService`: Full JWT authentication, bcrypt hash, role verification (`admin`, `faculty`, `student`, `parent`).
  - `AIOrchestrator`: Multi-provider abstraction factory with dynamic provider routing and SSE streaming.
  - `LeadService`: Public lead intake with honeypot spam protection and CRM pipeline stage transitions.
  - `ReportDelivery`: Cryptographically secure tokenized delivery with view counting and PDF compilation.
  - `InvoiceEngine`: GST-compliant PDF invoice creation with automated sequential numbers (`EDU-2026-XXXX`).
  - `BackupService`: Automated GZIP compressed backups with 30-day daily and 12-month retention management.
  - `AuditService`: Comprehensive event auditing with IP address, user agent, and contextual payload metadata.
- **Planned Enterprise Enhancements (Phase 4+):**
  - `WhatsAppNotificationService`: Direct template-based WhatsApp broadcast via Meta Cloud API.
  - `PaymentGateway`: Automated webhook-driven reconciliation with Razorpay/Stripe payment links.
  - `DB-Level RLS`: Native PostgreSQL Row Level Security policies replacing application-level filtering.

---

## 3. Production Deployment Topology

```mermaid
graph LR
    subgraph PublicInternet["Public Internet"]
        Client["Browser Client"]
    end

    subgraph EdgeLayer["Edge / Cloud Network (Render / VPS)"]
        Cloudflare["Edge CDN & SSL\n(Cloudflare / Render CDN)"]
        Proxy["Reverse Proxy\n(Nginx / Render Load Balancer)"]
    end

    subgraph ComputeLayer["Container Compute Tier"]
        BackendContainer["Node.js Application Cluster\n(Express 4, PM2 / Docker, Port 3000)"]
    end

    subgraph StorageLayer["Data & Cloud Services"]
        ManagedPG[("Managed PostgreSQL 16\n(SSL Required, Automated Backups)")]
        ExtLLM["External AI Endpoints\n(Gemini, OpenAI, Claude)"]
    end

    Client -->|HTTPS / WSS| Cloudflare
    Cloudflare --> Proxy
    Proxy -->|SSE / REST / Sockets| BackendContainer
    BackendContainer -->|Encrypted Pool| ManagedPG
    BackendContainer -->|HTTPS API Requests| ExtLLM
```
