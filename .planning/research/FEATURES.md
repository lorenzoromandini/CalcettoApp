# Feature Landscape

**Domain:** Amateur Football (5-a-side / 8-a-side) Team Management App
**Researched:** February 2026
**Confidence:** HIGH (multiple authoritative sources, verified 2025-2026 data)

## Executive Summary

The amateur football team management app market has evolved significantly. **Table stakes** features are now well-established: scheduling, availability tracking, basic statistics, and communication tools. Users expect these as baseline functionality—without them, the product feels broken.

**Differentiators** in this space center on:
1. **Gamification & Engagement** - Fantasy-style scoring, streaks, badges, and player profiles that create emotional investment
2. **Formation/Tactical Tools** - Drag-and-drop lineup builders with visual pitch representation
3. **Live Match Experience** - Real-time scoring, timer, and event tracking optimized for mobile pitch-side use
4. **AI/Intelligence** - Auto-balanced teams, insights, and pattern recognition (emerging but not yet table stakes)

**Anti-features** are bloated functionality that adds complexity without value for casual groups: payment processing (adds friction for friend groups), league administration tools, and website builders.

The key insight: **Casual friend groups prioritize fun and engagement over administrative efficiency.** This is the opposite of club/academy management tools. Build for banter, not bureaucracy.

---

## Table Stakes

Features users expect. Missing = product feels incomplete. These are "must-have" for any credible football team management app in 2026.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Team/Player Management** | Core of any team app - adding players, profiles, basic info | Low | Standard across all apps (TeamStats, Spond, Mingle, etc.) |
| **Match Scheduling** | Creating matches with date, time, location | Low | Universal requirement; maps/directions expected |
| **RSVP/Availability Tracking** | "Who's coming?" is the #1 question every week | Low | One-tap responses critical; automated reminders expected |
| **Basic Match Scoring** | Recording goals, final score | Low | Even simple apps have this; Live timer is now standard |
| **Basic Statistics** | Goals, assists, appearances tracked over time | Medium | Users expect season-long aggregation and simple leaderboards |
| **Team Communication** | Announcements, match updates, chat | Low | Most groups use WhatsApp; app must integrate or replace |
| **Formation/Lineup Display** | Visual representation of who's playing where | Medium | Expected for match planning; drag-and-drop preferred |
| **Match History** | Record of past games, scores, lineups | Low | Table stakes for any stats tracking |
| **Multiple Team Support** | Handle 5-a-side and 8-a-side modes | Low | Critical for Calcetto's specific use case |
| **Mobile-First Design** | Works smoothly on smartphones pitch-side | Medium | 2026 expectation; desktop-only is disqualifying |

---

## Differentiators

Features that set product apart. Not expected, but create engagement and competitive advantage. These are "delighters" that drive word-of-mouth.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Drag-and-Drop Formation Builder** | Visual pitch with jersey positioning; saves mental work for captains | Medium | Tactico and Capo highlight this as key differentiator; most apps lack or have poor implementations |
| **Live Match Timer + Events** | Real-time match tracking with goal/assist/card logging during play | Medium | Must be one-thumb operable, rain-friendly, offline-capable |
| **Player Ratings (1-10)** | Post-match peer ratings create engagement and banter | Low | HIGH engagement driver per research; TeamStats has this |
| **Fantasy-Style Points System** | Points for goals, assists, wins, clean sheets; season-long competition | Medium | Capo and SENTR show this drives obsession; "makes kickabout something they talk about all week" |
| **Streaks & Badges** | Visual rewards for attendance, scoring runs, unbeaten patches | Low-Medium | Gamification essential for retention; "attendance runs, scoring streaks, unbeaten patches" |
| **AI-Generated Player Profiles** | Dynamic bios based on stats history; "story of your kickabout career" | Medium | Capo's key differentiator; creates emotional investment |
| **Auto Team Balancing** | AI suggests fair teams based on ratings/stats; ends arguments | Medium | "Nobody argues about teams anymore" - major pain point solved |
| **Match Reports/Social Sharing** | Auto-generated shareable content for WhatsApp/Instagram | Medium | Sentr: "automatically generates shareable content"; drives organic growth |
| **Teammate Voting (MVP/Donkey)** | Post-match voting for awards creates social dynamics | Low | HIGH banter value; "glory or shame" badges |
| **Detailed Stats Dashboard** | Charts, trends, partnership analysis, form tracking | Medium | Evolution from basic stats; "discover your best formations, most potent partnerships" |
| **WhatsApp Integration** | Share lineups, results, stats directly to group chat | Low | Critical for adoption; meet users where they are |
| **Player Evolution Charts** | Visual progress over time; "my football journey" | Low | Appeals to ego; feeds intrinsic motivation |

