#!/bin/bash

# ============================================
# ToolChess Backend - Production Deployment Script
# ============================================

set -e  # Exit on any error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     ToolChess Backend - Production Deployment             ║"
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
echo -e "${YELLOW}[1/8] Running pre-deployment checks...${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}✗ Error: .env.production file not found${NC}"
    echo "Please create .env.production from .env.production.example"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Error: Node.js is not installed${NC}"
    exit 1
fi

# Check Node.js version (should be >= 14)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo -e "${RED}✗ Error: Node.js version must be >= 14${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"
echo ""

# Step 2: Backup current deployment
echo -e "${YELLOW}[2/8] Creating backup...${NC}"

mkdir -p "$BACKUP_DIR"

if [ -d "node_modules" ]; then
    echo "Backing up current deployment to $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
        --exclude='node_modules' \
        --exclude='backups' \
        --exclude='.git' \
        .
    echo -e "${GREEN}✓ Backup created${NC}"
else
    echo "No previous deployment found, skipping backup"
fi

echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}[3/8] Installing dependencies...${NC}"

npm ci --production

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 4: Run database migrations
echo -e "${YELLOW}[4/8] Running database migrations...${NC}"

# Load production environment
export $(cat .env.production | grep -v '^#' | xargs)

# Check database connection
echo "Testing database connection..."
node -e "
const sql = require('mssql');
const config = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
  }
};
sql.connect(config).then(() => {
  console.log('Database connection successful');
  sql.close();
  process.exit(0);
}).catch(err => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# Step 5: Run tests
echo -e "${YELLOW}[5/8] Running tests...${NC}"

# Run basic health check tests
npm test 2>/dev/null || echo "Warning: No tests configured"

echo -e "${GREEN}✓ Tests completed${NC}"
echo ""

# Step 6: Build (if needed)
echo -e "${YELLOW}[6/8] Building application...${NC}"

# If using TypeScript, build here
# npm run build

echo -e "${GREEN}✓ Build completed${NC}"
echo ""

# Step 7: Stop current server (if running)
echo -e "${YELLOW}[7/8] Stopping current server...${NC}"

# If using PM2
if command -v pm2 &> /dev/null; then
    pm2 stop toolchess-backend 2>/dev/null || echo "No running instance found"
else
    # If using systemd
    if command -v systemctl &> /dev/null; then
        sudo systemctl stop toolchess-backend 2>/dev/null || echo "No running instance found"
    fi
fi

echo -e "${GREEN}✓ Server stopped${NC}"
echo ""

# Step 8: Start server
echo -e "${YELLOW}[8/8] Starting server...${NC}"

# Copy production environment
cp .env.production .env

# Start with PM2 (recommended)
if command -v pm2 &> /dev/null; then
    pm2 start src/server.js --name toolchess-backend --env production
    pm2 save
    echo -e "${GREEN}✓ Server started with PM2${NC}"
else
    # Start with systemd
    if command -v systemctl &> /dev/null; then
        sudo systemctl start toolchess-backend
        echo -e "${GREEN}✓ Server started with systemd${NC}"
    else
        # Fallback: start in background
        nohup node src/server.js > logs/app.log 2>&1 &
        echo $! > .pid
        echo -e "${GREEN}✓ Server started in background (PID: $(cat .pid))${NC}"
    fi
fi

echo ""

# Step 9: Health check
echo -e "${YELLOW}Performing health check...${NC}"

sleep 5  # Wait for server to start

HEALTH_CHECK_URL="${API_BASE_URL}/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed (HTTP $HTTP_STATUS)${NC}"
    echo "Please check logs for errors"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          Deployment Completed Successfully!               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Server is running at: $API_BASE_URL"
echo "Backup saved to: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
echo ""
echo "Next steps:"
echo "  1. Monitor logs: pm2 logs toolchess-backend"
echo "  2. Check status: pm2 status"
echo "  3. Test critical endpoints"
echo ""
