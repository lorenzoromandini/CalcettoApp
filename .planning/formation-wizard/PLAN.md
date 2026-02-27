# Formation Wizard Implementation Plan

## Overview

This document outlines the implementation plan for the **Formation Wizard** feature in CalcettoApp. The formation wizard allows managers to configure team formations directly during match creation, featuring an interactive football pitch visualization, module selection, and player assignment with intelligent role-based ordering.

## Current Architecture Context

- **Framework**: Next.js 16 + TypeScript + Tailwind CSS
- **Database**: Prisma ORM + PostgreSQL
- **Formation System**: Pre-built with grid-based positioning (9x7 grid coordinates)
- **Existing Components**: `formation-field.tsx`, `formation-module-selector.tsx`, `player-selection-modal.tsx`
- **Existing Hook**: `use-formation-builder.ts` for state management
- **Data Model**: `Formation` and `FormationPosition` tables with unique constraint on `(matchId, isHome)`

## Feature Requirements

### Core Flow
1. User creates match (selects mode + date + location)
2. After match creation, user sees formation wizard
3. User selects formation module based on match mode (5v5/8v8/11v11)
4. User clicks + buttons on pitch positions to add players
5. Modal opens with:
   - Real-time search bar (filters by name, surname, nickname)
   - Player list ordered by role priority: primary role first, secondary roles second, then others
6. User assigns players to both teams
7. Formations are saved when complete

### UX Requirements
- Visual football pitch with proper markings
- Click-to-assign interaction (simpler than drag-and-drop)
- Clear visual feedback for occupied/empty positions
- Role-based player prioritization in selection modal
- Responsive design for mobile devices

---

## Step-by-Step Implementation Breakdown

### Phase 1: Page Structure & Routing (Step 1-2)

#### Step 1: Create Formation Wizard Page
**File**: `app/[locale]/clubs/[clubId]/matches/[matchId]/formation/page.tsx`

**Purpose**: Main page container for the formation wizard

**Implementation**:
```typescript
// Server component that:
// 1. Validates user is club admin
// 2. Fetches match data
// 3. Fetches club members
// 4. Renders FormationWizardClient with preloaded data
```

**Key Considerations**:
- Route: `/clubs/[clubId]/matches/[matchId]/formation`
- Must check `isClubAdmin()` before rendering
- Fetch match with mode to determine available formations
- Fetch all club members with their roles for player selection

#### Step 2: Create Formation Wizard Client Component
**File**: `app/[locale]/clubs/[clubId]/matches/[matchId]/formation/formation-wizard-client.tsx`

**Purpose**: Client-side wrapper managing wizard steps

**Steps to Implement**:
1. Import `useFormationBuilder` hook for state management
2. Create step-based rendering logic:
   - `module`: Show FormationModuleSelector
   - `team1`: Show FormationBuilder for home team
   - `team2`: Show FormationBuilder for away team
   - `recap`: Show formation summary before save
3. Add navigation controls (Back/Next buttons)
4. Handle save action via `saveMatchFormationsAction`

**State Machine**:
```
module → team1 → team2 → recap → (save) → redirect to match detail
 ↑       ↑      ↑      ↑
 └───────┴──────┴──────┘ (back navigation)
```

---

### Phase 2: Component Enhancements (Step 3-5)

#### Step 3: Enhance FormationField Component
**File**: `components/formations/formation-field.tsx` (exists - may need updates)

**Required Modifications**:
1. Ensure proper click handling on positions
2. Add visual distinction between occupied/empty positions
3. Support "+" button visualization on empty slots
4. Show player jersey number when assigned

**Interface Additions**:
```typescript
interface FormationFieldProps {
  // ... existing props
  onPositionClick: (positionIndex: number) => void;
  readOnly?: boolean; // For recap view
}
```

#### Step 4: Enhance PlayerSelectionModal
**File**: `components/formations/player-selection-modal.tsx` (exists - verify functionality)

**Verify Existing Features**:
- ✅ Real-time search (debounced 300ms)
- ✅ Search by name, surname, nickname
- ✅ Role priority grouping (primary, secondary, others)
- ✅ Exclude already assigned players

