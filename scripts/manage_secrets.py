#!/usr/bin/env python3
"""
CalcettoApp Secrets Manager
Automates secure secret generation and GitHub repository secrets management.
"""

import os
import sys
import secrets
import base64
import subprocess
import argparse
from pathlib import Path
from typing import Dict, Optional, Tuple


class SecretGenerator:
    """Generates cryptographically secure secrets."""
    
    @staticmethod
    def generate_auth_secret(length: int = 64) -> str:
        """Generate a secure random string for auth secrets."""
        return base64.b64encode(secrets.token_bytes(length)).decode('utf-8')
    
    @staticmethod
    def generate_db_password(length: int = 32) -> str:
        """Generate a secure database password."""
        alphabet = secrets.token_urlsafe(length)
        return alphabet[:length]
    
    @staticmethod
    def generate_jwt_secret() -> str:
        """Generate a JWT signing secret."""
        return secrets.token_urlsafe(64)


class GitHubSecretsManager:
    """Manages GitHub repository secrets via gh CLI."""
    
    def __init__(self, repo: Optional[str] = None):
        self.repo = repo
        self._check_gh_cli()
    
    def _check_gh_cli(self) -> None:
        """Verify GitHub CLI is installed and authenticated."""
        try:
            result = subprocess.run(
                ['gh', 'auth', 'status'],
                capture_output=True,
                text=True,
                check=True
            )
            print("✓ GitHub CLI authenticated")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("✗ GitHub CLI not installed or not authenticated")
            print("  Run: gh auth login")
            sys.exit(1)
    
    def _run_gh_command(self, args: list) -> Tuple[bool, str]:
        """Execute a gh CLI command."""
        cmd = ['gh', 'secret'] + args
        if self.repo:
            cmd.extend(['-R', self.repo])
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return True, result.stdout
        except subprocess.CalledProcessError as e:
            return False, e.stderr
    
    def set_secret(self, name: str, value: str) -> bool:
        """Set a secret in GitHub repository."""
        success, output = self._run_gh_command(['set', name, '-b', value])
        if success:
            print(f"✓ Set secret: {name}")
            return True
        else:
            print(f"✗ Failed to set {name}: {output}")
            return False
    
    def list_secrets(self) -> list:
        """List existing secrets in the repository."""
        success, output = self._run_gh_command(['list'])
        if success:
            return output.strip().split('\n') if output else []
        return []
    
    def delete_secret(self, name: str) -> bool:
        """Delete a secret from the repository."""
        success, output = self._run_gh_command(['delete', name, '-y'])
        if success:
            print(f"✓ Deleted secret: {name}")
            return True
        else:
            print(f"✗ Failed to delete {name}: {output}")
            return False


class EnvironmentValidator:
    """Validates environment configuration."""
    
    REQUIRED_SECRETS = [
        'DATABASE_URL',
        'AUTH_SECRET',
    ]
    
    OPTIONAL_SECRETS = [
        'AUTH_GOOGLE_ID',
        'AUTH_GOOGLE_SECRET',
        'AUTH_GITHUB_ID',
        'AUTH_GITHUB_SECRET',
        'RESEND_API_KEY',
    ]
    
    @staticmethod
    def validate_env_file(env_path: Path) -> Dict[str, any]:
        """Validate .env file exists and contains required secrets."""
        results = {
            'exists': False,
            'missing_required': [],
            'empty_values': [],
            'weak_secrets': [],
            'status': 'invalid'
        }
        
        if not env_path.exists():
            return results
        
        results['exists'] = True
        env_content = env_path.read_text()
        
        # Check for required secrets
        for secret in EnvironmentValidator.REQUIRED_SECRETS:
            if secret not in env_content:
                results['missing_required'].append(secret)
        
        # Parse and check values
        for line in env_content.split('\n'):
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                
                if key in EnvironmentValidator.REQUIRED_SECRETS and not value:
                    results['empty_values'].append(key)
                
                # Check for weak AUTH_SECRET
                if key == 'AUTH_SECRET' and value:
                    if len(value) < 32:
                        results['weak_secrets'].append(f"{key} (too short: {len(value)} chars)")
        
        if not results['missing_required'] and not results['empty_values']:
            results['status'] = 'valid'
        
        return results
    
    @staticmethod
    def print_validation_report(results: Dict):
        """Print validation report."""
        print("\n" + "=" * 50)
        print("ENVIRONMENT VALIDATION REPORT")
        print("=" * 50)
        
        if not results['exists']:
            print("✗ .env file not found")
            return
        
        print("✓ .env file exists")
        
        if results['missing_required']:
            print(f"\n✗ Missing required secrets:")
            for secret in results['missing_required']:
                print(f"  - {secret}")
        
        if results['empty_values']:
            print(f"\n⚠ Empty required secrets:")
            for secret in results['empty_values']:
                print(f"  - {secret}")
        
        if results['weak_secrets']:
            print(f"\n⚠ Weak secrets detected:")
            for secret in results['weak_secrets']:
                print(f"  - {secret}")
        
        if results['status'] == 'valid':
            print("\n✓ All validations passed!")
        
        print("=" * 50 + "\n")


