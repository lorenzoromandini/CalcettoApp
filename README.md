# Calcetto Manager

A mobile-first PWA for organizing football matches with friends. Track games, players, and statistics with offline support for use on the pitch.

## Features

- **Team Management** - Create and manage teams, add players
- **Match Organization** - Schedule matches, set dates and locations
- **Live Match Tracking** - Real-time score updates during games
- **Player Statistics** - Track goals, assists, and performance metrics
- **Player Ratings** - Rate teammates after each match
- **Leaderboards** - Rank players across multiple statistics
- **Offline Support** - Works without internet connection
- **Dark/Light Theme** - Automatic system detection + manual toggle
- **Multi-language** - Italian (default) and English support

## Tech Stack

- **Frontend**: React 19 + Next.js 15 (App Router)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Offline**: IndexedDB (idb) + Service Worker (Workbox)
- **Styling**: Tailwind CSS 4.x + shadcn/ui
- **PWA**: Manifest, Service Worker, offline fallback
- **i18n**: next-intl v4

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for self-hosted Supabase)

### Setup

1. Clone the repository
2. Start Supabase locally:

```bash
cd supabase
chmod +x setup.sh
./setup.sh
```

3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Get the anon key from `supabase/.env` and add it to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Install dependencies:

```bash
npm install
```

6. Run development server:

```bash
npm run dev
```

7. Open http://localhost:3000

### Supabase Dashboard

Access the local Supabase Studio at http://localhost:54323 to:
- Manage database tables
- View/edit data
- Configure authentication

### Stopping Supabase

```bash
cd supabase
docker compose down
```

## Project Structure

```
app/                    # Next.js App Router pages
components/            # React components
lib/                   # Utilities, DB, Supabase client
hooks/                 # Custom React hooks
messages/              # i18n translation files
public/                # Static assets, icons
scripts/               # Build scripts
supabase/              # Self-hosted Supabase configuration
```

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
```

## License

MIT

---

Built with **Opencode**, **get-your-shit-done**, and **Kimi2.5 Free**