**Potential Enhancements**:
- Add empty state messages
- Optimize scroll performance with virtual list (if >30 members)
- Add "clear search" button

#### Step 5: Create FormationRecap Component
**File**: `components/formations/formation-recap.tsx` (new)

**Purpose**: Summary view before final save

**Features**:
- Display both formations side-by-side (or stacked on mobile)
- Show module name for each team
- List assigned players per position
- Highlight incomplete formations
- Confirm/Save button with loading state
- Edit buttons to return to team1/team2 steps

---

### Phase 3: State Management (Step 6-7)

#### Step 6: Leverage Existing useFormationBuilder Hook
**File**: `hooks/use-formation-builder.ts` (exists - verify coverage)

**Verify Functionality**:
- ✅ Step management (module, team1, team2, recap)
- ✅ Module selection
- ✅ Player assignment/removal for both teams
- ✅ Navigation (nextStep, prevStep)
- ✅ Assignment tracking (getAssignedPlayerIds)

**Potential Additions**:
- `validateFormation()` function
- Progress tracking (% complete per team)
- Auto-save to localStorage (optional, for recovery)

#### Step 7: Formation Builder State Integration
**Pattern**: Pass hook methods to child components

```typescript
// In FormationWizardClient
const builder = useFormationBuilder({ matchId, clubId, mode });

// Render based on step
switch (builder.currentStep) {
  case 'module':
    return <FormationModuleSelector
      mode={mode}
      selectedModuleId={builder.selectedModuleId}
      onSelect={builder.selectModule}
      onContinue={builder.nextStep}
    />;
  case 'team1':
    return <TeamFormationBuilder
      team="team1"
      moduleId={builder.selectedModuleId}
      assignments={builder.getTeam1Assignments}
      onAssign={builder.assignPlayerToTeam1}
      onRemove={builder.removePlayerFromTeam1}
      assignedPlayerIds={builder.getAssignedPlayerIds}
      clubMembers={members}
    />;
  // ... etc
}
```

---

### Phase 4: API Integration (Step 8-9)

#### Step 8: Verify Server Actions
**File**: `lib/actions/formations.ts` (exists)

**Required Actions**:
1. ✅ `getClubMembersWithRolePriorityAction(clubId, targetRole?)`
   - Returns members sorted by role priority
2. ✅ `saveMatchFormationsAction(payload: SaveMatchFormationsPayload)`
   - Saves both team formations atomically
3. ✅ `getMatchFormationsAction(matchId)`
   - For edit mode (future enhancement)

**Verify Permission Checks**:
- All actions must call `isClubAdmin()` for authorization
- Return proper error messages in Italian

#### Step 9: Database Layer Verification
**File**: `lib/db/formations.ts` (exists)

**Key Functions**:
- ✅ `getClubMembersWithRolePriority()` - queries with role ordering
- ✅ `saveMatchFormations()` - Prisma transaction for atomic save
- ✅ `getFormation()` / `getMatchFormations()` - retrieval

**Transaction Safety**:
```typescript
// saveMatchFormations already uses:
prisma.$transaction(async (tx) => {
  // Delete existing
  // Create new formations with positions
})
```

---

### Phase 5: Integration Points (Step 10-11)

#### Step 10: Match Creation Flow Integration
**File**: `app/[locale]/clubs/[clubId]/matches/create/create-match-page-client.tsx`

**Modification**: After successful match creation, redirect to formation wizard

```typescript
const handleSubmit = async (data: CreateMatchInput) => {
  const matchId = await createMatch(data, clubId);
  // Redirect to formation wizard instead of match detail
  router.push(`/clubs/${clubId}/matches/${matchId}/formation`);
};
```

**Alternative**: Make formation step optional with "Salta" button

#### Step 11: Navigation & Breadcrumbs
**Update**: Add formation wizard to navigation flow

**Breadcrumb**: Club → Matches → Create → Formation

**After Save**: Redirect to match detail page `/clubs/[clubId]/matches/[matchId]`

---

### Phase 6: Polish & Edge Cases (Step 12-14)

