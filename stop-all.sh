#!/bin/bash

# CalcettoApp - Stop all services script
# Usage: ./stop-all.sh

set -e

echo "🛑 Stopping CalcettoApp services..."
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Stop Next.js
if pgrep -f "next dev" >/dev/null; then
    echo "⏹️  Stopping Next.js..."
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✓${NC} Next.js stopped"
else
    echo -e "${YELLOW}⚠${NC} Next.js not running"
fi

# Stop Prisma Studio
if pgrep -f "prisma studio" >/dev/null; then
    echo "⏹️  Stopping Prisma Studio..."
    pkill -f "prisma studio" 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✓${NC} Prisma Studio stopped"
else
    echo -e "${YELLOW}⚠${NC} Prisma Studio not running"
fi

# Stop PostgreSQL container
echo "⏹️  Stopping PostgreSQL container..."
if docker ps | grep -q "calcetto-postgres"; then
    docker stop calcetto-postgres >/dev/null 2>&1 || true
    echo -e "${GREEN}✓${NC} PostgreSQL container stopped"
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL container not running"
fi

echo ""
echo -e "${GREEN}🎉 All services stopped!${NC}"
