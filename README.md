<p align="center">
  <img src="public/icons/logo.png" alt="Calcetto Manager Logo" width="128" height="128">
</p>

<h1 align="center">Calcetto Manager</h1>

<p align="center">
  A mobile-first web app for organizing football matches with friends. Track games, players, and statistics.
</p>

---

## Features

- **Club Management** - Create and manage clubs, add members with roles
- **Match Organization** - Schedule matches, set dates and locations
- **Live Match Tracking** - Real-time score updates during games
- **Player Statistics** - Track goals, assists, and performance metrics
- **Player Ratings** - Rate members after each match
- **Leaderboards** - Rank members across multiple statistics
- **Dark/Light Theme** - Automatic system detection + manual toggle
- **Multi-language** - Italian (default) and English support

## Tech Stack

- **Frontend**: React 19 + Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4.x + shadcn/ui components
- **i18n**: next-intl v4

## Implementation

### Database & ORM
- **PostgreSQL** - Primary relational database
- **Prisma** - Type-safe ORM for database operations
  - Schema defined in `prisma/schema.prisma`
  - Models: User, Club, ClubMember, ClubInvite, Match, Formation, FormationPosition, Goal, PlayerRating
  - Run `npx prisma studio` to explore data

### Authentication
- **NextAuth.js v5** - Modern authentication solution
  - Credentials provider (email/password)
  - JWT-based sessions
  - bcryptjs for password hashing
  - Custom sign-in/sign-up API routes

### Internationalization
- **next-intl** - Routing and translations
  - Italian (it) as default locale
  - English (en) as fallback
  - Proxy for locale detection and routing

### Theming
- **next-themes** - Dark/light mode with system preference detection
- Tailwind CSS 4.x CSS variables for theming

## Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- PostgreSQL database

### Setup

1. Clone the repository

2. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your database URL:

```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/postgres?schema=public"
AUTH_SECRET="generate-a-secret-key"
```

4. Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```

5. Install dependencies:

```bash
npm install
```

6. Push database schema:

```bash
npx prisma db push
```

7. Run development server:

```bash
npm run dev
```

8. Open http://localhost:3000

## Project Structure

```
app/                    # Next.js App Router pages
components/             # React components (UI, auth)
lib/                    # Utilities, auth, database
  auth.ts               # NextAuth configuration
  db/                   # Database operations
hooks/                  # Custom React hooks
messages/               # i18n translation files (it.json, en.json)
prisma/                 # Database schema
public/                 # Static assets, icons
```

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
npx prisma studio  # Database GUI
```

## License

MIT

---

Built with **Opencode**, **GET SHIT DONE**, and models **Kimi K2.5 free** and **GLM-5 free**