#### Step 12: Loading States
**Implement**:
- Skeleton loaders for formation selector
- Spinner during save operation
- Disabled state for buttons during API calls

#### Step 13: Error Handling
**Scenarios**:
- Network failure during save (show retry)
- Player already assigned to other team (prevent in UI)
- Invalid formation state (validation before save)
- Permission denied (redirect to club page)

#### Step 14: Empty States
**Cases**:
- No club members (show message to invite players first)
- Not enough members for selected mode
- Search returns no results

---

## Component Architecture

### Component Hierarchy

```
FormationPage (Server)
└── FormationWizardClient
    ├── WizardHeader (step indicator)
    ├── StepContent
    │   ├── ModuleStep
    │   │   └── FormationModuleSelector
    │   │       └── FormationModuleCard (x4-7)
    │   ├── TeamStep (team1 + team2)
    │   │   └── TeamFormationBuilder
    │   │       ├── FormationHeader (team name)
    │   │       ├── FormationField
    │   │       │   └── FormationPosition (x6-12)
    │   │       └── PlayerSelectionModal
    │   │           ├── SearchInput
    │   │           ├── RoleGroup (primary)
    │   │           ├── RoleGroup (secondary)
    │   │           └── RoleGroup (others)
    │   └── RecapStep
    │       └── FormationRecap
    │           ├── TeamSummary (x2)
    │           └── ConfirmButtons
    └── WizardFooter (navigation)
```

### Component Responsibilities

| Component | Responsibility | Props |
|-----------|---------------|-------|
| `FormationWizardClient` | Step orchestration, data fetching | `matchId`, `clubId`, `mode`, `members` |
| `FormationModuleSelector` | Display available modules for mode | `mode`, `selectedModuleId`, `onSelect` |
| `TeamFormationBuilder` | Single team formation editor | `moduleId`, `assignments`, `onAssign`, `onRemove`, `members`, `assignedPlayerIds` |
| `FormationField` | Visual pitch with positions | `module`, `assignments`, `onPositionClick` |
| `FormationPosition` | Individual position slot | `index`, `x`, `y`, `role`, `isOccupied`, `player`, `onClick` |
| `PlayerSelectionModal` | Player picker with search | `isOpen`, `members`, `targetRole`, `excludeIds`, `onSelect` |
| `FormationRecap` | Pre-save summary | `team1Formation`, `team2Formation`, `moduleId`, `onConfirm`, `onEdit` |

---

## State Management Approach

### Local State (useState)
- Current wizard step
- Selected module
- Player assignments (both teams)
- Modal open/closed state
- Search query

### Global State (URL/Server)
- Match data (fetched server-side)
- Club members (fetched server-side)
- Saved formations (persisted to database)

### State Flow

```
User Action → Local State Update → UI Re-render → API Call (on save) → Database
     ↑                                                                  ↓
     └────────────────── Revalidation / Redirect ←──────────────────────┘
```

### Formation State Shape

```typescript
interface FormationBuilderState {
  currentStep: 'module' | 'team1' | 'team2' | 'recap';
  selectedModuleId: string | null;
  team1Formation: {
    moduleId: string;
    isHome: true;
    assignments: Array<{
      positionIndex: number;
      clubMemberId: string;
      assignedAt: string;
    }>;
  } | null;
  team2Formation: {
    moduleId: string;
    isHome: false;
    assignments: Array<{
      positionIndex: number;
      clubMemberId: string;
      assignedAt: string;
    }>;
  } | null;
  isSaving: boolean;
  error: string | null;
}
```

---

## API Requirements

### Required Server Actions

#### 1. Get Club Members with Role Priority
```typescript
async function getClubMembersWithRolePriorityAction(
  clubId: string,
  targetRole?: FormationRole
): Promise<{ members: ClubMemberWithRolePriority[] }>
```

**Query Logic**:
```sql
SELECT 
  cm.*,
  u.firstName,
  u.lastName,
  u.nickname,
  CASE 
    WHEN cm.primaryRole = $targetRole THEN 0
    WHEN $targetRole = ANY(cm.secondaryRoles) THEN 1
    ELSE 2
  END as rolePriority
FROM ClubMember cm
JOIN User u ON cm.userId = u.id
WHERE cm.clubId = $clubId
ORDER BY rolePriority ASC, cm.jerseyNumber ASC
```

