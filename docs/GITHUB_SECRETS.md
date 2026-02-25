# GitHub Secrets Setup Guide

## Production Deployment Configuration

This application uses GitHub Actions for CI/CD and requires secrets to be configured in the GitHub repository.

## Required Secrets

### 1. DATABASE_URL (Required)
Production PostgreSQL connection string.

**Format:**
```
postgresql://username:password@host:port/database?schema=public
```

**Example:**
```
postgresql://calcetto_prod:YourStrongPassword123!@db.example.com:5432/calcetto?schema=public
```

**Where to set:**
1. Go to: `https://github.com/YOUR_USERNAME/CalcettoApp/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `DATABASE_URL`
4. Value: Your production database URL

### 2. AUTH_SECRET (Required)
NextAuth cryptographic secret (minimum 64 characters).

**Generate:**
```bash
openssl rand -base64 64
```

**Where to set:**
1. Go to: `https://github.com/YOUR_USERNAME/CalcettoApp/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `AUTH_SECRET`
4. Value: Generated secret from above

### 3. VERCEL_TOKEN (Required for Vercel deployment)
Your Vercel API token.

**Get it from:**
1. Go to: https://vercel.com/account/tokens
2. Create new token
3. Copy the token

### 4. VERCEL_ORG_ID (Required for Vercel deployment)
Your Vercel organization ID.

**Get it from:**
1. Go to: https://vercel.com/dashboard
2. Open browser dev tools → Network tab
3. Look for API calls containing `orgId`

### 5. VERCEL_PROJECT_ID (Required for Vercel deployment)
Your Vercel project ID.

**Get it from:**
1. Go to: https://vercel.com/dashboard
2. Open your project
3. Check URL or API calls for `projectId`

## Optional Secrets

### AUTH_GOOGLE_ID & AUTH_GOOGLE_SECRET
For Google OAuth authentication.

**Get them from:**
1. Go to: https://console.cloud.google.com/
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs

### RESEND_API_KEY
For email sending functionality.

**Get it from:**
1. Go to: https://resend.com/
2. Create account and generate API key

## Security Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Use different secrets** for staging and production
3. **Rotate secrets** every 90 days
4. **Use strong passwords** for database (32+ characters)
5. **Enable 2FA** on GitHub account
6. **Restrict secret access** to specific environments

## Environment Variables Priority

GitHub Actions uses this priority order:
1. Repository secrets (highest)
2. Organization secrets
3. Environment variables in workflow file (lowest)

## Local Development vs Production

| Variable | Local (.env) | Production (GitHub Secrets) |
|----------|--------------|-------------------------------|
| DATABASE_URL | Local PostgreSQL | Production PostgreSQL |
| AUTH_SECRET | Generate locally | Generate for production |
| AUTH_GOOGLE_ID | Development credentials | Production credentials |
| NEXT_PUBLIC_APP_URL | http://localhost:3000 | https://calcetto.app |

## Troubleshooting

### Secret not found?
- Check if secret name matches exactly (case-sensitive)
- Verify secret is saved in correct repository
- Ensure workflow has access to secrets

### Database connection failed?
- Verify DATABASE_URL format
- Check if database allows connections from GitHub Actions IP
- Ensure SSL is enabled for production databases