def generate_env_template():
    """Generate a new .env file with secure secrets."""
    generator = SecretGenerator()
    
    template = f"""# CalcettoApp Environment Configuration
# Generated: {__import__('datetime').datetime.now().isoformat()}
# DO NOT commit this file to version control

# Database
DATABASE_URL="postgresql://postgres@localhost:5432/calcetto?schema=public"

# NextAuth Secret
AUTH_SECRET="{generator.generate_auth_secret()}"

# OAuth Providers (optional - add via GitHub secrets if needed)
# AUTH_GOOGLE_ID=""
# AUTH_GOOGLE_SECRET=""
# AUTH_GITHUB_ID=""
# AUTH_GITHUB_SECRET=""

# Resend Email (optional)
# RESEND_API_KEY=""

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
"""
    
    return template


def main():
    parser = argparse.ArgumentParser(
        description='Manage CalcettoApp secrets and environment configuration'
    )
    parser.add_argument(
        'action',
        choices=['validate', 'generate', 'rotate', 'github-push', 'github-list'],
        help='Action to perform'
    )
    parser.add_argument(
        '--repo',
        help='GitHub repository (owner/repo format)',
        default=None
    )
    parser.add_argument(
        '--env-file',
        help='Path to .env file',
        default='.env'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force overwrite without confirmation'
    )
    
    args = parser.parse_args()
    
    env_path = Path(args.env_file)
    
    if args.action == 'validate':
        results = EnvironmentValidator.validate_env_file(env_path)
        EnvironmentValidator.print_validation_report(results)
        sys.exit(0 if results['status'] == 'valid' else 1)
    
    elif args.action == 'generate':
        if env_path.exists() and not args.force:
            response = input(f"{env_path} exists. Overwrite? [y/N]: ")
            if response.lower() != 'y':
                print("Cancelled")
                sys.exit(0)
        
        template = generate_env_template()
        env_path.write_text(template)
        print(f"✓ Generated new .env file at {env_path}")
        print("⚠ IMPORTANT: Add .env to .gitignore if not already done!")
    
    elif args.action == 'rotate':
        if not env_path.exists():
            print(f"✗ {env_path} not found")
            sys.exit(1)
        
        print("Rotating AUTH_SECRET...")
        generator = SecretGenerator()
        new_secret = generator.generate_auth_secret()
        
        # Read current content
        content = env_path.read_text()
        
        # Replace AUTH_SECRET
        import re
        new_content = re.sub(
            r'AUTH_SECRET="[^"]*"',
            f'AUTH_SECRET="{new_secret}"',
            content
        )
        
        # Backup old file
        backup_path = Path(f"{env_path}.backup.{__import__('time').time()}")
        env_path.rename(backup_path)
        print(f"✓ Backed up to {backup_path}")
        
        # Write new content
        env_path.write_text(new_content)
        print(f"✓ Rotated AUTH_SECRET in {env_path}")
        print("⚠ Remember to restart your application!")
    
    elif args.action == 'github-push':
        if not env_path.exists():
            print(f"✗ {env_path} not found")
            sys.exit(1)
        
        gh = GitHubSecretsManager(args.repo)
        
        # Read .env and push to GitHub
        content = env_path.read_text()
        secrets_pushed = 0
        
        for line in content.split('\n'):
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                
                if value and not key.startswith('NEXT_PUBLIC'):
                    if gh.set_secret(key, value):
                        secrets_pushed += 1
        
        print(f"\n✓ Pushed {secrets_pushed} secrets to GitHub")
    
    elif args.action == 'github-list':
        gh = GitHubSecretsManager(args.repo)
        secrets_list = gh.list_secrets()
        
        print("\nGitHub Repository Secrets:")
        print("-" * 40)
        for secret in secrets_list:
            if secret:
                print(f"  • {secret}")
        print("-" * 40)


if __name__ == '__main__':
    main()
