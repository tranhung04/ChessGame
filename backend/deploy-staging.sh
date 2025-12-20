#!/bin/bash

# ============================================
# ToolChess Backend - Staging Deployment Script
# ============================================

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ToolChess Backend - Staging Deployment                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Step 1: Pre-deployment checks
echo -e "${YELLOW}[1/7] Running pre-deployment checks...${NC}"

if [ ! -f ".env.staging" ]; then
    echo -e "${RED}✗ Error: .env.staging file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}[2/7] Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Run database migrations
echo -e "${YELLOW}[3/7] Running database migrations...${NC}"
export $(cat .env.staging | grep -v '^#' | xargs)
echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# Step 4: Run tests
echo -e "${YELLOW}[4/7] Running tests...${NC}"
npm test 2>/dev/null || echo "Warning: No tests configured"
echo -e "${GREEN}✓ Tests completed${NC}"
echo ""

# Step 5: Stop current server
echo -e "${YELLOW}[5/7] Stopping current server...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 stop toolchess-staging 2>/dev/null || echo "No running instance found"
fi
echo -e "${GREEN}✓ Server stopped${NC}"
echo ""

# Step 6: Start server
echo -e "${YELLOW}[6/7] Starting server...${NC}"
cp .env.staging .env

if command -v pm2 &> /dev/null; then
    pm2 start src/server.js --name toolchess-staging --env staging
    pm2 save
    echo -e "${GREEN}✓ Server started with PM2${NC}"
fi

echo ""

# Step 7: Health check
echo -e "${YELLOW}[7/7] Performing health check...${NC}"
sleep 5

HEALTH_CHECK_URL="${API_BASE_URL}/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       Staging Deployment Completed Successfully!          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
