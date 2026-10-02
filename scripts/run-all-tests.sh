#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "============================================================"
echo "           EduFlow AI — Comprehensive Test Suite            "
echo "============================================================"
echo "Start time: $(date)"
echo ""

SUITES=()
RESULTS=()

run_step() {
  local suite_name="$1"
  local cmd="$2"
  
  echo "------------------------------------------------------------"
  echo "Running: $suite_name"
  echo "Command: $cmd"
  echo "------------------------------------------------------------"
  
  SUITES+=("$suite_name")
  if eval "$cmd"; then
    RESULTS+=("PASS")
    echo ">>> $suite_name: PASSED"
  else
    RESULTS+=("FAIL")
    echo ">>> $suite_name: FAILED"
  fi
  echo ""
}

# 1. Backend tests (all unit & integration tests)
run_step "Backend Unit & Integration Tests" "npm --prefix eduflow-backend test"

# 2. Frontend tests
run_step "Frontend Unit Tests" "npm --prefix eduflow-core/web test"

# 3. Frontend lint check
run_step "Frontend Lint Check" "npm --prefix eduflow-core/web run lint"

# 4. Frontend build check
run_step "Frontend Production Build" "npm --prefix eduflow-core/web run build"

# 5. Smoke test script if present
if [ -f "$REPO_ROOT/scripts/smoke-test.sh" ]; then
  run_step "Smoke Test Script" "bash $REPO_ROOT/scripts/smoke-test.sh"
elif [ -f "$REPO_ROOT/scripts/demo-check.sh" ] && curl -s -m 1 http://localhost:3000/api/health >/dev/null 2>&1; then
  run_step "Demo Pre-Flight Smoke Check" "bash $REPO_ROOT/scripts/demo-check.sh"
fi

echo "============================================================"
echo "                     SUMMARY REPORT                         "
echo "============================================================"
printf "%-40s | %-10s\n" "Test Suite / Step" "Result"
echo "------------------------------------------------------------"

FAILED=0
for i in "${!SUITES[@]}"; do
  printf "%-40s | %-10s\n" "${SUITES[$i]}" "${RESULTS[$i]}"
  if [ "${RESULTS[$i]}" != "PASS" ]; then
    FAILED=1
  fi
done

echo "============================================================"
if [ $FAILED -eq 0 ]; then
  echo "ALL TEST SUITES PASSED SUCCESSFULLY!"
  echo "EduFlow AI is ready for production."
  exit 0
else
  echo "ONE OR MORE SUITES FAILED. Check logs above."
  exit 1
fi
