#!/bin/bash
# generate-secrets.sh - Helper script to generate secure secrets

echo "=== CalcettoApp Secret Generator ==="
echo ""

# Generate AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 64)
echo "1. AUTH_SECRET (for NextAuth):"
echo "$AUTH_SECRET"
echo ""

# Generate DATABASE_URL template
echo "2. DATABASE_URL template:"
echo 'postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE?schema=public'
echo ""
echo "   Replace:"
echo "   - USERNAME: your db username"
echo "   - PASSWORD: strong password (generate below)"
echo "   - HOST: your db host"
echo "   - DATABASE: your db name"
echo ""

# Generate strong database password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+' | cut -c1-32)
echo "3. Suggested strong database password:"
echo "$DB_PASSWORD"
echo ""

# Generate JWT secret (if needed for custom JWT)
JWT_SECRET=$(openssl rand -base64 32)
echo "4. JWT_SECRET (optional):"
echo "$JWT_SECRET"
echo ""

echo "=== Next Steps ==="
echo "1. Copy AUTH_SECRET above"
echo "2. Go to: https://github.com/YOUR_USERNAME/CalcettoApp/settings/secrets/actions"
echo "3. Click 'New repository secret'"
echo "4. Add: AUTH_SECRET = [copied value]"
echo "5. Add: DATABASE_URL = [your production db url]"
echo ""
echo "See docs/GITHUB_SECRETS.md for full instructions"
