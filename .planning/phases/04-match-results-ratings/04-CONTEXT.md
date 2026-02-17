# Phase 4: Match Results & Player Ratings

**Created:** 2026-02-17
**Source:** User discussion - scope change from original "Live Match Experience"

---

## Summary

Phase 4 enables **match lifecycle management**, **results/ratings entry**, and **team history**. The admin chooses between two flows:
1. **"Start Match"** — Live updates during play → End → Add ratings → Complete
2. **"Final Results"** — Input everything at once after the game → Complete

After match ends, admin marks which players actually played and provides nuanced ratings (38 values: 6, 6-, 6+, 6.5, etc.) with optional comments. Finally, admin **completes** the match which locks it and adds to team history for all members to view.

**Match lifecycle:** `scheduled` → `in_progress` → `finished` → `completed`

**Key design decisions:**
- No timer/clock tracking
- Two entry modes (start match vs final results)
- Edits allowed until match is completed
- Nuanced rating scale with modifiers (-, +, .5)
- No real-time sync (users refresh to see updates)
- Only players who played can be rated
- Completed matches are read-only and visible in team history

---

## Decisions (LOCKED)

These decisions are finalized and must be honored exactly:

### D1: No Timer/Clock Tracking
- **Decision:** No match timer, no "minute" tracking for events
- **Rationale:** Don't care about the passage of time — just who scored
- **Impact:** Goals don't have a "minute" field, simpler data model

### D2: Two Entry Modes - "Start Match" or "Final Results"
- **Decision:** Admin chooses between two mutually exclusive flows:
  1. **"Start Match"**: Start → add goals during play → End → can still edit after
  2. **"Final Results"**: Input everything at once (score, scorers, assists) - done
- **Rationale:** Some want to track live, others just want to input final data
- **Impact:** Two buttons on match page, different UI flows

### D3: Editable After Match Ends
- **Decision:** Even after "End Match", admin can still edit results
- **Rationale:** Reviewer might have missed something, needs correction
- **Impact:** Edit mode available on finished matches (admin only)

### D4: Match Lifecycle States
- **Decision:** `scheduled` → `in_progress` → `finished` → `completed`
- **Rationale:** Track match state; `completed` means finalized and in team history
- **Impact:** Match status field with 4 states, conditional UI based on state

### D5: "Complete Match" Finalizes Everything
- **Decision:** After results, ratings, etc. are done, admin clicks "Complete Match"
- **Rationale:** Locks the match, adds to team history, visible to all members
- **Impact:** Completed matches are read-only (no more edits), appear in history

### D6: Goals/Assists Entry
- **Decision:** Goals and assists added during `in_progress` OR in `finished` state
- **Rationale:** Works for both "Start Match" and "Final Results" flows
- **Impact:** Same goal entry UI, accessible in both states

### D7: Ratings Only After Finished
- **Decision:** Player ratings can only be added after match is `finished`
- **Rationale:** Can't rate until game is over
- **Impact:** Ratings UI appears only when status = finished (not completed)

### D8: No Real-time Sync
- **Decision:** Updates are NOT pushed to other users in real-time
- **Rationale:** Simpler architecture, users refresh to see updates
- **Impact:** No WebSocket/SSE infrastructure, standard CRUD only

### D9: Goal Scorers with Attribution
- **Decision:** Each goal has a scorer, can mark as own goal
- **Rationale:** Track who scored, including embarrassing own goals
- **Impact:** Goals table with player_id, is_own_goal flag

### D10: Assists are Optional
- **Decision:** Assists can be recorded but are not required
- **Rationale:** Not all goals have clear assists, don't force it
- **Impact:** Nullable assist_player_id on goals

### D11: Nuanced Rating Scale (1-10 with modifiers)
- **Decision:** Ratings are NOT just integers 1-10. Valid values:
  - Base: `X`, `X-`, `X+`, `X.5` for each number 1-9
  - For 10: only `10-` and `10` (no 10+ or 10.5)
  - Examples: `6`, `6-`, `6+`, `6.5`, `7`, `7-`, `7+`, `7.5`, etc.
- **Rationale:** Italian school grading style, more granular feedback
- **Impact:** Rating stored as decimal (6.5, 6.75 for 6+, 6.25 for 6-) or string; 38 possible values
- **Valid values:** 1, 1-, 1+, 1.5, 2, 2-, 2+, 2.5, ... 9.5, 10-, 10 (38 total)

### D12: Player Comments (No General Report)
- **Decision:** Per-player comments alongside ratings, NO general match report/summary
- **Rationale:** Focus on individual feedback, not narrative of the game
- **Impact:** Only comment per player rating

### D13: Rate Only Players Who Played
- **Decision:** Only players who actually participated can be rated
- **Rationale:** Can't rate someone who didn't play; distinguishes "didn't show" from "played poorly"
- **Impact:** Admin marks which players played, only those are rateable

### D14: Admin-Only Input
- **Decision:** Only team admin (or co-admin) can input match results and ratings
- **Rationale:** Prevents conflicting data, one source of truth
- **Impact:** Permission check on all mutation endpoints

### D15: Match History View
- **Decision:** Completed matches appear in team history, viewable by all members
- **Rationale:** Team members can browse past matches, see stats, ratings, formations
- **Impact:** History page/list showing completed matches with full detail view

---

## Claude's Discretion

Areas where Claude can make implementation choices:

### UI/UX for Goal Entry
- **Options:** Goal-by-goal list, bulk entry form, drag players to "scored" bucket
- **Consider:** Mobile-first, quick entry, easy to correct mistakes
- **Recommendation:** Per-match entry screen with add/remove goal buttons

