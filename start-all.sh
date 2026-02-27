#!/bin/bash

# CalcettoApp - Start all services script
# Usage: ./start-all.sh

set -e

echo "🚀 Starting CalcettoApp services..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/home/ubuntu/projects/CalcettoApp"
cd "$PROJECT_DIR"

# Function to check if a port is listening
check_port() {
    local port=$1
    local name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is running on port $port"
        return 0
    else
        return 1
    fi
}

# Function to wait for a service
wait_for_service() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=1
    
    echo -n "⏳ Waiting for $name..."
    while [ $attempt -le $max_attempts ]; do
        if check_port $port "$name" >/dev/null 2>&1; then
            echo -e "\n${GREEN}✓${NC} $name is ready!"
            return 0
        fi
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    echo -e "\n${RED}✗${NC} $name failed to start after ${max_attempts}s"
    return 1
}

echo "📦 Step 1/3: Starting PostgreSQL Docker container..."
if docker ps | grep -q "calcetto-postgres"; then
    echo -e "${GREEN}✓${NC} PostgreSQL container already running"
else
    if docker ps -a | grep -q "calcetto-postgres"; then
        echo "   Starting existing container..."
        docker start calcetto-postgres
    else
        echo "   Creating new PostgreSQL container..."
        # NOTE: PostgreSQL password should be set via POSTGRES_PASSWORD env var
        # or configured in your local environment. Default is for dev only.
        DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
        docker run -d \
            --name calcetto-postgres \
            -e POSTGRES_USER=postgres \
            -e "POSTGRES_PASSWORD=${DB_PASSWORD}" \
            -e POSTGRES_DB=calcetto \
            -p 5432:5432 \
            postgres:15-alpine
    fi
    wait_for_service 5432 "PostgreSQL"
fi
echo ""

echo "🌐 Step 2/3: Starting Next.js development server..."
if check_port 3000 "Next.js"; then
    echo -e "${YELLOW}⚠${NC} Next.js already running on port 3000"
else
    # Kill any existing Next.js processes
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    
    # Start Next.js with remote access
    export NEXT_PRIVATE_LOCAL_WEBSOCKET_PROXY_HOST=0.0.0.0
    nohup npm run dev > /tmp/nextjs.log 2>&1 &
    wait_for_service 3000 "Next.js"
fi
echo ""

echo "🎨 Step 3/3: Starting Prisma Studio..."
if check_port 5555 "Prisma Studio"; then
    echo -e "${YELLOW}⚠${NC} Prisma Studio already running on port 5555"
else
    nohup npx prisma studio > /tmp/prisma-studio.log 2>&1 &
    wait_for_service 5555 "Prisma Studio"
fi
echo ""

echo "═══════════════════════════════════════════════════"
echo -e "${GREEN}🎉 All services are running!${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📱 Application:     http://100.124.216.29:3000"
echo "🗄️  Prisma Studio:   http://100.124.216.29:5555"
echo "💾 PostgreSQL:     localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "   View Next.js logs:    tail -f /tmp/nextjs.log"
echo "   View Prisma logs:     tail -f /tmp/prisma-studio.log"
echo "   Stop all services:    ./stop-all.sh"
echo ""
echo "Press Ctrl+C to stop viewing logs (services keep running)"
echo ""

# Show combined logs
tail -f /tmp/nextjs.log /tmp/prisma-studio.log 2>/dev/null || true
