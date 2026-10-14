# EduFlow AI OS — Air-Gapped Deployment Manual

This manual describes how to deploy EduFlow AI OS in **completely disconnected, zero-outbound-access institutional data centers** (e.g., IIT Computer Centres, BARC, DRDO-affiliated academic laboratories).

---

## 1. Prerequisites on Target Host
- Linux host (Ubuntu 22.04 LTS / RHEL 9 recommended)
- Docker Engine >= 24.0
- Docker Compose v2+
- Optical disc drive or physical USB port approved for data transfer

---

## 2. Step-by-Step Installation

### Step 1: Verification
Before unpacking, confirm that the bundle has not been altered:
```bash
./verify.sh eduflow-airgapped-bundle-v1.0.tar.gz
```
Expected output: `SUCCESS: Checksum matches! Bundle is authentic and untampered.`

### Step 2: Extraction
```bash
tar -xzvf eduflow-airgapped-bundle-v1.0.tar.gz
cd eduflow-bundle/
```

### Step 3: Run Offline Installer
```bash
chmod +x install-airgapped.sh
./install-airgapped.sh
```
This loads all offline container images directly into the local Docker engine without issuing any network requests.

### Step 4: Loading Local Model Weights
Transfer pre-downloaded GGUF / Ollama model blobs into the Ollama data volume:
```bash
docker exec -i eduflow-ollama ollama create llama3:8b-instruct -f /root/.ollama/Modelfile
```

### Step 5: Verification
Run the diagnostic script:
```bash
./health-check.sh
```

---

## 3. Maintenance & Zero-Telemetry Guarantee
- All telemetry, phone-home metrics, and cloud AI fallbacks are hard-disabled when `AI_PROVIDER=ollama`.
- Row-Level Security ensures all departmental and student records remain isolated inside PostgreSQL.