**Status**: ✅ Already implemented in `lib/actions/formations.ts`

#### 2. Save Match Formations
```typescript
async function saveMatchFormationsAction(
  payload: SaveMatchFormationsPayload
): Promise<{ 
  success: boolean; 
  team1FormationId?: string; 
  team2FormationId?: string; 
  error?: string 
}>
```

**Payload Structure**:
```typescript
interface SaveMatchFormationsPayload {
  matchId: string;
  clubId: string;
  team1: {
    matchId: string;
    isHome: true;
    moduleId: string;
    assignments: Array<{
      positionIndex: number;
      clubMemberId: string;
      positionX: number;
      positionY: number;
      positionLabel: string;
    }>;
  };
  team2: {
    matchId: string;
    isHome: false;
    moduleId: string;
    assignments: Array<{
      positionIndex: number;
      clubMemberId: string;
      positionX: number;
      positionY: number;
      positionLabel: string;
    }>;
  };
}
```

**Status**: ✅ Already implemented in `lib/actions/formations.ts`

### API Response Handling

**Success Flow**:
1. Call `saveMatchFormationsAction`
2. On success, show success toast
3. Revalidate paths (handled by server action)
4. Redirect to match detail page

**Error Flow**:
1. Catch error
2. Display error message in UI
3. Keep user on recap step with retry option

---

## Database Queries Needed

### Query 1: Get Club Members for Player Selection
**Purpose**: Fetch all club members with user data for player selection modal

**Prisma Query**:
```typescript
const members = await prisma.clubMember.findMany({
  where: { clubId },
  include: {
    user: {
      select: {
        firstName: true,
        lastName: true,
        nickname: true,
        image: true,
      },
    },
  },
  orderBy: [
    { primaryRole: 'asc' },
    { jerseyNumber: 'asc' },
  ],
});
```

**Post-Processing**: Apply role priority sorting in application code based on target role

### Query 2: Save Formation (Transaction)
**Purpose**: Atomically save formation with positions

**Prisma Transaction**:
```typescript
await prisma.$transaction(async (tx) => {
  // Delete existing formation for this match+isHome
  await tx.formation.deleteMany({
    where: { matchId, isHome },
  });
  
  // Create new formation
  const formation = await tx.formation.create({
    data: {
      matchId,
      isHome,
      formationName: moduleId,
      positions: {
        create: assignments.map((a) => ({
          clubMemberId: a.clubMemberId,
          positionX: a.positionX,
          positionY: a.positionY,
          positionLabel: a.positionLabel,
          isSubstitute: false,
          played: false,
        })),
      },
    },
  });
  
  return formation;
});
```

**Status**: ✅ Implemented in `lib/db/formations.ts`

### Query 3: Get Existing Formation (for Edit Mode)
**Purpose**: Load existing formation data when editing

**Prisma Query**:
```typescript
const formation = await prisma.formation.findUnique({
  where: {
    matchId_isHome: {
      matchId,
      isHome,
    },
  },
  include: {
    positions: true,
  },
});
```

**Status**: ✅ Implemented in `lib/db/formations.ts`

---

## Testing Strategy

### Unit Tests

