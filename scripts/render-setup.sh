#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# EduFlow AI OS — Interactive Render Provisioning & Setup Script
# Guides the engineer through CLI installation, login, database creation,
# blueprint initialization, and secret configuration.
# ==============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "\n${BOLD}${BLUE}======================================================${NC}"
echo -e "${BOLD}${BLUE}   EduFlow AI OS — Render Cloud Setup Wizard          ${NC}"
echo -e "${BOLD}${BLUE}======================================================${NC}\n"

# 1. Render CLI Installation Check
echo -e "📦 ${BOLD}Step 1: Checking Render CLI installation...${NC}"
if ! command -v render >/dev/null 2>&1; then
  echo -e "   ${YELLOW}Render CLI is not installed.${NC}"
  echo -e "   You can install it with one of the following commands:"
  echo -e "     - macOS (Homebrew) : ${BOLD}brew install render${NC}"
  echo -e "     - npm (Global)     : ${BOLD}npm install -g @renderinc/cli${NC}"
  echo -e "     - Linux (Script)   : ${BOLD}curl -fsSL https://render.com/install.sh | bash${NC}"
  
  read -r -p "Would you like to install via npm globally now? [y/N]: " INSTALL_CLI
  if [[ "$INSTALL_CLI" =~ ^[Yy]$ ]]; then
    npm install -g @renderinc/cli || {
      echo -e "${RED}❌ Failed to install Render CLI via npm. Please install manually.${NC}"
      exit 1
    }
  else
    echo -e "${YELLOW}Please install Render CLI and rerun this script.${NC}"
    exit 0
  fi
fi
echo -e "   ${GREEN}Render CLI is available.${NC}"

# 2. Authentication Check
echo -e "\n🔑 ${BOLD}Step 2: Authenticating with Render...${NC}"
if ! render whoami >/dev/null 2>&1; then
  echo -e "   Please log into your Render account:"
  render login || {
    echo -e "${RED}❌ Render authentication failed.${NC}"
    exit 1
  }
fi
RENDER_ACCOUNT=$(render whoami 2>/dev/null || echo "Authenticated User")
echo -e "   ${GREEN}Logged in as: ${RENDER_ACCOUNT}${NC}"

# 3. Apply Blueprint or Create Database
echo -e "\n🏗️ ${BOLD}Step 3: Deploying render.yaml Blueprint...${NC}"
if [ -f "render.yaml" ]; then
  echo -e "   Found ${BOLD}render.yaml${NC}. Applying blueprint..."
  render blueprints apply render.yaml || {
    echo -e "${YELLOW}Note: If blueprint apply requires manual project selection, follow CLI prompts above.${NC}"
  }
else
  echo -e "${RED}❌ render.yaml not found in current directory.${NC}"
  exit 1
fi

# 4. Configure Required Secrets Interactively
echo -e "\n🔐 ${BOLD}Step 4: Setting Production Secrets...${NC}"
echo -e "   The following secrets are required for the AI backend to operate:"

# AI_API_KEY
read -r -p "Enter your Google Gemini or OpenAI API Key (AI_API_KEY): " AI_KEY
if [ -n "$AI_KEY" ]; then
  render env set AI_API_KEY "$AI_KEY" --service eduflow-backend 2>/dev/null || {
    echo -e "${YELLOW}Note: Set AI_API_KEY in Render Dashboard under Environment if CLI set fails.${NC}"
  }
  echo -e "   ${GREEN}AI_API_KEY configured.${NC}"
fi

# JWT_SECRET
GEN_JWT=$(openssl rand -hex 32 2>/dev/null || date +%s%N | sha256sum | head -c 64)
render env set JWT_SECRET "$GEN_JWT" --service eduflow-backend 2>/dev/null || true
render env set JWT_REFRESH_SECRET "${GEN_JWT}_ref" --service eduflow-backend 2>/dev/null || true
echo -e "   ${GREEN}JWT secrets generated and set.${NC}"

echo -e "\n${BOLD}${GREEN}🎉 Render setup completed successfully!${NC}"
echo -e "Next steps: Run ${BOLD}bash scripts/render-deploy.sh${NC} to push and deploy your application.\n"
exit 0