### Rating Input UI
- **Options:** Dropdown with all 38 values, base+modifier selectors, custom picker
- **Consider:** 38 possible values (1, 1-, 1+, 1.5... 10-, 10), mobile-friendly, fast for 10+ players
- **Recommendation:** Two-part selector: base (1-10) + modifier (-/+/blank/.5), or searchable dropdown

### Handling Players Who Didn't Play
- **Options:** Skip unrated players, require rating for all, mark as "didn't play"
- **Consider:** RSVP was "IN" but player didn't show, substitutions
- **Recommendation:** Allow marking player as "didn't play" (excluded from rating)

### Match Result vs Scorers Validation
- **Options:** Strict validation (goals must match scorers count), loose (trust admin)
- **Consider:** Admin knows best, but could make typos
- **Recommendation:** Show warning if scorer count doesn't match score, allow override

---

## Deferred Ideas

These are explicitly OUT of scope for this phase:

### ❌ Live Timer/Clock
- Match timer, minute tracking
- "Goal at minute 23'"

### ❌ General Match Report
- Narrative summary of the game
- "Close game, decided by last-minute goal"

### ❌ Cards (Yellow/Red)
- Yellow/red card tracking
- Could be added in future if requested

### ❌ Multiple Reporters
- Multiple users contributing to same match data
- Comments from multiple players

### ❌ Match Events Timeline
- Minute-by-minute event log
- "Goal at 23'", "Substitution at 60'"

### ❌ Photo Upload
- Match photos/gallery
- Already planned for Phase 5 (Post-Match Statistics)

---

## Requirements Coverage

### From Original Phase 4 (Live Match Experience)
| Requirement | Status | Notes |
|-------------|--------|-------|
| LIVE-01: Timer | ❌ DROPPED | No live tracking |
| LIVE-02: Score recording | ✅ ADAPTED | Post-match score entry |
| LIVE-03: Goal/assist attribution | ✅ ADAPTED | Post-match scorer entry |
| LIVE-04: Real-time updates | ❌ DROPPED | No real-time needed |
| LIVE-05: Offline recording | ❌ DROPPED | Online-only post-match |
| LIVE-06: Mobile optimization | ✅ KEEP | Post-match UI must be mobile-friendly |
| LIVE-07: Accidental input prevention | ✅ KEEP | Confirmation before save |
| LIVE-08: Scoreboard | ❌ DROPPED | No live scoreboard |

### From Phase 6 (Player Ratings) - NOW MERGED
| Requirement | Status | Notes |
|-------------|--------|-------|
| RATE-01: Submit ratings 1-10 | ✅ MOVED HERE | Part of post-match flow |
| RATE-02: Optional comments | ✅ MOVED HERE | Per-player comment field |
| RATE-03: Average ratings | ✅ MOVED HERE | Calculate per-match and overall |
| RATE-04: Rating history | ⏳ DEFERRED | Phase 5 for aggregation |
| RATE-05: Anonymous option | ❌ DROPPED | Not needed for amateur |
| RATE-06: Trend visualization | ⏳ DEFERRED | Phase 7 for dashboards |

---

## Success Criteria (Revised)

1. **Admin can choose "Start Match" OR "Final Results"** — Two mutually exclusive entry modes
2. **"Start Match" flow works** — Start → add goals → End → add ratings → Complete
3. **"Final Results" flow works** — Input score, scorers, assists, ratings all at once → Complete
4. **Admin can edit until completed** — Edits allowed in `finished` state, locked after `completed`
5. **Admin can record goal scorers** — Each goal linked to player, own goal flag
6. **Admin can optionally record assists** — Assist player linked to goal
7. **Admin can mark which players played** — Only played players are rateable
8. **Admin can rate players with nuanced scale** — 38 values (6, 6-, 6+, 6.5, etc.)
9. **Admin can add optional comments per player** — Free text alongside rating
10. **Admin can complete match** — Locks match, moves to team history
11. **Users can view match history** — Completed matches visible with full details (formation, ratings, scorers)

---

## Technical Notes

### Database Changes Needed
- `matches` table: Add `status` enum (scheduled, in_progress, finished, completed), `home_score`, `away_score`
- `goals` table: match_id, scorer_player_id, assist_player_id (nullable), is_own_goal, team_id
- `match_players` table: Add `played` boolean (did this player actually participate?)
- `player_ratings` table: match_id, player_id, rating (decimal), comment (nullable)

### Match Lifecycle
```
scheduled → (Start Match) → in_progress → (End Match) → finished → (Complete) → completed
                ↓                              ↓               ↓
           add goals                     add goals        add ratings
                                       + ratings         (edit allowed)
                                                          ↓
                                                     (locked, read-only)
```

### Rating Storage Options
- **Option A (decimal):** Store as DECIMAL(3,2) — 6.0, 6.25 (6-), 6.5, 6.75 (6+)
- **Option B (string):** Store as VARCHAR — "6", "6-", "6+", "6.5"
- **Recommendation:** Decimal for easier averaging, map UI modifiers to decimal values

### No Real-time Infrastructure Needed
- No Supabase Realtime channels
- No WebSocket connections
- No Background Sync for live events
- Standard CRUD with optimistic updates

### Permission Model
- Use existing `is_team_admin()` helper from Phase 2
- Check on all mutation endpoints
- UI hides input controls for non-admins

---

## Phase Renaming Suggestion

**Original:** Phase 4: Live Match Experience
**Suggested:** Phase 4: Post-Match Results & Ratings

This better reflects the actual scope and avoids confusion with "live" real-time features.
