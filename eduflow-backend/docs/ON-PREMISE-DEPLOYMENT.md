# EduFlow AI OS — On-Premise & Air-Gapped Deployment Guide

> Target Audience: IT Directors, Systems Architects, and Security Officers at Tier-1 Institutes (IITs, NITs, Central Universities, Defense Institutes).

---

## 1. System Overview & Enterprise Topology

EduFlow AI OS supports **100% On-Premise, Air-Gapped, and Intranet deployments**. No external cloud connection or telemetry is required. The system runs entirely within institutional data center boundaries.

```
                    ┌──────────────────────────────────────────────┐
                    │       Campus Local Area Network / VLAN       │
                    └──────────────────────┬───────────────────────┘
                                           │
                                  HTTPS (Port 443)
                                           │
                    ┌──────────────────────▼───────────────────────┐
                    │               Nginx Reverse Proxy            │
                    │        (SSL Termination + SSE Unbuffered)     │
                    └──────────────┬────────────────┬──────────────┘
                                   │                │
                        HTTP :80   │                │   HTTP :3000
                                   ▼                ▼
                    ┌──────────────────┐    ┌──────────────────────┐
                    │   EduFlow Web    │    │   EduFlow Backend    │
                    │   (React SPA)    │    │    (Node.js ESM)     │
                    └──────────────────┘    └───────┬──────────────┘
                                                    │
                                ┌───────────────────┴───────────────────┐
                                │                                       │
                                ▼                                       ▼
                    ┌──────────────────────┐                ┌──────────────────────┐
                    │    PostgreSQL 16     │                │     Ollama LLM       │
                    │   (RLS Multi-Tenant) │                │  (Local Llama3/Mistral│
                    └──────────────────────┘                └──────────────────────┘
```

---

## 2. Hardware & Infrastructure Prerequisites

### Minimum Requirements (CPU-only, Small Institute < 3,000 students)
- **CPU**: 8 Cores (x86_64 or ARM64)
- **RAM**: 16 GB ECC RAM
- **Storage**: 100 GB NVMe / SSD
- **LLM Engine**: Quantized 7B/8B models (e.g. `llama3:8b-instruct-q4_K_M` via Ollama CPU mode)

### Recommended Production Specification (Large University 10,000+ students)
- **CPU**: 16–32 Cores (AMD EPYC or Intel Xeon)
- **RAM**: 64 GB ECC RAM
- **Storage**: 500 GB NVMe (RAID-1 or RAID-10)
- **GPU Accelerator**: 1x NVIDIA RTX 4090 (24GB VRAM) or NVIDIA L4 / A10 (24GB)
- **Operating System**: Ubuntu Server 22.04 LTS / 24.04 LTS or RHEL 9.x
- **Container Engine**: Docker Engine >= 24.0, Docker Compose >= 2.20
- **GPU Drivers**: NVIDIA Driver >= 535, NVIDIA Container Toolkit (if using GPU)

---

## 3. Directory Structure

```
infrastructure/on-premise/
├── docker-compose.onprem.yml    # Full-stack orchestrator
├── .env.onprem.example          # Environment variables template
├── install.sh                   # Automated single-command installation
├── upgrade.sh                   # Zero-downtime database-safe upgrade
├── health-check.sh              # Automated health diagnostic script
└── nginx/
    └── nginx.onprem.conf        # Production Nginx reverse proxy configuration
```

---

## 4. Rapid Installation (Connected Server)

If your target host has temporary or outbound internet access during initial staging:

1. Clone or extract the repository onto the server:
   ```bash
   git clone https://github.com/your-org/EduFLowAI.git /opt/eduflow
   cd /opt/eduflow/infrastructure/on-premise
   ```

2. Copy the environment template and review credentials:
   ```bash
   cp .env.onprem.example .env
   # Customize passwords, domain names, and LDAP settings:
   nano .env
   ```

3. Run the automated installer:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

4. Verify all services are operational:
   ```bash
   ./health-check.sh
   ```

---

## 5. Air-Gapped / Isolated Installation (No Internet Access)

For strict air-gapped defense or university server rooms where internet access is prohibited:

### Step 1: Prepare Bundle on an Internet-Connected Machine
On a build machine with internet access and Docker installed:
```bash
cd infrastructure/air-gapped
chmod +x bundle.sh
./bundle.sh
```
This generates `eduflow-airgapped-bundle-v1.0.tar.gz` and `eduflow-airgapped-bundle-v1.0.tar.gz.sha256`.

### Step 2: Transfer to Physical Media
Transfer the tarball and checksum to approved optical disc (CD/DVD-R) or hardware-encrypted USB drive per institutional air-gap protocol.

### Step 3: Extract and Verify on Air-Gapped Host
On the target server:
```bash
mkdir -p /opt/eduflow-airgapped
cd /opt/eduflow-airgapped
cp /media/usb/eduflow-airgapped-bundle-v1.0.tar.gz* .

# Verify cryptographic integrity
chmod +x verify.sh
./verify.sh eduflow-airgapped-bundle-v1.0.tar.gz

# Extract bundle
tar -xzvf eduflow-airgapped-bundle-v1.0.tar.gz
cd bundle/

# Load pre-built container images into local Docker daemon
docker load -i images/eduflow-all-images.tar

# Launch stack
docker compose -f docker-compose.onprem.yml up -d
```

---

## 6. Local LLM Configuration (Ollama)

EduFlow AI OS automatically communicates with Ollama via `AI_PROVIDER=ollama`.

### Supported Local Models:
- `llama3:8b-instruct`: General administrative tasks, student success, timetable reasoning.
- `mistral:7b-instruct`: NAAC/NBA criteria generation and compliance gap analysis.
- `qwen2.5:14b`: Advanced multi-lingual queries (Hindi, Marathi, Telugu, Tamil).

### Verifying Ollama Health:
```bash
curl http://localhost:11434/api/tags
```

---

## 7. Security Hardening & Compliance Checklist

- [x] **Network Isolation**: All database and cache ports (`5432`, `6379`) bind strictly to internal Docker networks; only port `443` (HTTPS) is exposed externally.
- [x] **Row-Level Security**: Enabled on 14 institutional tables with PostgreSQL session isolation.
- [x] **SSL/TLS 1.3**: Automated self-signed certificate generation or custom institutional wildcard certificate mounting.
- [x] **No Telemetry**: External telemetry, Google Analytics, and outbound API pings are disabled when `AI_PROVIDER=ollama`.
