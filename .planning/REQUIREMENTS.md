# Requirements: Calcetto Manager

**Defined:** 2026-02-13
**Core Value:** Enable groups of friends to organize, play, and track their football matches easily, with automatic statistics and shared ratings

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can sign up with Google OAuth
- [ ] **AUTH-03**: User receives email verification after signup
- [ ] **AUTH-04**: User can reset password via email link
- [ ] **AUTH-05**: User session persists across browser refresh
- [ ] **AUTH-06**: User can log out from any page

### Team Management

- [ ] **TEAM-01**: User can create a team with name and description
- [ ] **TEAM-02**: User can add players to team with name, surname, nickname, jersey number
- [ ] **TEAM-03**: User can upload player avatar with automatic square cropping
- [ ] **TEAM-04**: User can assign multiple roles to players (goalkeeper, defender, midfielder, attacker)
- [ ] **TEAM-05**: User can generate invite link to share via WhatsApp/email
- [ ] **TEAM-06**: Invited users can join team via link
- [ ] **TEAM-07**: Team admin can remove players from team
- [ ] **TEAM-08**: Team admin can assign co-admin privileges
- [ ] **TEAM-09**: User can view team roster with player details
- [ ] **TEAM-10**: Support both 5-a-side and 8-a-side team modes

### Match Management

- [ ] **MATCH-01**: User can create match with date, time, location
- [ ] **MATCH-02**: User can select match mode (5vs5 or 8vs8)
- [ ] **MATCH-03**: User can select formation module based on match mode
- [ ] **MATCH-04**: User can assign players to match via RSVP system (IN/OUT/Maybe)
- [ ] **MATCH-05**: System displays availability count (confirmed players)
- [ ] **MATCH-06**: User can build formation with drag-and-drop interface
- [ ] **MATCH-07**: User can view match list with upcoming and past matches
- [ ] **MATCH-08**: User can edit match details before start
- [ ] **MATCH-09**: User can cancel match
- [ ] **MATCH-10**: System sends push notification reminders before match

### Live Match Experience

- [ ] **LIVE-01**: User can start live match timer (countdown or count-up)
- [ ] **LIVE-02**: Designated user (referee/captain) can record goals with scorer and assister
- [ ] **LIVE-03**: User can record yellow/red cards
- [ ] **LIVE-04**: Scoreboard updates in real-time for all connected users
- [ ] **LIVE-05**: User can pause/resume match timer
- [ ] **LIVE-06**: User can end match and trigger post-match flow
- [ ] **LIVE-07**: Interface optimized for one-handed mobile use
- [ ] **LIVE-08**: Works offline with sync when connection restored

### Post-Match Statistics

- [ ] **STAT-01**: System calculates and stores match statistics (goals, assists, cards)
- [ ] **STAT-02**: System tracks goalkeeper saves when role is goalkeeper
- [ ] **STAT-03**: System calculates player statistics aggregated over time
- [ ] **STAT-04**: User can view match history with final scores
- [ ] **STAT-05**: System calculates win/loss/draw records
- [ ] **STAT-06**: System calculates goals per match average
- [ ] **STAT-07**: User can upload match highlight photos
- [ ] **STAT-08**: System compresses images client-side before upload

### Player Ratings

- [ ] **RATE-01**: Users can submit ratings (1-10) for each player post-match
- [ ] **RATE-02**: Users can add optional comment with rating
- [ ] **RATE-03**: System calculates average rating per player per match
- [ ] **RATE-04**: System calculates overall average rating per player across matches
- [ ] **RATE-05**: Ratings can be anonymous (configurable per match)
- [ ] **RATE-06**: User can view rating history with trends

### Dashboard & Leaderboards

- [ ] **DASH-01**: Dashboard displays top scorer (most goals)
- [ ] **DASH-02**: Dashboard displays top assister (most assists)
- [ ] **DASH-03**: Dashboard displays best goalkeeper (most clean sheets)
- [ ] **DASH-04**: Dashboard displays MVP based on average rating
- [ ] **DASH-05**: User can view player profile with detailed statistics
- [ ] **DASH-06**: System displays attendance streaks
- [ ] **DASH-07**: User can filter statistics by time period (season/month)
- [ ] **DASH-08**: System displays charts for player evolution over time

