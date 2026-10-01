#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# EduFlow AI OS — Render One-Push Production Deploy Script
# Verifies repository state, pushes to main, and monitors deployment status.
# ==============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "\n${BOLD}${BLUE}======================================================${NC}"
echo -e "${BOLD}${BLUE}   EduFlow AI OS — Render Deployment Engine           ${NC}"
echo -e "${BOLD}${BLUE}======================================================${NC}\n"

# 1. Check Git remote
echo -e "🔍 ${BOLD}Step 1: Checking Git remote configuration...${NC}"
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
  echo -e "${RED}❌ Git remote 'origin' is not configured.${NC}"
  exit 1
fi
echo -e "   Remote: ${GREEN}${REMOTE_URL}${NC}"

# 2. Check for uncommitted changes
echo -e "\n🔍 ${BOLD}Step 2: Checking Git working tree...${NC}"
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo -e "${YELLOW}⚠️ Warning: You have uncommitted changes in your repository.${NC}"
  git status --short
  read -r -p "Do you want to stage, commit, and push these changes? [y/N]: " CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    read -r -p "Enter commit message: " COMMIT_MSG
    git add -A
    git commit -m "${COMMIT_MSG:-Deploy production updates}"
  else
    echo -e "${YELLOW}Continuing without committing local changes...${NC}"
  fi
else
  echo -e "   ${GREEN}Working tree clean.${NC}"
fi

# 3. Check Render CLI status (optional helper)
echo -e "\n🔍 ${BOLD}Step 3: Checking Render CLI status...${NC}"
if command -v render >/dev/null 2>&1; then
  RENDER_USER=$(render whoami 2>/dev/null || echo "")
  if [ -n "$RENDER_USER" ]; then
    echo -e "   Render CLI authenticated as: ${GREEN}${RENDER_USER}${NC}"
  else
    echo -e "   ${YELLOW}Render CLI installed but not logged in. You can login with 'render login'.${NC}"
  fi
else
  echo -e "   ${YELLOW}Render CLI not installed locally. Deployment will trigger automatically on git push.${NC}"
fi

# 4. Push to main branch
echo -e "\n🚀 ${BOLD}Step 4: Pushing changes to main branch...${NC}"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" = "main" ]; then
  git push origin main
else
  echo -e "   Pushing current branch ${BOLD}${CURRENT_BRANCH}${NC} to ${BOLD}origin/main${NC}..."
  git push origin "${CURRENT_BRANCH}:main"
fi

echo -e "\n${GREEN}✅ Push to origin/main successful!${NC}"
echo -e "Render will now build and deploy the services defined in render.yaml."

# 5. Output expected URLs
echo -e "\n${BOLD}${BLUE}======================================================${NC}"
echo -e "${BOLD}   Deployed Service Access Endpoints:                 ${NC}"
echo -e "${BOLD}${BLUE}======================================================${NC}"
echo -e "   🌐 Frontend SPA : ${GREEN}https://eduflow-web.onrender.com${NC}"
echo -e "   🔌 Backend API  : ${GREEN}https://eduflow-backend.onrender.com/api/health${NC}"
echo -e "   📋 Lead Intake  : ${GREEN}https://eduflow-web.onrender.com/for-colleges${NC}"
echo -e "   🎭 Observation  : ${GREEN}https://eduflow-web.onrender.com/demo/observe?observe=true${NC}"
echo -e "${BOLD}${BLUE}======================================================${NC}\n"

exit 0
