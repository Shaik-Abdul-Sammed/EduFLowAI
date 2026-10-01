#!/usr/bin/env bash

# ==============================================================================
# EduFlow AI OS — Pre-Demo System Health Check
# Run before every presentation to verify services, DB, and AI connectivity.
# Usage: bash scripts/demo-check.sh
# ==============================================================================

set -u

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

PASSED=0
FAILED=0

echo -e "\n${BOLD}${BLUE}======================================================${NC}"
echo -e "${BOLD}${BLUE}  EduFlow AI OS — Pre-Demo System Health Check  ${NC}"
echo -e "${BOLD}${BLUE}======================================================${NC}\n"

check_result() {
  local name="$1"
  local status="$2"
  local details="$3"

  if [ "$status" -eq 0 ]; then
    echo -e "  [${GREEN}✅ PASS${NC}] ${BOLD}${name}${NC}"
    if [ -n "$details" ]; then
      echo -e "          ${details}"
    fi
    PASSED=$((PASSED + 1))
  else
    echo -e "  [${RED}❌ FAIL${NC}] ${BOLD}${name}${NC}"
    if [ -n "$details" ]; then
      echo -e "          ${RED}${details}${NC}"
    fi
    FAILED=$((FAILED + 1))
  fi
}

# ------------------------------------------------------------------------------
# 1. Backend Server Check
# ------------------------------------------------------------------------------
echo -e "${BOLD}1. Checking Backend Health...${NC}"
BACKEND_HEALTH=$(curl -s -m 5 "${BACKEND_URL}/api/health" 2>/dev/null || echo "")
if echo "$BACKEND_HEALTH" | grep -q '"ok":true'; then
  SERVICE_NAME=$(echo "$BACKEND_HEALTH" | grep -o '"service":"[^"]*"' | cut -d'"' -f4)
  check_result "Backend Online (Port 3000)" 0 "Service: ${SERVICE_NAME}"
else
  check_result "Backend Online (Port 3000)" 1 "Backend not responding at ${BACKEND_URL}/api/health. Start with: npm --prefix eduflow-backend start"
fi

# ------------------------------------------------------------------------------
# 2. Database Mode Check
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}2. Checking Database Persistence...${NC}"
DB_HEALTH=$(curl -s -m 5 "${BACKEND_URL}/api/health/db" 2>/dev/null || echo "")
if echo "$DB_HEALTH" | grep -q '"mode":"postgres"'; then
  check_result "PostgreSQL Persistence Active" 0 "Mode: postgres | Persistent: true"
elif echo "$DB_HEALTH" | grep -q '"mode":"memory"'; then
  check_result "PostgreSQL Persistence Active" 1 "⚠️ Running in MEMORY mode! Data will wipe on restart. Set DB_MODE=postgres in eduflow-backend/.env"
else
  check_result "Database Health Endpoint" 1 "Unable to verify DB health at ${BACKEND_URL}/api/health/db"
fi

# ------------------------------------------------------------------------------
# 3. Demo Institution Verification
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}3. Verifying Demo Institution Data...${NC}"
INST_RESP=$(curl -s -m 5 "${BACKEND_URL}/api/v1/auth/default-institution" 2>/dev/null || echo "")
if echo "$INST_RESP" | grep -q '"name"'; then
  INST_NAME=$(echo "$INST_RESP" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
  check_result "Demo Institution Loaded" 0 "Institution: ${INST_NAME}"
else
  check_result "Demo Institution Loaded" 1 "Default institution not found. Run: node eduflow-backend/scripts/seed-demo.js"
fi

# ------------------------------------------------------------------------------
# 4. AI Provider Connectivity Check
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}4. Checking AI Provider & LLM Engine...${NC}"
AI_CHAT_PAYLOAD='{"message":"ping"}'
AI_RESP=$(curl -s -m 30 -X POST "${BACKEND_URL}/api/v1/ai/chat" \
  -H "Content-Type: application/json" \
  -d "$AI_CHAT_PAYLOAD" 2>/dev/null || echo "")

if [ -n "$AI_RESP" ] && ! echo "$AI_RESP" | grep -qi 'error'; then
  check_result "AI Provider Responding" 0 "LLM engine processed prompt successfully"
elif echo "$AI_RESP" | grep -qi 'mock'; then
  check_result "AI Provider (Fallback Mock)" 0 "Responding via FallbackProvider (Mock responses active)"
else
  check_result "AI Provider Connectivity" 1 "AI chat endpoint failed. Check AI_API_KEY / AI_PROVIDER in eduflow-backend/.env"
fi

# ------------------------------------------------------------------------------
# 5. Frontend Check
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}5. Checking Frontend Web Application...${NC}"
FRONTEND_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m 5 "${FRONTEND_URL}" 2>/dev/null || echo "000")
if [ "$FRONTEND_HTTP_CODE" = "200" ]; then
  check_result "Frontend Online (Port 5173)" 0 "Vite development server responding"
else
  check_result "Frontend Online (Port 5173)" 1 "Frontend not responding at ${FRONTEND_URL}. Start with: npm --prefix eduflow-core/web run dev"
fi

# ------------------------------------------------------------------------------
# Final Summary
# ------------------------------------------------------------------------------
echo -e "\n${BOLD}${BLUE}======================================================${NC}"
echo -e "${BOLD}  Summary: ${GREEN}${PASSED} Passed${NC} | ${RED}${FAILED} Failed${NC}"
echo -e "${BOLD}${BLUE}======================================================${NC}\n"

if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}🎉 ALL CHECKS PASSED! EduFlow AI OS is ready for demo presentation.${NC}\n"
  exit 0
else
  echo -e "${RED}${BOLD}⚠️ FIX THE FAILURES ABOVE BEFORE STARTING THE DEMO PRESENTATION.${NC}\n"
  exit 1
fi