### Social & Sharing

- [ ] **SOCL-01**: User can share match results to WhatsApp
- [ ] **SOCL-02**: User can share team invite link
- [ ] **SOCL-03**: User can share formations as image
- [ ] **SOCL-04**: System generates shareable match summary

### Offline Support

- [ ] **OFFL-01**: App works offline with cached data
- [ ] **OFFL-02**: User actions queue when offline
- [ ] **OFFL-03**: System syncs queued actions when connection restored
- [ ] **OFFL-04**: Service Worker caches app shell for instant load
- [ ] **OFFL-05**: Background sync for match statistics

### UI/UX

- [ ] **UIUX-01**: Mobile-first responsive design
- [ ] **UIUX-02**: Touch-friendly interface with 44px+ touch targets
- [ ] **UIUX-03**: Dark/light theme support
- [ ] **UIUX-04**: Italian and English language support
- [ ] **UIUX-05**: Onboarding tutorial for new users
- [ ] **UIUX-06**: Loading times under 2 seconds
- [ ] **UIUX-07**: Lazy loading for images and statistics

## v2 Requirements

### Gamification

- **GAME-01**: Fantasy-style points system (weighted scoring for goals, assists, wins)
- **GAME-02**: Badge system for achievements (first goal, clean sheet streak, etc.)
- **GAME-03**: Teammate voting awards (MVP, Donkey of the Day)
- **GAME-04**: Partnership analysis (best combinations)

### Advanced Features

- **ADV-01**: AI team balancing based on ratings
- **ADV-02**: AI-generated player profiles
- **ADV-03**: Tournament and league management
- **ADV-04**: Advanced statistics (heat maps, pass networks)
- **ADV-05**: Video highlights upload

### Chat & Communication

- **CHAT-01**: Team chat with real-time messaging
- **CHAT-02**: Match-specific discussions

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment processing | "Friends prefer informal settlement" - adds friction without value for casual groups |
| Club/league administration | Overkill for friend groups; targets different segment (academies/clubs) |
| Website builder | Friends don't need public websites; adds admin burden |
| Complex financial management | Fines, automated billing - too corporate for friend groups |
| Multi-sport support | Dilutes football-specific experience; focus on niche |
| Training session planning | Friend groups don't plan formal training; just play |
| Native mobile app | Project specifies web-based, no installation required |
| Email/SMS notifications | WhatsApp is primary channel; push notifications sufficient |

## Traceability

### Phase 1: Foundation & Auth (14 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | 🔴 Not Started |
| AUTH-02 | Phase 1 | 🔴 Not Started |
| AUTH-03 | Phase 1 | 🔴 Not Started |
| AUTH-04 | Phase 1 | 🔴 Not Started |
| AUTH-05 | Phase 1 | 🔴 Not Started |
| AUTH-06 | Phase 1 | 🔴 Not Started |
| OFFL-01 | Phase 1 | 🔴 Not Started |
| OFFL-02 | Phase 1 | 🔴 Not Started |
| OFFL-03 | Phase 1 | 🔴 Not Started |
| OFFL-04 | Phase 1 | 🔴 Not Started |
| OFFL-05 | Phase 1 | 🔴 Not Started |
| UIUX-03 | Phase 1 | 🔴 Not Started |
| UIUX-04 | Phase 1 | 🔴 Not Started |
| UIUX-05 | Phase 1 | 🔴 Not Started |

### Phase 2: Team Management (10 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEAM-01 | Phase 2 | 🔴 Not Started |
| TEAM-02 | Phase 2 | 🔴 Not Started |
| TEAM-03 | Phase 2 | 🔴 Not Started |
| TEAM-04 | Phase 2 | 🔴 Not Started |
| TEAM-05 | Phase 2 | 🔴 Not Started |
| TEAM-06 | Phase 2 | 🔴 Not Started |
| TEAM-07 | Phase 2 | 🔴 Not Started |
| TEAM-08 | Phase 2 | 🔴 Not Started |
| TEAM-09 | Phase 2 | 🔴 Not Started |
| TEAM-10 | Phase 2 | 🔴 Not Started |

