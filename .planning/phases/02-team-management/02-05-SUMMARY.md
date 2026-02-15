---
phase: 02-team-management
plan: 05
subsystem: team-management
tags: [teams, roster, admin, members, roles]

# Dependency graph
requires:
  - phase: 02-01
    provides: Database schema for teams and members
  - phase: 02-02
    provides: Team CRUD operations
  - phase: 02-03
    provides: Player management
provides:
  - Team roster management UI
  - Member role assignment (admin/co-admin/member)
  - Member removal with confirmation dialogs
  - Ownership transfer functionality
affects:
  - 03-match-management

tech-stack:
  added: []
  patterns:
    - "Role-based access control with admin/co-admin/member hierarchy"
    - "Confirmation dialogs for destructive actions"
    - "Tab-based UI for organizing related content"

key-files:
  created:
    - components/teams/team-roster-manager.tsx
    - app/[locale]/teams/[teamId]/roster/page.tsx
  modified:
    - lib/db/teams.ts
    - messages/it.json
    - messages/en.json

key-decisions:
  - "Hard delete for memberships (not soft delete) since no history needed"
  - "Cannot remove admin directly - must transfer ownership first"
  - "Both admin and co-admin can manage roster (co-admin has limited admin privileges)"

# Metrics
duration: 0min
completed: 2026-02-15
---

# Phase 2 Plan 5: Team Admin Features Summary

**Team roster management with role assignment, member removal, and confirmation dialogs - completed in previous commit a523ea7**

## Overview

This plan implements team admin features for roster management (TEAM-07, TEAM-08, TEAM-09), enabling team admins to manage their roster and delegate privileges.

**One-liner:** Roster management UI with role dropdown selection, member removal with confirmation dialogs, and ownership transfer capability

---

## What Was Built

### 1. Member Management Functions (`lib/db/teams.ts`)

The following functions were added to support roster management:

- **`getTeamMembers(teamId)`** - Retrieves all members of a team
- **`updateMemberRole(teamId, memberId, newRole)`** - Changes a member's role (admin/co-admin/member)
- **`removeTeamMember(teamId, memberId)`** - Removes a member from the team (hard delete)
- **`transferOwnership(teamId, currentAdminId, newAdminId)`** - Transfers admin privileges to another member

Key implementation details:
- Hard delete for memberships (no history needed unlike players)
- Cannot remove admin directly - must transfer ownership first
- All changes queued for offline sync via `queueOfflineAction()`
- Local IndexedDB updates happen immediately, server sync is async

### 2. Team Roster Manager Component (`components/teams/team-roster-manager.tsx`)

Roster management UI for team admins:

- **Member List:** Shows all team members with role icons (Shield for admin, UserCog for co-admin, User for member)
- **Role Management:** Inline role editing with button toggle (member/co-admin)
  - Admin cannot change own role directly (must transfer ownership)
  - Only admin can promote to admin (co-admin can only promote to co-admin)
- **Member Removal:** Trash icon opens confirmation modal
  - Cannot remove yourself (prevents accidental self-removal)
  - Confirmation dialog prevents accidents
  - Loading state during removal operation
- **Role Display:** Non-admins see read-only role badges

### 3. Team Roster Page (`app/[locale]/teams/[teamId]/roster/page.tsx`)

Tab-based roster page with two sections:

- **Players Tab:** Shows team players with jersey numbers (from Plan 02-03)
  - Empty state with "Add Player" button
  - Player cards with avatar and roles
- **Members Tab:** Shows team members with role management (from this plan)
  - TeamRosterManager component for admin controls
  - Member list with role icons and names

Navigation:
- Back button to team dashboard
- Tab buttons for switching between Players and Members

### 4. Internationalization

Added translations for both Italian and English:

**Italian (`messages/it.json`):**
- `roster.pageTitle` - "Rosa squadra"
- `roster.title` - "Membri della squadra"
- `roster.tabs.players` / `roster.tabs.members`
- `roster.roles.admin` / `roster.roles.coAdmin` / `roster.roles.member`
- `roster.remove.confirmTitle` / `roster.remove.confirmDescription`
- `roster.changeRole` - "Cambia ruolo"
- `roster.you` - "Tu"

**English (`messages/en.json`):**
- Corresponding English translations

---

## Key Features

### Role Hierarchy
1. **Admin:** Full control, can transfer ownership, delete team
2. **Co-Admin:** Can manage roster (add/remove/change roles), cannot delete team or transfer ownership
3. **Member:** Basic membership, no admin privileges

### Security
- Client-side role checks before showing admin UI
- Server-side RLS policies enforce authorization
- Cannot remove admin without transferring ownership first
- Confirmation dialogs for all destructive actions

### User Experience
- Visual role icons for quick identification
- "You" label on current user
- Inline role editing with cancel option
- Loading states for async operations
- Mobile-optimized touch targets (48px+)

---

## Files Created/Modified

### New Files
1. `components/teams/team-roster-manager.tsx` - Roster management UI
2. `app/[locale]/teams/[teamId]/roster/page.tsx` - Roster page with tabs

### Modified Files
1. `lib/db/teams.ts` - Added member management functions
2. `messages/it.json` - Italian roster translations
3. `messages/en.json` - English roster translations

---

## Verification Results

✅ All member management functions exported from teams.ts  
✅ TeamRosterManager component renders member list with role icons  
✅ Role change buttons work for admin users  
✅ Remove button shows confirmation dialog  
✅ Cannot remove admin without ownership transfer  
✅ Roster page has working Players/Members tabs  
✅ All translations in place (IT/EN)  
✅ Mobile-optimized with 48px+ touch targets  

---

## Deviation from Plan

**None.** The work described in 02-05-PLAN.md was already implemented in commit a523ea7 as part of the "Admin Features" deliverable.

All required functionality is present:
- ✅ `getTeamMembers()` function
- ✅ `updateMemberRole()` function  
- ✅ `removeTeamMember()` function
- ✅ `transferOwnership()` function
- ✅ TeamRosterManager component with role selection
- ✅ Confirmation dialogs for member removal
- ✅ Roster page with Players/Members tabs
- ✅ All translations added

---

## Requirements Coverage

- ✅ TEAM-07: Remove player from team (via removeTeamMember)
- ✅ TEAM-08: Assign co-admin privileges (via updateMemberRole)
- ✅ TEAM-09: View team roster with roles
- ✅ Role changes persist and sync
- ✅ Confirmation dialogs prevent accidental removals
- ✅ Admin cannot be removed without ownership transfer

---

## Technical Notes

### Member Removal Flow
```typescript
// 1. Admin clicks remove button
setMemberToRemove(member)

// 2. Confirmation dialog shown
// 3. On confirm, call removeTeamMember()
await removeTeamMember(teamId, member.id)

// 4. Local deletion + queue for sync
await db.delete('team_members', memberId)
await queueOfflineAction('delete', 'team_members', { id: memberId })
```

### Role Change Flow
```typescript
// 1. Admin clicks role button
handleRoleChange(member.id, 'co-admin')

// 2. Update local cache
await db.put('team_members', updatedMember)

// 3. Try server sync, queue if offline
await queueOfflineAction('update', 'team_members', { id, role })
```

---

## Next Steps

Plan 02-06 will implement team editing and deletion features (completing the danger zone in settings).

---

*Summary created: 2026-02-15*  
*Work completed in: commit a523ea7*
