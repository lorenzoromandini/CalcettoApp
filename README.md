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
- **Styling**: Tailwind CSS 4.x + shadcn/ui components
- **PWA**: Manifest, Service Worker, offline fallback
- **i18n**: next-intl v4

## Implementation

### Database & ORM
- **PostgreSQL** - Primary relational database hosted in Docker
- **Prisma** - Type-safe ORM for database operations
  - Schema defined in `prisma/schema.prisma`
  - Models: User, Account, Session, VerificationToken
  - Run `npx prisma studio` to explore data

### Authentication
- **NextAuth.js v5** - Modern authentication solution
  - Credentials provider (email/password)
  - JWT-based sessions
  - bcryptjs for password hashing
  - Custom sign-in/sign-up API routes

### Offline Support
- **IndexedDB** - Browser-based NoSQL database via `idb` library
- **Service Worker** - Workbox for caching and offline functionality
  - Precache for app shell
  - Runtime caching for static assets
  - Background sync for offline mutations

### Internationalization
- **next-intl** - Routing and translations
  - Italian (it) as default locale
  - English (en) as fallback
  - Middleware for locale detection and routing

### Theming
- **next-themes** - Dark/light mode with system preference detection
- Tailwind CSS 4.x CSS variables for theming

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- Docker (for PostgreSQL)

### Setup

1. Clone the repository
2. Start PostgreSQL with Docker:

```bash
docker run -d \
  --name calcetto-db \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  supabase/postgres:15.8.1.085
```

3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your database URL:

```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/postgres?schema=public"
AUTH_SECRET="generate-a-secret-key"
```

5. Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```

6. Install dependencies:

```bash
npm install
```

7. Push database schema:

```bash
npx prisma db push
```

8. Run development server:

```bash
npm run dev
```

9. Open http://localhost:3000

## Project Structure

```
app/                    # Next.js App Router pages
components/            # React components (UI, auth)
lib/                   # Utilities, auth, database
  auth.ts              # NextAuth configuration
  prisma.ts            # Prisma client singleton
hooks/                 # Custom React hooks
messages/              # i18n translation files (it.json, en.json)
prisma/                # Database schema
public/                # Static assets, icons, service worker
```

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
npx prisma studio # Database GUI
```

## License

MIT

---

Built with **Opencode**, **GET SHIT DONE**, and **model Kimi K2.5 Free**
