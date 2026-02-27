#!/bin/bash
cd /home/ubuntu/projects/CalcettoApp
pkill -9 -f "next dev" 2>/dev/null
sleep 2
rm -rf .next/dev/lock 2>/dev/null
export NEXT_PRIVATE_LOCAL_WEBSOCKET_PROXY_HOST=0.0.0.0
exec npx next dev -H 0.0.0.0 -p 3000