---

## Anti-Features

Features to explicitly NOT build. These add complexity, friction, or target wrong user segment for casual friend groups.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Payment Processing** | Adds friction for friend groups; creates "who owes what" tension; friends prefer informal settlement | Track debts simply (who owes what) but don't handle actual payments; or keep payments manual |
| **Club/League Administration** | Overkill for friend groups; targets different segment (academies/clubs) | Stay focused on single-group experience; defer multi-team club features |
| **Website Builder** | Friends don't need public websites; adds admin burden | Simple shareable links/images instead |
| **Complex Financial Management** | Fines, automated billing, recurring payments - too corporate | Keep it simple: optional match fee tracking, no enforcement |
| **Multi-Sport Support** | Dilutes football-specific experience; "optimized for no one" | Focus exclusively on football/soccer; own the niche |
| **Safeguarding/Compliance Tools** | Required for youth clubs, irrelevant for adult friends | Skip entirely for adult-focused product |
| **Training Session Planning** | Friend groups don't plan formal training; just play | Keep scheduling lightweight; focus on matches only |
| **Complex Permission Systems** | Friend groups are flat hierarchies; over-engineering | Simple captain/admin distinction is enough |
| **Desktop-First Experience** | 2026 expectation is mobile-primary; pitch-side use essential | Mobile-first design; desktop as secondary |
| **Email/SMS Notifications** | WhatsApp is the universal channel for friend groups | Push notifications + WhatsApp integration; skip email |

---

## Feature Dependencies

```
Player Profiles → Statistics → Leaderboards → Fantasy Points → Streaks/Badges
                    ↓
              Player Ratings → Auto Team Balancing → AI Profiles
                    ↓
              Match Reports → Social Sharing

Match Scheduling → RSVP System → Availability Display → Lineup Builder
                          ↓
                    Match History

Live Match Timer → Live Scoring → Real-time Stats → Post-match Summary
                        ↓
                  Match Events (goals/assists/cards)
```

---

## MVP Recommendation

Based on research of successful apps (Capo, SENTR, Mingle Sport, Tactico), the MVP should focus on the "core loop" that creates engagement:

### Phase 1: The Basics (Table Stakes)
1. **Team Creation + Player Profiles** (name, nickname, jersey number, avatar)
2. **Match Scheduling** (5vs5 or 8vs8, date, time, location with maps)
3. **RSVP System** (one-tap IN/OUT, availability tracking)
4. **Basic Match Scoring** (final score, simple goal tracking)
5. **Match History** (list of past games, simple stats)

**Why:** Without these, the app isn't credible. These are minimum barriers to entry.

### Phase 2: The Engagement Layer (Differentiators)
1. **Drag-and-Drop Formation Builder** (visual pitch, save formations)
2. **Player Ratings 1-10** (post-match voting)
3. **Basic Statistics** (goals, assists, appearances, win rate)
4. **WhatsApp Sharing** (lineups, results, simple stats)
5. **Streaks** (attendance, scoring, unbeaten runs)

**Why:** These create the "something to talk about" effect that Capo and SENTR leverage. This is where word-of-mouth happens.

### Phase 3: The Obsession Layer (Advanced Differentiators)
1. **Fantasy Points System** (weighted scoring for goals, assists, wins, clean sheets)
2. **Leaderboards** (season rankings, monthly awards)
3. **Badges/Achievements** (milestone rewards, mastery badges)
4. **Player Evolution Charts** (visual progress over time)
5. **Teammate Voting Awards** (MVP, Donkey of the Day, etc.)

**Why:** These drive retention and weekly engagement. "The stats have made everyone weirdly invested."

### Defer:
- **Payment Processing:** "Friends prefer informal settlement" - adds friction without value
- **AI Team Balancing:** Cool but complex; nail manual formation first
- **Club Multi-Team Management:** Target single groups initially; expand later if needed
- **Training Scheduling:** "Friend groups don't plan formal training; just play"

---

## Key Research Insights

