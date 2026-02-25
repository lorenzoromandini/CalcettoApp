#!/usr/bin/env python3
"""
Auto-setup GitHub Secrets for CalcettoApp

This script helps automate the creation of GitHub repository secrets.
It generates secure secrets and creates them via GitHub API.

Requirements:
- Python 3.6+
- requests library: pip install requests
- GitHub Personal Access Token with 'repo' scope

Usage:
    python3 scripts/setup-github-secrets.py --token YOUR_GITHUB_TOKEN --repo USERNAME/REPO

Or set GITHUB_TOKEN environment variable:
    export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
    python3 scripts/setup-github-secrets.py
"""

import argparse
import base64
import os
import secrets
import sys
from urllib.parse import urlparse

try:
    import requests
except ImportError:
    print("❌ Error: requests library not installed")
    print("   Install: pip install requests")
    sys.exit(1)


def generate_auth_secret():
    """Generate a secure 64-byte base64 secret for NextAuth"""
    return base64.b64encode(secrets.token_bytes(64)).decode('utf-8')


def generate_db_password():
    """Generate a strong database password"""
    # 32 characters, URL-safe
    return secrets.token_urlsafe(32)


def get_public_key(github_token, repo):
    """Get repository public key for secret encryption"""
    headers = {
        'Authorization': f'token {github_token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    url = f'https://api.github.com/repos/{repo}/actions/secrets/public-key'
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Failed to get public key: {response.status_code}")
        print(f"   Response: {response.text}")
        return None


def encrypt_secret(public_key, secret_value):
    """Encrypt secret using repository public key (NaCl/libsodium)"""
    try:
        import nacl.public
        import nacl.encoding
        
        public_key_bytes = base64.b64decode(public_key['key'])
        public_key_obj = nacl.public.PublicKey(public_key_bytes, nacl.encoding.Base64Encoder)
        
        encrypted = nacl.public.SealedBox(public_key_obj).encrypt(secret_value.encode('utf-8'))
        encrypted_value = base64.b64encode(encrypted).decode('utf-8')
        
        return encrypted_value
    except ImportError:
        print("❌ Error: pynacl library required for encryption")
        print("   Install: pip install pynacl")
        print("   Or manually add secrets via GitHub web interface")
        return None


def create_secret(github_token, repo, secret_name, secret_value, public_key):
    """Create or update a GitHub repository secret"""
    headers = {
        'Authorization': f'token {github_token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    encrypted_value = encrypt_secret(public_key, secret_value)
    if not encrypted_value:
        return False
    
    url = f'https://api.github.com/repos/{repo}/actions/secrets/{secret_name}'
    data = {
        'encrypted_value': encrypted_value,
        'key_id': public_key['key_id']
    }
    
    response = requests.put(url, headers=headers, json=data)
    
    if response.status_code in [201, 204]:
        print(f"   ✅ {secret_name}")
        return True
    else:
        print(f"   ❌ Failed to create {secret_name}: {response.status_code}")
        print(f"      Response: {response.text}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Auto-setup GitHub Secrets for CalcettoApp',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Use environment variable
  export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
  python3 scripts/setup-github-secrets.py --repo username/repo
  
  # Pass token directly
  python3 scripts/setup-github-secrets.py --token ghp_xxxxxxxxxxxx --repo username/repo
  
  # Interactive mode
  python3 scripts/setup-github-secrets.py
        """
    )
    
    parser.add_argument(
        '--token',
        help='GitHub Personal Access Token (or set GITHUB_TOKEN env var)'
    )
    parser.add_argument(
        '--repo',
        help='Repository name (e.g., username/repo)'
    )
    parser.add_argument(
        '--database-url',
        help='Production DATABASE_URL (or will be prompted)'
    )
    parser.add_argument(
        '--vercel-token',
        help='Vercel API Token (optional)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Generate secrets but do not create them (for testing)'
    )
    
    args = parser.parse_args()
    
    # Get GitHub token
    github_token = args.token or os.environ.get('GITHUB_TOKEN')
    if not github_token:
        print("❌ GitHub token required")
        print("   Get token: https://github.com/settings/tokens")
        print("   Required scopes: repo")
        print("")
        print("   Set via:")
        print("     --token flag, or")
        print("     GITHUB_TOKEN environment variable")
        sys.exit(1)
    
    # Get repository
    repo = args.repo
    if not repo:
        # Try to detect from git remote
        import subprocess
        try:
            remote = subprocess.check_output(
                ['git', 'remote', 'get-url', 'origin'],
                stderr=subprocess.DEVNULL
            ).decode().strip()
            # Parse git URL
            if 'github.com' in remote:
                if remote.startswith('git@github.com:'):
                    repo = remote.replace('git@github.com:', '').replace('.git', '')
                elif remote.startswith('https://github.com/'):
                    path = urlparse(remote).path
                    repo = path.strip('/').replace('.git', '')
        except:
            pass
    
    if not repo:
        print("❌ Repository required")
        print("   Use --repo flag or ensure git remote is set")
        sys.exit(1)
    
    print("=== CalcettoApp GitHub Secrets Auto-Setup ===")
    print("")
    print(f"Repository: {repo}")
    print("")
    
    # Generate secrets
    print("🔐 Generating secure secrets...")
    auth_secret = generate_auth_secret()
    db_password = generate_db_password()
    print("")
    
    # Display secrets (hidden values)
    print("Generated:")
    print(f"   AUTH_SECRET: {'*' * 20} (64 chars)")
    print(f"   DB_PASSWORD: {'*' * 20} (32 chars)")
    print("")
    
    # Get DATABASE_URL from user or args
    database_url = args.database_url
    if not database_url:
        print("📋 Database Configuration")
        print("   Enter your production DATABASE_URL")
        print("   Format: postgresql://user:password@host:5432/db?schema=public")
        print("   (Press Enter to skip and add manually later)")
        database_url = input("   DATABASE_URL: ").strip()
    
    # Get Vercel token if provided
    vercel_token = args.vercel_token
    if not vercel_token:
        print("")
        print("📋 Vercel Configuration (optional)")
        print("   Get token from: https://vercel.com/account/tokens")
        vercel_token = input("   VERCEL_TOKEN (or press Enter to skip): ").strip()
    
    print("")
    
    # Dry run mode
    if args.dry_run:
        print("🔍 DRY RUN MODE - Secrets generated but NOT created")
        print("")
        print("Secrets to be created:")
        print("   AUTH_SECRET: [generated]")
        if database_url:
            print("   DATABASE_URL: [provided]")
        if vercel_token:
            print("   VERCEL_TOKEN: [provided]")
        print("")
        print("Run without --dry-run to create secrets")
        return
    
    # Get public key
    print("🔑 Fetching repository public key...")
    public_key = get_public_key(github_token, repo)
    if not public_key:
        sys.exit(1)
    print("")
    
    # Create secrets
    print("🚀 Creating GitHub Secrets...")
    print("")
    
    success_count = 0
    total_count = 0
    
    # AUTH_SECRET
    total_count += 1
    if create_secret(github_token, repo, 'AUTH_SECRET', auth_secret, public_key):
        success_count += 1
    
    # DATABASE_URL
    if database_url:
        total_count += 1
        if create_secret(github_token, repo, 'DATABASE_URL', database_url, public_key):
            success_count += 1
    else:
        print("   ⏭️  DATABASE_URL (skipped - add manually)")
    
    # VERCEL_TOKEN
    if vercel_token:
        total_count += 1
        if create_secret(github_token, repo, 'VERCEL_TOKEN', vercel_token, public_key):
            success_count += 1
    else:
        print("   ⏭️  VERCEL_TOKEN (skipped - add manually)")
    
    print("")
    print(f"✅ Created {success_count}/{total_count} secrets")
    print("")
    
    if success_count < total_count:
        print("⚠️  Some secrets failed to create. Check errors above.")
        print("   You can add them manually at:")
        print(f"   https://github.com/{repo}/settings/secrets/actions")
    else:
        print("🎉 All secrets created successfully!")
        print("")
        print("Next steps:")
        print("   1. Add VERCEL_ORG_ID and VERCEL_PROJECT_ID (get from Vercel dashboard)")
        print("   2. Push code to main branch to trigger deployment")
    
    print("")
    print("📚 Full documentation: docs/GITHUB_SECRETS.md")


if __name__ == '__main__':
    main()
