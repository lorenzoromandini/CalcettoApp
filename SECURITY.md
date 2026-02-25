# Security Documentation

## Overview

This document outlines the security measures implemented for the CalcettoApp project, specifically focusing on secrets management, environment configuration, and secure deployment practices.

## Secrets Management

### Local Development

**Environment Variables**
- All sensitive configuration is stored in `.env` (local file only)
- `.env` is **NOT** committed to version control (listed in `.gitignore`)
- `.env.example` provides a template with empty values for reference

**Current `.env` structure:**
```
DATABASE_URL=postgresql://postgres@localhost:5432/calcetto?schema=public
AUTH_SECRET=<rotated-secure-secret>
```

### GitHub Repository Secrets

**Implemented 2026-02-25:**

Secrets are securely stored in GitHub's encrypted secrets store and used by GitHub Actions workflows:

| Secret | Status | Purpose |
|--------|--------|---------|
| `DATABASE_URL` | ✅ Set | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ Set | NextAuth.js authentication secret |
| `AUTH_GOOGLE_ID` | ⏸️ Optional | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | ⏸️ Optional | Google OAuth client secret |
| `AUTH_GITHUB_ID` | ⏸️ Optional | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | ⏸️ Optional | GitHub OAuth client secret |
| `RESEND_API_KEY` | ⏸️ Optional | Email service API key |

**Security Benefits:**
- Secrets never appear in code or commit history
- Encrypted at rest by GitHub
- Only accessible to authorized GitHub Actions runners
- Automatic injection at runtime via `${{ secrets.XXX }}` syntax

## Automated Security Tools

### Python Secrets Manager

**Location:** `scripts/manage_secrets.py`

**Features:**
1. **Secret Generation**: Cryptographically secure random generation using `secrets` module
2. **Environment Validation**: Validates `.env` file for required secrets and weak passwords
3. **Secret Rotation**: Safely rotates secrets with automatic backup
4. **GitHub Integration**: Push secrets directly to GitHub repository via CLI

**Usage:**

```bash
# Validate current .env configuration
python3 scripts/manage_secrets.py validate

# Rotate AUTH_SECRET
python3 scripts/manage_secrets.py rotate

# Push secrets to GitHub
python3 scripts/manage_secrets.py github-push

# List GitHub repository secrets
python3 scripts/manage_secrets.py github-list
```

### GitHub CLI Integration

**Installation:** Automated via package manager

**Authentication:**
- Token-based authentication for headless/SSH environments
- Secure credential storage in `~/.config/gh/hosts.yml`
- Scope validation before operations

**Security Considerations:**
- Personal Access Tokens should be rotated regularly
- Store tokens in secure credential managers
- Never commit tokens to repositories

## GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

**Security Features:**

1. **Secret Injection**: Workflow references secrets without exposing values
   ```yaml
   env:
     DATABASE_URL: ${{ secrets.DATABASE_URL }}
     AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
   ```

2. **Build-time Validation**: Type checking and linting with secrets available

3. **Conditional Deployment**: Only deploys from `main` branch

4. **No Hardcoded Secrets**: All sensitive data comes from GitHub's secrets store

## Security Best Practices

### Do's ✓

- ✅ Keep `.env` local and ignored by git
- ✅ Use strong, randomly generated secrets (64+ characters)
- ✅ Rotate secrets periodically (especially AUTH_SECRET)
- ✅ Store production secrets in GitHub repository settings
- ✅ Validate environment configuration before deployment
- ✅ Use HTTPS for all external communications
- ✅ Limit OAuth provider scopes to minimum required

### Don'ts ✗

- ⛔ Never commit `.env` or any file containing real secrets
- ⛔ Never share Personal Access Tokens in chat or documentation
- ⛔ Never hardcode secrets in application code
- ⛔ Never expose secrets in logs or error messages
- ⛔ Never use the same secret for development and production

## Secret Rotation Procedure

When rotating secrets (e.g., after potential exposure):

1. **Generate new secret:**
   ```bash
   python3 scripts/manage_secrets.py rotate
   ```

2. **Update GitHub repository:**
   ```bash
   python3 scripts/manage_secrets.py github-push
   ```

3. **Restart application** to pick up new secrets

4. **Verify** old secret no longer works

5. **Revoke** old tokens if applicable

## Incident Response

**If secrets are accidentally exposed:**

1. Immediately rotate the exposed secret
2. Check git history: `git log --all --full-history -- .env`
3. If committed, use BFG Repo-Cleaner or filter-branch to remove
4. Revoke any exposed tokens/API keys at provider level
5. Update GitHub repository secrets
6. Review access logs for unauthorized usage

## Additional Security Recommendations

### For Production Deployment

1. **Database Security:**
   - Use connection pooling (PgBouncer)
   - Enable SSL/TLS for database connections
   - Use separate database users for different services

2. **Authentication:**
   - Implement rate limiting on auth endpoints
   - Use short-lived JWT tokens
   - Enable MFA for admin accounts

3. **Infrastructure:**
   - Use secrets management service (AWS Secrets Manager, Azure Key Vault)
   - Enable audit logging
   - Set up security alerts for suspicious activity

## Tools & Resources

- **GitHub CLI**: https://cli.github.com/manual/
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions
- **Python Secrets**: https://docs.python.org/3/library/secrets.html
- **NextAuth.js Security**: https://next-auth.js.org/configuration/options#secret

---

**Last Updated:** 2026-02-25
**Maintainer:** Security Team
**Next Review:** Quarterly or after security incidents

## Original Security Guide

### Environment Variables

**⚠️ CRITICAL:** Never commit `.env` files containing real secrets to git.

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

**NextAuth Secret** (required):
```bash
openssl rand -base64 64
```

### Database Security

- Use strong PostgreSQL passwords
- Enable SSL/TLS in production
- Restrict database access to application servers only
- Regular backups with encrypted storage

### OAuth Security

- Use HTTPS-only callbacks
- Validate state parameters
- Implement PKCE for public clients
- Store tokens securely (httpOnly cookies)

### Reporting Security Issues

Contact: security@calcetto.app
