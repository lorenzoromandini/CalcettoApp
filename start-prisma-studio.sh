#!/bin/bash
# Start Prisma Studio with proper environment
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calcetto?schema=public"
cd /home/lromandini/projects/CalcettoApp
npx prisma studio --port 5555