### Phase 3: Match Management (10 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| MATCH-01 | Phase 3 | 🔴 Not Started |
| MATCH-02 | Phase 3 | 🔴 Not Started |
| MATCH-03 | Phase 3 | 🔴 Not Started |
| MATCH-04 | Phase 3 | 🔴 Not Started |
| MATCH-05 | Phase 3 | 🔴 Not Started |
| MATCH-06 | Phase 3 | 🔴 Not Started |
| MATCH-07 | Phase 3 | 🔴 Not Started |
| MATCH-08 | Phase 3 | 🔴 Not Started |
| MATCH-09 | Phase 3 | 🔴 Not Started |
| MATCH-10 | Phase 3 | 🔴 Not Started |

### Phase 4: Live Match Experience (8 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| LIVE-01 | Phase 4 | 🔴 Not Started |
| LIVE-02 | Phase 4 | 🔴 Not Started |
| LIVE-03 | Phase 4 | 🔴 Not Started |
| LIVE-04 | Phase 4 | 🔴 Not Started |
| LIVE-05 | Phase 4 | 🔴 Not Started |
| LIVE-06 | Phase 4 | 🔴 Not Started |
| LIVE-07 | Phase 4 | 🔴 Not Started |
| LIVE-08 | Phase 4 | 🔴 Not Started |

### Phase 5: Post-Match Statistics (9 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAT-01 | Phase 5 | 🔴 Not Started |
| STAT-02 | Phase 5 | 🔴 Not Started |
| STAT-03 | Phase 5 | 🔴 Not Started |
| STAT-04 | Phase 5 | 🔴 Not Started |
| STAT-05 | Phase 5 | 🔴 Not Started |
| STAT-06 | Phase 5 | 🔴 Not Started |
| STAT-07 | Phase 5 | 🔴 Not Started |
| STAT-08 | Phase 5 | 🔴 Not Started |
| UIUX-07 | Phase 5 | 🔴 Not Started |

### Phase 6: Player Ratings (6 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| RATE-01 | Phase 6 | 🔴 Not Started |
| RATE-02 | Phase 6 | 🔴 Not Started |
| RATE-03 | Phase 6 | 🔴 Not Started |
| RATE-04 | Phase 6 | 🔴 Not Started |
| RATE-05 | Phase 6 | 🔴 Not Started |
| RATE-06 | Phase 6 | 🔴 Not Started |

### Phase 7: Dashboard & Leaderboards (8 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| DASH-01 | Phase 7 | 🔴 Not Started |
| DASH-02 | Phase 7 | 🔴 Not Started |
| DASH-03 | Phase 7 | 🔴 Not Started |
| DASH-04 | Phase 7 | 🔴 Not Started |
| DASH-05 | Phase 7 | 🔴 Not Started |
| DASH-06 | Phase 7 | 🔴 Not Started |
| DASH-07 | Phase 7 | 🔴 Not Started |
| DASH-08 | Phase 7 | 🔴 Not Started |

### Phase 8: Social & Sharing (4 requirements)

| Requirement | Phase | Status |
|-------------|-------|--------|
| SOCL-01 | Phase 8 | 🔴 Not Started |
| SOCL-02 | Phase 8 | 🔴 Not Started |
| SOCL-03 | Phase 8 | 🔴 Not Started |
| SOCL-04 | Phase 8 | 🔴 Not Started |

### Cross-Cutting UI/UX (All Phases)

| Requirement | Phase | Status |
|-------------|-------|--------|
| UIUX-01 | All | 🔴 Not Started |
| UIUX-02 | All | 🔴 Not Started |
| UIUX-06 | All | 🔴 Not Started |

**Coverage Summary:**
- v1 requirements: 68 total
- Mapped to phases: 68
- Unmapped: 0 ✓
- Per-phase distribution: P1(14), P2(10), P3(10), P4(8), P5(9), P6(6), P7(8), P8(4)

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after initial definition*
