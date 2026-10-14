#!/usr/bin/env bash

echo "Running EduFlow AI OS Health Diagnostic..."
FAILED=0

# 1. Check Container Status
echo -n "Checking Docker containers... "
RUNNING=$(docker ps --filter "name=eduflow-" --format "{{.Names}}" | wc -l)
if [ "$RUNNING" -ge 4 ]; then
  echo "OK ($RUNNING containers running)"
else
  echo "WARN (Only $RUNNING eduflow containers running)"
fi

# 2. Check Database
echo -n "Checking PostgreSQL database... "
if docker exec eduflow-postgres pg_isready -U eduflow_admin -d eduflow >/dev/null 2>&1; then
  echo "OK"
else
  echo "FAIL (PostgreSQL is unreachable)"
  FAILED=1
fi

# 3. Check Backend API
echo -n "Checking Backend API (/api/health)... "
API_RES=$(curl -s -k http://localhost:3000/api/health || true)
if echo "$API_RES" | grep -q '"ok":true'; then
  echo "OK"
else
  echo "FAIL (Backend health check did not return ok:true)"
  FAILED=1
fi

# 4. Check Frontend Web
echo -n "Checking Web Service... "
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k http://localhost/ || true)
if [ "$WEB_STATUS" = "200" ] || [ "$WEB_STATUS" = "301" ] || [ "$WEB_STATUS" = "302" ]; then
  echo "OK ($WEB_STATUS)"
else
  echo "WARN (HTTP $WEB_STATUS)"
fi

# 5. Check Ollama LLM Service
echo -n "Checking Ollama LLM Service... "
OLLAMA_RES=$(docker exec eduflow-ollama curl -s http://localhost:11434/api/tags || true)
if echo "$OLLAMA_RES" | grep -q 'models'; then
  echo "OK (Local LLM service ready)"
else
  echo "WARN (Ollama models endpoint not responding yet)"
fi

if [ "$FAILED" -eq 0 ]; then
  echo "All critical on-premise components are HEALTHY."
  exit 0
else
  echo "One or more critical services FAILED."
  exit 1
fi