#### 1. Hook Tests: `use-formation-builder.test.ts`
**Test Cases**:
- ✅ Module selection updates state
- ✅ Player assignment adds to correct team
- ✅ Player removal clears assignment
- ✅ Cross-team assignment prevention (can't assign same player to both teams)
- ✅ Step navigation works correctly
- ✅ Formation completion detection

**Example**:
```typescript
test('assignPlayerToTeam1 adds player to team1 assignments', () => {
  const { result } = renderHook(() => useFormationBuilder({ matchId: '1', clubId: '1', mode: 'FIVE_V_FIVE' }));
  
  act(() => {
    result.current.selectModule('2-2');
    result.current.assignPlayerToTeam1(0, 'player-1');
  });
  
  expect(result.current.team1Formation?.assignments).toHaveLength(1);
  expect(result.current.team1Formation?.assignments[0].clubMemberId).toBe('player-1');
});
```

#### 2. Component Tests: `formation-field.test.tsx`
**Test Cases**:
- ✅ Renders correct number of positions for module
- ✅ Calls onPositionClick when position clicked
- ✅ Displays player info when occupied
- ✅ Shows + button when empty
- ✅ Applies correct role colors

#### 3. Modal Tests: `player-selection-modal.test.tsx`
**Test Cases**:
- ✅ Filters players by search query
- ✅ Groups players by role priority
- ✅ Excludes already assigned players
- ✅ Calls onSelect when player clicked

### Integration Tests

#### 1. Wizard Flow Test
**Scenario**: Complete formation wizard end-to-end

**Steps**:
1. Navigate to formation page
2. Select module "2-2" for 5v5
3. Assign 6 players to team1
4. Navigate to team2
5. Assign 6 different players to team2
6. Save formations
7. Verify database has correct data

#### 2. Role Priority Test
**Scenario**: Verify role-based ordering in modal

**Setup**:
- Member A: primaryRole=POR, secondaryRoles=[]
- Member B: primaryRole=DIF, secondaryRoles=[POR]
- Member C: primaryRole=CEN, secondaryRoles=[]

**Test**: When selecting POR position
- Member A appears in "primary" group
- Member B appears in "secondary" group
- Member C appears in "others" group

### E2E Tests (Playwright)

#### Test 1: Happy Path
```typescript
test('manager can create match with formations', async ({ page }) => {
  // Login as manager
  await page.goto('/clubs/123/matches/create');
  
  // Create match
  await page.fill('[name="scheduledAt"]', '2024-12-31T20:00');
  await page.fill('[name="location"]', 'Campo Sportivo');
  await page.click('[data-testid="mode-5v5"]');
  await page.click('[data-testid="submit-match"]');
  
  // Formation wizard loads
  await expect(page).toHaveURL(/\/formation$/);
  
  // Select module
  await page.click('[data-testid="module-2-2"]');
  await page.click('[data-testid="continue"]');
  
  // Assign team1 players
  await page.click('[data-testid="position-0"]');
  await page.fill('[data-testid="player-search"]', 'Mario');
  await page.click('[data-testid="player-option"]');
  
  // ... continue for all positions
  
  // Save
  await page.click('[data-testid="save-formations"]');
  
  // Redirect to match detail
  await expect(page).toHaveURL(/\/matches\/\w+$/);
});
```

#### Test 2: Permission Denied
```typescript
test('non-admin cannot access formation wizard', async ({ page }) => {
  // Login as regular member
  await page.goto('/clubs/123/matches/456/formation');
  
  // Should redirect to club page or show error
  await expect(page).toHaveURL('/clubs/123');
});
```

### Manual Testing Checklist

#### Functionality
- [ ] Can select each formation module for each mode (5v5, 8v8, 11v11)
- [ ] Pitch visualization matches selected module
- [ ] Clicking + opens player selection modal
- [ ] Search filters players by name, surname, nickname
- [ ] Players ordered by role priority (primary > secondary > other)
- [ ] Assigned players excluded from selection
- [ ] Can remove assigned player
- [ ] Can't assign same player to both teams
- [ ] Save creates formations in database
- [ ] Redirect after save works

#### Responsive Design
- [ ] Works on mobile (iPhone SE size)
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] Modal is scrollable on small screens
- [ ] Pitch scales correctly

#### Edge Cases
- [ ] Empty club (no members)
- [ ] Not enough members for mode
- [ ] Search with no results
- [ ] Network failure during save
- [ ] Browser back button during wizard
- [ ] Refresh page during wizard (state lost - acceptable for v1)

---

## Implementation Order

### Sprint 1: Core Structure
1. ✅ Create formation wizard page structure
2. ✅ Integrate FormationModuleSelector
3. ✅ Create TeamFormationBuilder wrapper
4. ✅ Wire up useFormationBuilder hook

