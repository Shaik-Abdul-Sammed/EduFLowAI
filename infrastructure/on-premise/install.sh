#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "      EduFlow AI OS — On-Premise Automated Installer      "
echo "=========================================================="

# 1. Dependency Checks
echo "[1/6] Checking system requirements..."
command -v docker >/dev/null 2>&1 || { echo "ERROR: docker is not installed. Please install Docker 24+."; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "ERROR: docker compose is not installed. Please install Docker Compose v2+."; exit 1; }

# 2. Environment Configuration
echo "[2/6] Configuring environment settings..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
  echo "Creating .env from .env.onprem.example..."
  cp .env.onprem.example .env
  
  # Generate unique secrets
  JWT_SEC=$(openssl rand -hex 32)
  REFRESH_SEC=$(openssl rand -hex 32)
  sed -i "s/^JWT_SECRET=.*/JWT_SECRET=${JWT_SEC}/" .env
  sed -i "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=${REFRESH_SEC}/" .env
  echo "Generated cryptographically secure JWT secrets in .env"
fi

# 3. SSL/TLS Certificate Generation (Self-signed fallback for campus intranet)
echo "[3/6] Setting up TLS certificates..."
mkdir -p certs
if [ ! -f certs/server.crt ] || [ ! -f certs/server.key ]; then
  echo "Generating self-signed SSL certificate for campus intranet..."
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certs/server.key -out certs/server.crt \
    -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=University/CN=eduflow.campus.internal"
  echo "Self-signed certificate generated in ./certs/"
fi

# 4. Building & Starting Containers
echo "[4/6] Launching Docker stack via docker-compose.onprem.yml..."
docker compose -f docker-compose.onprem.yml up -d --build

# 5. Local Ollama Model Setup
echo "[5/6] Initializing local offline LLM model in Ollama container..."
echo "Waiting for Ollama container to become ready..."
for i in {1..30}; do
  if docker exec eduflow-ollama ollama list >/dev/null 2>&1; then
    echo "Ollama is ready."
    break
  fi
  sleep 2
done

echo "Pulling llama3:8b-instruct (this may take a few minutes on first run)..."
docker exec eduflow-ollama ollama pull llama3:8b-instruct || echo "Offline mode: local weights should be preloaded."

# 6. Final Health Verification
echo "[6/6] Verifying system health..."
./health-check.sh

echo ""
echo "=========================================================="
echo "  SUCCESS: EduFlow AI OS is successfully installed!      "
echo "  Access URL: https://localhost (or configured domain)   "
echo "  Admin Email: admin@demo.edu                            "
echo "  Default Pass: Demo@2026                                "
echo "=========================================================="
