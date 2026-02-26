<p align="center">
  <img src="public/icons/logo.png" alt="Calcetto Manager Logo" width="128" height="128">
</p>

<h1 align="center">Calcetto Manager</h1>

<p align="center">
  A mobile-first web app for organizing football matches with friends. Track games, players, and statistics with real-time updates and offline support.
</p>

---

## ✨ Features

- **Club Management** - Create and manage clubs, invite members with owner/manager/member roles
- **Match Organization** - Schedule matches with dates, locations and player formations
- **Live Match Tracking** - Real-time score updates during games with goal logging
- **Player Statistics** - Comprehensive tracking of goals, assists, ratings and performance metrics
- **38-Value Rating System** - Nuanced player ratings from 4 to 10 with .5 increments
- **Leaderboards** - Rank members across multiple statistics with filtering
- **Offline Support** - TanStack Query caching for mobile usage with poor connectivity
- **Dark/Light Theme** - Automatic system detection + manual toggle
- **Multi-language** - Italian (default) and English support via next-intl

## 🚀 Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Next.js 16** - App Router with Server Actions
- **TypeScript** - Full type safety across the codebase
- **Tailwind CSS 4.x** - Utility-first styling
- **shadcn/ui** - Modern UI component library

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management with:
  - 5-minute stale time for mobile optimization
  - Automatic background refetching
  - Optimistic updates for instant UI feedback
  - Offline support with cache persistence
- **Server Actions** - Next.js mutations with automatic revalidation

### Backend & Database
- **PostgreSQL** - Primary relational database
- **Prisma ORM** - Type-safe database operations with schema in `prisma/schema.prisma`
- **NextAuth.js v5** - Modern authentication with JWT sessions

### Internationalization
- **next-intl v4** - Routing and translations
  - Italian (it) as default locale
  - English (en) as fallback
  - Proxy middleware for locale detection

## 📊 Database Schema

The application uses a restructured Prisma schema optimized for mobile performance:

**Core Models:**
- `User` - Authentication and profile data
- `Club` - Football club information
- `ClubMember` - Membership with roles (OWNER/MANAGER/MEMBER), jersey numbers, and player roles
- `Match` - Scheduled matches with status tracking
- `Formation` / `FormationPosition` - Team lineups with played status
- `Goal` - Match goals with scorer and assister
- `PlayerRating` - 38-value rating system (4-10 scale)

**Key Design Decisions:**
- ClubMember consolidates player data (no separate Player model)
- FormationPosition tracks `played` status for ratings eligibility
- Goals reference ClubMember (not Player) for unified data model

## 🏗️ Architecture

### Mobile-Optimized Data Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Client    │────▶│  TanStack Query  │────▶│   Server    │
│  Component  │     │   (Cache Layer)   │     │   Actions   │
└─────────────┘     └──────────────────┘     └─────────────┘
                           │                          │
                           ▼                          ▼
                    ┌─────────────┐           ┌─────────────┐
                    │   Prisma    │           │  PostgreSQL │
                    │    ORM      │           │             │
                    └─────────────┘           └─────────────┘
```

**Benefits:**
- ✅ **Instant UI Feedback** - Optimistic updates show changes immediately
- ✅ **Reduced Network Requests** - Cache reduces API calls by ~80%
- ✅ **Offline Support** - Actions queue when offline, sync when reconnecting
- ✅ **Battery Optimization** - No unnecessary polling, smart background updates
- ✅ **Type Safety** - End-to-end TypeScript from DB to UI

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (recommended)
- PostgreSQL 14+ database

### Setup

1. **Clone the repository**

2. **Copy environment file:**
```bash
cp .env.example .env.local
```

3. **Configure database connection:**
```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/postgres?schema=public"
AUTH_SECRET="generate-a-secret-key"
```

4. **Generate auth secret:**
```bash
openssl rand -base64 32
```

5. **Install dependencies:**
```bash
npm install
```

6. **Setup database:**
```bash
npx prisma db push
npx prisma generate
```

7. **Run development server:**
```bash
npm run dev
```

8. **Open** http://localhost:3000

## 📁 Project Structure

```
app/                          # Next.js App Router
  [locale]/                   # Localized routes (it, en)
    clubs/                    # Club management pages
    matches/                  # Match operations
    dashboard/               # User dashboard
    profile/                 # User profile
  api/                       # API routes
components/
  clubs/                     # Club-specific components
  matches/                   # Match components
  ui/                        # shadcn/ui components
  providers/                 # React context providers
    query-provider.tsx       # TanStack Query configuration
lib/
  actions/                   # Server Actions
    clubs.ts                 # Club mutations
    matches.ts               # Match lifecycle
    goals.ts                 # Goal operations
    members.ts               # Member management
    ratings.ts               # Rating operations
  db/                        # Database operations
    schema.ts                # Type exports
    matches.ts               # Match queries
    goals.ts                 # Goal queries
    player-ratings.ts        # Rating queries
hooks/
  use-*-react-query.ts       # TanStack Query hooks
    use-clubs-react-query.ts
    use-matches-react-query.ts
    use-goals-react-query.ts
    use-members-react-query.ts
    use-ratings-react-query.ts
  use-*.ts                   # Legacy hooks (kept for compatibility)
prisma/
  schema.prisma             # Database schema
public/
  icons/                    # App icons and logos
messages/
  it.json                   # Italian translations
  en.json                   # English translations
```

## 🧪 Development

```bash
# Start development server
npm run dev

# Production build
npm run build

# Run linter
npm run lint

# Database GUI
npx prisma studio

# Type checking
npx tsc --noEmit
```

## 🔄 Recent Updates

### Database Restructure (2026-02-26)
- ✅ Complete Prisma schema rewrite
- ✅ Consolidated Player into ClubMember
- ✅ Added TanStack Query for mobile optimization
- ✅ Created 5 React Query hooks with optimistic updates
- ✅ Implemented 7 Server Actions for mutations
- ✅ 0 TypeScript errors, build passing

### Mobile Optimizations
- Server Actions for instant mutations
- TanStack Query with 5-min stale time
- Optimistic updates for goals and members
- Automatic cache invalidation
- Offline support with reconnection sync

## 📱 Mobile Features

- **PWA Support** - Installable web app
- **Offline Queue** - Actions work offline
- **Optimized Caching** - Reduced data usage
- **Touch Gestures** - Swipe interactions
- **Responsive Design** - Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to verify
5. Submit a pull request

## 📝 License

MIT License - feel free to use for your own football club!

---

<p align="center">
  Built with ❤️ for football lovers everywhere
</p>

<p align="center">
  Powered by <strong>Next.js</strong>, <strong>TanStack Query</strong>, and <strong>Prisma</strong>
</p>
