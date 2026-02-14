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
- Supabase account

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Install dependencies:

```bash
npm install
```

4. Run development server:

```bash
npm run dev
```

5. Open http://localhost:3000

### Supabase Setup

1. Create a new Supabase project
2. Run migrations in `lib/db/schema.ts` to create tables
3. Enable Google OAuth in Authentication -> Providers (optional)

## Project Structure

```
app/                    # Next.js App Router pages
components/            # React components
lib/                   # Utilities, DB, Supabase client
hooks/                 # Custom React hooks
messages/              # i18n translation files
public/                # Static assets, icons
scripts/               # Build scripts
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
