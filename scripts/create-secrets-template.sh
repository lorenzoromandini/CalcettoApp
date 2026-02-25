#!/bin/bash
# create-secrets-template.sh - Creates a template for adding secrets to GitHub

echo "=== GitHub Secrets Setup Helper ==="
echo ""

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI (gh) is installed"
    echo ""
    
    # Check if logged in
    if gh auth status &> /dev/null; then
        echo "✅ You are logged in to GitHub CLI"
        echo ""
        
        # Get repo info
        REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
        if [ -n "$REPO" ]; then
            echo "Repository detected: $REPO"
            echo ""
        fi
    else
        echo "⚠️  Please login first: gh auth login"
        echo ""
    fi
else
    echo "⚠️  GitHub CLI not installed"
    echo "   Install: https://cli.github.com/"
    echo ""
fi

# Generate secrets
AUTH_SECRET=$(openssl rand -base64 64)
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '/+' | cut -c1-32)

cat > /tmp/github-secrets-commands.txt << 'EOF'
=== GitHub Secrets Commands ===

Run these commands to set up your secrets:

# 1. Set AUTH_SECRET
gh secret set AUTH_SECRET \
  --repo YOUR_USERNAME/CalcettoApp \
  --body "REPLACE_WITH_AUTH_SECRET_BELOW"

# 2. Set DATABASE_URL (replace placeholders with your values)
gh secret set DATABASE_URL \
  --repo YOUR_USERNAME/CalcettoApp \
  --body "postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE?schema=public"

# 3. Set Vercel secrets (get these from vercel.com)
gh secret set VERCEL_TOKEN --repo YOUR_USERNAME/CalcettoApp --body "your-vercel-token"
gh secret set VERCEL_ORG_ID --repo YOUR_USERNAME/CalcettoApp --body "your-vercel-org-id"
gh secret set VERCEL_PROJECT_ID --repo YOUR_USERNAME/CalcettoApp --body "your-vercel-project-id"

=== Generated Secrets (COPY THESE) ===

EOF

echo "AUTH_SECRET=" >> /tmp/github-secrets-commands.txt
echo "$AUTH_SECRET" >> /tmp/github-secrets-commands.txt
echo "" >> /tmp/github-secrets-commands.txt
echo "Strong Password for DB=" >> /tmp/github-secrets-commands.txt
echo "$DB_PASSWORD" >> /tmp/github-secrets-commands.txt
echo "" >> /tmp/github-secrets-commands.txt

cat >> /tmp/github-secrets-commands.txt << 'EOF'

=== Instructions ===

1. Install GitHub CLI: https://cli.github.com/
2. Login: gh auth login
3. Replace YOUR_USERNAME with your GitHub username
4. Replace DATABASE_URL placeholders with your values
5. Get Vercel tokens from: https://vercel.com/account/tokens
6. Run the commands above

OR manually via web:
- https://github.com/YOUR_USERNAME/CalcettoApp/settings/secrets/actions

EOF

cat /tmp/github-secrets-commands.txt

# Also save to file
cp /tmp/github-secrets-commands.txt /home/ubuntu/projects/CalcettoApp/.secrets/github-secrets-setup.txt

echo ""
echo "✅ Commands saved to: .secrets/github-secrets-setup.txt"
echo ""
echo "⚠️  IMPORTANT: Delete this file after setting up secrets!"
echo "   Run: rm .secrets/github-secrets-setup.txt"