### From Market Analysis (2025-2026)

1. **"Finance-first platforms dominate but frustrate"** - Most apps (Pitchero, TeamFeePay) prioritize payments over coaching tools. Users reject this compromise.

2. **"Mobile-native means pitch-side"** - "Modern platforms MUST work one-handed in rain, with offline capability and interfaces designed for touchline use. Bad mobile experience isn't just inconvenient - it's disqualifying."

3. **"Voluntary use is the benchmark"** - "After 30 days, count how many coaches log in weekly without reminders. High voluntary use = platform solves real problems. Low voluntary use = platform reorganizes existing friction digitally."

4. **"The compromise is ending"** - Users reject false choice between "proper coaching tools with weak subscription management OR good billing with terrible coaching tools."

### From Gamification Research

1. **Social Determination Theory applies** - Users need: Competence (feeling skilled), Autonomy (choice/control), Relatedness (peer acceptance). Gamification elements should target these.

2. **Achievement/Progress elements work** - Leaderboards, badges, points, progress bars enhance all three psychological needs.

3. **Badges need variety** - Mix performance-focused (first place, milestones) with mastery-focused (consistency, improvement). Clear goals + surprise achievements.

4. **"The More, The Merrier" (to a point)** - Studies show 2-3 gamification elements work better than 1, but too many can overwhelm.

### From Direct Competitor Analysis

**Capo (the closest comparable):**
- Focus: Casual 5-a-side friend groups
- Key insight: "Make your kickabout something they talk about all week"
- Differentiators: AI team balancing, fantasy points, AI-written profiles, streaks
- What's free: Everything for organizers

**SENTR:**
- Key insight: "91% of users say Sentr gets players engaged"
- Differentiators: Fantasy points, social sharing, partnership analysis

**Mingle Sport:**
- Key insight: "Modern design (finally!)" - UI/UX is a differentiator in this dated market
- Differentiators: Awards & leaderboards, attendance tracking, modern interface

**Tactico:**
- Key insight: "Finance should be hygiene - working properly without demanding attention. The value should be in coaching tools."
- Differentiators: Formation building, AI insights, tactical preparation

---

## Complexity Assessment

| Feature Category | Implementation Complexity | User Value | Priority |
|------------------|---------------------------|------------|----------|
| Basic team/match management | Low | High (table stakes) | P0 |
| RSVP/availability | Low | High (table stakes) | P0 |
| Basic stats tracking | Low | High (table stakes) | P0 |
| Drag-and-drop formations | Medium | High (differentiator) | P1 |
| Live match timer/scoring | Medium | High (differentiator) | P1 |
| Player ratings | Low | High (differentiator) | P1 |
| Statistics dashboard | Medium | Medium-High | P2 |
| Fantasy points system | Medium | High (differentiator) | P2 |
| Streaks/badges | Low | Medium-High | P2 |
| Social sharing | Low | Medium | P2 |
| WhatsApp integration | Low | High (adoption) | P1 |
| AI team balancing | High | Medium-High | P3 |
| AI profiles | High | Medium | P3 |

---

## Sources

### Primary Sources (Verified 2025-2026)
1. **Tactico Sport** - "Best Football Team Management Apps UK 2026" (January 2026) - Comprehensive review of 7 platforms
2. **TeamStats** - Feature documentation (teamstats.net) - Detailed feature breakdown
3. **Mingle Sport** - Feature overview and gamification blog (September 2024)
4. **Capo** - Product website (caposport.com, 2026) - Closest comparable for 5-a-side friend groups
5. **SENTR** - Product website (sentrfootball.com) - Stats and fantasy points focus

### Supporting Research
6. **Mingle Sport Blog** - "How to improve Team Motivation and Engagement with Gamification" (Sept 2024) - Academic-backed gamification principles
7. **FirstWhistle** - "Best Football Management Apps for 2026" - Grassroots coach perspective
8. **EZFacility** - "5 Best Sports Team Management Apps in 2026" - Industry overview
9. **Spond** - "5 Best Sports Team Management Apps in 2025" - Market landscape
10. **Reddit r/SideProject** - "We built a stats tracker for weekly football games" (Dec 2025) - Real user validation

### Confidence Level: HIGH
All major claims verified against multiple sources. Publication dates range from September 2024 to January 2026. Primary sources are official product documentation and industry reviews from established players.
