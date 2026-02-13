# Phase 1: Foundation & Auth - User Setup Required

**Status:** Incomplete - Action Required

## Supabase Configuration

### 1. Create Supabase Project

1. Visit [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Note your project URL and anon key

### 2. Configure Environment Variables

Add to `.env.local` (file already exists at project root):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Where to find these:**
- Supabase Dashboard → Project Settings → API
- URL: Project URL
- Anon Key: `anon public` key
- Service Role Key: `service_role` key (keep secret, never expose to client)

### 3. Enable Google OAuth Provider

1. Go to Authentication → Providers → Google
2. Click **Enable**
3. Add your OAuth credentials (from Google Cloud Console)
   - Or use Supabase's test credentials for development
4. Set callback URL: `https://your-domain.com/auth/callback`

### 4. Configure Auth Settings

1. Go to Authentication → Settings
2. Set Site URL: `http://localhost:3000` (for development)
3. Add Redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback`
4. Enable **Confirm email** (recommended for production)

## Verification

After configuration, verify with:

```bash
# Check env vars are loaded
npm run dev

# Visit http://localhost:3000
# Should see Next.js app without errors
```

## Next Steps

Once Supabase is configured:
1. Plan 03 will create database schema
2. Plan 05 will build auth UI (login/register forms)
3. Plan 06 will implement protected routes

---
*Setup guide for Phase 1: Foundation & Auth*
