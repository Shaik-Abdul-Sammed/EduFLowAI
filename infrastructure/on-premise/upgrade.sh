#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "       EduFlow AI OS — On-Premise Upgrade Script          "
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BACKUP_DIR="${SCRIPT_DIR}/../../backups/pre-upgrade"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/eduflow_backup_${TIMESTAMP}.sql"

echo "[1/4] Creating database safety backup before upgrade..."
if docker exec eduflow-postgres pg_dump -U eduflow_admin eduflow > "$BACKUP_FILE"; then
  echo "Backup successfully saved to: ${BACKUP_FILE}"
else
  echo "WARNING: Could not backup database. Is PostgreSQL running?"
fi

echo "[2/4] Rebuilding updated containers..."
docker compose -f docker-compose.onprem.yml build --pull backend web

echo "[3/4] Performing rolling container upgrade..."
docker compose -f docker-compose.onprem.yml up -d --no-deps backend web

echo "[4/4] Verifying upgrade health..."
if ./health-check.sh; then
  echo "=========================================================="
  echo " Upgrade completed successfully!                          "
  echo "=========================================================="
else
  echo "ERROR: Health check failed after upgrade!"
  echo "To restore previous database backup, run:"
  echo "cat ${BACKUP_FILE} | docker exec -i eduflow-postgres psql -U eduflow_admin eduflow"
  exit 1
fi