### Sprint 2: Player Assignment
1. ✅ Integrate FormationField with click handling
2. ✅ Connect PlayerSelectionModal
3. ✅ Implement role priority ordering
4. ✅ Add search functionality

### Sprint 3: Save & Navigation
1. ✅ Create FormationRecap component
2. ✅ Wire up saveMatchFormationsAction
3. ✅ Add navigation flow
4. ✅ Handle redirect after save

### Sprint 4: Polish
1. Add loading states
2. Add error handling
3. Add empty states
4. Responsive testing
5. Accessibility improvements

---

## File Checklist

### New Files to Create
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/formation/page.tsx`
- [ ] `app/[locale]/clubs/[clubId]/matches/[matchId]/formation/formation-wizard-client.tsx`
- [ ] `components/formations/formation-recap.tsx`
- [ ] `components/formations/team-formation-builder.tsx` (wrapper component)

### Existing Files to Modify
- [ ] `app/[locale]/clubs/[clubId]/matches/create/create-match-page-client.tsx` - redirect after creation
- [ ] `components/formations/formation-field.tsx` - verify click handling
- [ ] `components/formations/player-selection-modal.tsx` - verify search & ordering
- [ ] `messages/it.json` - add formation wizard translations

### Files to Verify (No Changes Needed)
- [ ] `hooks/use-formation-builder.ts` - verify complete functionality
- [ ] `lib/actions/formations.ts` - verify server actions
- [ ] `lib/db/formations.ts` - verify database functions
- [ ] `lib/formations/formations-config.ts` - verify module definitions
- [ ] `components/formations/formation-module-selector.tsx` - verify selector
- [ ] `components/formations/formation-position.tsx` - verify position rendering

---

## Translation Keys Required

Add to `messages/it.json`:

```json
{
  "formationWizard": {
    "title": "Configura Formazioni",
    "subtitle": "Assegna i giocatori alle posizioni per entrambe le squadre",
    "steps": {
      "module": "Seleziona Modulo",
      "team1": "Squadra 1",
      "team2": "Squadra 2",
      "recap": "Riepilogo"
    },
    "navigation": {
      "back": "Indietro",
      "next": "Avanti",
      "save": "Salva Formazioni",
      "saving": "Salvataggio...",
      "skip": "Salta (crea senza formazioni)"
    },
    "teamLabels": {
      "team1": "Squadra 1 (Casa)",
      "team2": "Squadra 2 (Trasferta)"
    },
    "emptyStates": {
      "noModule": "Seleziona un modulo per continuare",
      "noPlayers": "Nessun giocatore assegnato",
      "noMembers": "Nessun membro disponibile. Invita prima dei giocatori al club."
    },
    "validation": {
      "incompleteTeam": "Squadra {team} incompleta: assegna tutti i giocatori",
      "playerAlreadyAssigned": "Giocatore già assegnato all'altra squadra",
      "duplicatePlayer": "Giocatore già in questa posizione"
    }
  }
}
```

---

## Success Criteria

The formation wizard is complete when:

1. ✅ User can create match and immediately configure formations
2. ✅ Formation module selection shows correct options per mode (5v5, 8v8, 11v11)
3. ✅ Football pitch visualization displays correct positions
4. ✅ Clicking + button opens player selection modal
5. ✅ Modal search filters by name, surname, nickname in real-time
6. ✅ Players ordered by role priority (primary → secondary → other)
7. ✅ User can assign players to both teams without duplicates
8. ✅ Formations save correctly to database
9. ✅ User redirected to match detail after save
10. ✅ Responsive design works on mobile devices
11. ✅ Error states handled gracefully

---

## Appendix: Formation Modules by Mode

### 5v5 (6 players per team including GK)
Available modules: `2-2`, `2-1-1`, `3-1`, `1-2-1`

### 8v8 (9 players per team including GK)
Available modules: `3-3-1`, `3-2-2`, `2-4-1`, `2-3-2`

### 11v11 (12 players per team including GK)
Available modules: `4-3-3`, `4-4-2`, `4-2-3-1`, `4-3-1-2`, `3-4-3`, `3-5-2`, `3-4-1-2`

See `lib/formations/formations-config.ts` for exact position coordinates.
