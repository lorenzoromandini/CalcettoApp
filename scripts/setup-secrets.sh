#!/bin/bash
# setup-secrets.sh - Master script to setup all secrets

echo "=== CalcettoApp Secrets Setup ==="
echo ""

# Step 1: Generate secrets first
echo "🔐 Step 1: Generating secure secrets..."
echo ""
bash scripts/generate-secrets.sh
echo ""

echo "================================"
echo ""
echo "📋 Next, run the GitHub setup:"
echo ""
echo "Option 1 - Interactive setup:"
echo "   python3 scripts/setup-github-secrets.py --repo YOUR_USERNAME/CalcettoApp"
echo ""
echo "Option 2 - With GitHub token (auto-mode):"
echo "   export GITHUB_TOKEN=ghp_xxxxxxxxxxxx"
echo "   python3 scripts/setup-github-secrets.py --repo YOUR_USERNAME/CalcettoApp"
echo ""
echo "Option 3 - GitHub CLI (easiest):"
echo "   # Install: https://cli.github.com/"
echo "   gh auth login"
echo "   bash scripts/create-secrets-template.sh"
echo ""
echo "================================"
echo ""
echo "✅ Your secrets have been backed up to:"
echo "   .secrets/backup/.env.backup.*"
echo ""
echo "⚠️  IMPORTANT: Keep your .env file safe!"
echo "   - Never commit it"
echo "   - Never share it"
echo "   - Keep backups secure"
