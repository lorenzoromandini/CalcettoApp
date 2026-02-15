# Phase 2: Team Management - Research

**Researched:** 2026-02-15
**Domain:** Team/Organization Management with Supabase PostgreSQL
**Confidence:** HIGH

## Summary

Phase 2 requires implementing team management with players, roles, invite links, and avatars. This is a foundational phase that builds on Phase 1 authentication and enables all subsequent match-related features.

**Key architectural decisions needed:**
1. **Membership Pattern**: Use a join table (`team_members`) linking `auth.users` to `teams` with role columns
2. **Invite System**: Database-driven invite tokens with expiration (not JWT) for shareable links
3. **Avatar Handling**: Client-side crop with `react-easy-crop`, upload to Supabase Storage
4. **Permission Model**: Simple admin/co-admin/member roles stored in membership table
5. **Offline Strategy**: Full team data cached in IndexedDB, mutations queued for sync

**Primary recommendation:** Use the "Membership Table Pattern" for team access control with RLS policies that check team membership. This is the standard approach for multi-tenant applications in Supabase and provides flexibility for users belonging to multiple teams.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Supabase | ^2.x | Database, Auth, Storage | Native team support via RLS, built-in Storage |
| react-easy-crop | ^5.x | Avatar cropping | Most popular (2.7k GitHub stars), mobile-friendly, actively maintained |
| idb | ^8.x | IndexedDB wrapper | Promise-based, TypeScript support, used in Phase 1 |
| uuid | ^11.x | UUID generation | For invite tokens and entity IDs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-dropzone | ^14.x | File drag-drop | If adding drag-drop file upload (optional) |
| canvas | built-in | Image processing | For client-side crop to square before upload |
| qrcode.react | ^4.x | QR code generation | If generating QR codes for invite links |

### Installation
```bash
# Avatar cropping
npm install react-easy-crop

# File uploads (optional, can use native input)
npm install react-dropzone

# UUID generation for tokens
npm install uuid
npm install -D @types/uuid

# QR codes for invites (optional)
npm install qrcode.react
```

## Architecture Patterns

### Recommended Database Schema

```sql
-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  team_mode VARCHAR(10) CHECK (team_mode IN ('5-a-side', '8-a-side')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members (junction table for user-team relationships)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- For players who don't have accounts yet
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'co-admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Players table (can exist without user account)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  surname VARCHAR(50),
  nickname VARCHAR(50),
  jersey_number INTEGER CHECK (jersey_number >= 1 AND jersey_number <= 99),
  avatar_url TEXT,
  -- Player can be linked to a user account later
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Multiple roles per player (goalkeeper, defender, midfielder, attacker)
  roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status VARCHAR(20) DEFAULT 'synced'
);

-- Invite tokens for team joins
CREATE TABLE team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255), -- Optional: for targeted invites
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES auth.users(id),
  max_uses INTEGER DEFAULT 1,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies Pattern

```sql
-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is team admin
CREATE OR REPLACE FUNCTION is_team_admin(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = (SELECT auth.uid())
    AND role IN ('admin', 'co-admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: check if user is team member
CREATE OR REPLACE FUNCTION is_team_member(team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_uuid
    AND user_id = (SELECT auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Teams policies
CREATE POLICY "Team members can view team"
  ON teams FOR SELECT
  TO authenticated
  USING (is_team_member(id));

CREATE POLICY "Team admins can update team"
  ON teams FOR UPDATE
  TO authenticated
  USING (is_team_admin(id));

CREATE POLICY "Authenticated users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

-- Team members policies
CREATE POLICY "Team members can view roster"
  ON team_members FOR SELECT
  TO authenticated
  USING (is_team_member(team_id));

CREATE POLICY "Team admins can manage members"
  ON team_members FOR ALL
  TO authenticated
  USING (is_team_admin(team_id))
  WITH CHECK (is_team_admin(team_id));

CREATE POLICY "Users can view own memberships"
  ON team_members FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Players policies
CREATE POLICY "Team members can view players"
  ON players FOR SELECT
  TO authenticated
  USING (is_team_member(team_id));

CREATE POLICY "Team admins can manage players"
  ON players FOR ALL
  TO authenticated
  USING (is_team_admin(team_id))
  WITH CHECK (is_team_admin(team_id));

-- Invites policies
CREATE POLICY "Team admins can manage invites"
  ON team_invites FOR ALL
  TO authenticated
  USING (is_team_admin(team_id));

CREATE POLICY "Anyone can view valid invites by token"
  ON team_invites FOR SELECT
  TO authenticated, anon
  USING (expires_at > NOW() AND (max_uses IS NULL OR use_count < max_uses));
```

### Project Structure

```
src/
├── app/
│   └── [locale]/
│       └── teams/
│           ├── page.tsx              # Team list
│           ├── [teamId]/
│           │   ├── page.tsx          # Team dashboard
│           │   ├── players/
│           │   │   └── page.tsx      # Player roster
│           │   ├── settings/
│           │   │   └── page.tsx      # Team settings
│           │   └── invite/
│           │       └── page.tsx      # Join via invite link
│           └── create/
│               └── page.tsx          # Create team
├── components/
│   ├── teams/
│   │   ├── team-card.tsx
│   │   ├── team-form.tsx
│   │   ├── player-card.tsx
│   │   ├── player-form.tsx
│   │   ├── roster-list.tsx
│   │   ├── invite-generator.tsx
│   │   └── team-role-badge.tsx
│   └── players/
│       ├── avatar-cropper.tsx        # react-easy-crop wrapper
│       ├── player-avatar.tsx
│       └── role-selector.tsx         # Multi-select for positions
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # Database types
│   │   ├── teams.ts                  # Team operations
│   │   ├── players.ts                # Player operations
│   │   └── invites.ts                # Invite operations
│   └── validations/
│       └── team.ts                   # Zod schemas
├── hooks/
│   ├── use-team.ts                   # Current team data
│   ├── use-team-members.ts
│   ├── use-players.ts
│   └── use-invite.ts
└── types/
    └── team.ts
```

### Avatar Crop Pattern

```typescript
// components/players/avatar-cropper.tsx
'use client';

import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/image-utils';

interface AvatarCropperProps {
  image: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function AvatarCropper({ image, onCropComplete, onCancel }: AvatarCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteCallback = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error('Crop failed:', e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-64 w-full bg-muted rounded-lg overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteCallback}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm">Zoom</span>
        <Slider
          value={[zoom]}
          min={1}
          max={3}
          step={0.1}
          onValueChange={([v]) => setZoom(v)}
          className="flex-1"
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Save Avatar
        </Button>
      </div>
    </div>
  );
}
```

### Image Crop Utility

```typescript
// lib/image-utils.ts
export function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageSrc;
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      // Square output (1:1 aspect ratio from cropper)
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob failed'));
        },
        'image/jpeg',
        0.95
      );
    };
    
    image.onerror = reject;
  });
}
```

### Invite Link Pattern

```typescript
// lib/db/invites.ts
import { createHash } from 'crypto';

export async function generateInviteLink(teamId: string, createdBy: string) {
  const token = createHash('sha256')
    .update(`${teamId}:${createdBy}:${Date.now()}:${Math.random()}`)
    .digest('hex')
    .slice(0, 32);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
  
  const { data, error } = await supabase
    .from('team_invites')
    .insert({
      team_id: teamId,
      created_by: createdBy,
      token,
      expires_at: expiresAt.toISOString(),
      max_uses: 50, // Allow up to 50 joins per link
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Generate shareable URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  return `${baseUrl}/teams/invite?token=${token}`;
}

export async function joinTeamWithInvite(token: string, userId: string) {
  // Verify token is valid and not expired
  const { data: invite, error: inviteError } = await supabase
    .from('team_invites')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .or('max_uses.is.null,use_count.lt.max_uses')
    .single();
  
  if (inviteError || !invite) {
    throw new Error('Invalid or expired invite link');
  }
  
  // Check if user is already a member
  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', invite.team_id)
    .eq('user_id', userId)
    .single();
  
  if (existing) {
    throw new Error('Already a member of this team');
  }
  
  // Add user to team
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: invite.team_id,
      user_id: userId,
      role: 'member',
    });
  
  if (memberError) throw memberError;
  
  // Mark invite as used
  await supabase
    .from('team_invites')
    .update({
      use_count: invite.use_count + 1,
      used_at: new Date().toISOString(),
      used_by: userId,
    })
    .eq('id', invite.id);
  
  return invite.team_id;
}
```

### Offline-First Team Data Pattern

```typescript
// lib/db/teams.ts with offline support
import { getDB } from '@/lib/db/client';
import { queueOfflineAction } from '@/lib/db/actions';

export async function createTeam(data: CreateTeamInput, userId: string) {
  const teamId = crypto.randomUUID();
  
  // Optimistic local write
  const db = await getDB();
  await db.add('teams', {
    id: teamId,
    ...data,
    created_by: userId,
    created_at: new Date().toISOString(),
    sync_status: 'pending',
  });
  
  // Queue for sync
  await queueOfflineAction({
    type: 'INSERT',
    table: 'teams',
    data: { id: teamId, ...data, created_by: userId },
  });
  
  return teamId;
}

export async function addPlayer(data: CreatePlayerInput, teamId: string) {
  const playerId = crypto.randomUUID();
  
  // Optimistic local write
  const db = await getDB();
  await db.add('players', {
    id: playerId,
    team_id: teamId,
    ...data,
    created_at: new Date().toISOString(),
    sync_status: 'pending',
  });
  
  // If avatar, upload to storage first
  if (data.avatarBlob) {
    const { data: uploadData, error } = await supabase.storage
      .from('avatars')
      .upload(`players/${playerId}.jpg`, data.avatarBlob);
    
    if (!error) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`players/${playerId}.jpg`);
      
      await db.put('players', {
        id: playerId,
        avatar_url: publicUrl,
      });
    }
  }
  
  // Queue for sync
  await queueOfflineAction({
    type: 'INSERT',
    table: 'players',
    data: { id: playerId, team_id: teamId, ...data },
  });
  
  return playerId;
}
```

### Multi-Select Role Pattern

```typescript
// components/players/role-selector.tsx
'use client';

import { useState } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { Shield, UserCircle, Zap, Target } from 'lucide-react';

const ROLES = [
  { id: 'goalkeeper', label: 'Portiere', icon: Shield },
  { id: 'defender', label: 'Difensore', icon: UserCircle },
  { id: 'midfielder', label: 'Centrocampista', icon: Zap },
  { id: 'attacker', label: 'Attaccante', icon: Target },
] as const;

type Role = typeof ROLES[number]['id'];

interface RoleSelectorProps {
  value: Role[];
  onChange: (roles: Role[]) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const toggleRole = (roleId: Role) => {
    if (value.includes(roleId)) {
      onChange(value.filter((r) => r !== roleId));
    } else {
      onChange([...value, roleId]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ROLES.map(({ id, label, icon: Icon }) => (
        <Toggle
          key={id}
          pressed={value.includes(id)}
          onPressedChange={() => toggleRole(id)}
          className="flex items-center gap-2 px-4 py-2"
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Toggle>
      ))}
    </div>
  );
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Avatar cropping | Custom canvas manipulation | react-easy-crop | 2.7k stars, mobile gestures, zoom/rotate built-in |
| Image file upload | Custom upload handling | Supabase Storage | Built-in RLS, CDN, image transformations |
| Invite token generation | Random strings with manual expiration | Database-driven tokens with expires_at | Automatic cleanup, auditable, multi-use support |
| Team permissions | Complex RBAC system | Simple role column in membership table | Requirements only need 3 roles, keeps RLS simple |
| Real-time team updates | Custom WebSocket server | Supabase Realtime | Built-in presence, broadcast, Postgres changes |
| Image optimization | Manual resize libraries | Supabase Storage transforms | On-the-fly resize/crop via URL params |

**Key insight:** For team management, avoid over-engineering the permission system. The requirements only call for admin/co-admin/member roles - don't build a full RBAC system. Use the membership table pattern with simple role checks.

## Common Pitfalls

### Pitfall 1: RLS Policy Performance
**What goes wrong:** Policies with subqueries to membership tables cause full table scans on every query.

**Why it happens:** Postgres doesn't optimize subqueries in RLS policies well by default.

**How to avoid:**
1. Add indexes on `team_members(team_id, user_id)` and `team_members(user_id)`
2. Use `security definer` helper functions for complex checks
3. Add application-level filters (e.g., `.eq('team_id', teamId)`) even when RLS exists

**Warning signs:** Query latency >200ms on team data; high CPU on Postgres

### Pitfall 2: Orphaned Players on Team Delete
**What goes wrong:** Deleting a team leaves player records without cascading properly.

**Why it happens:** Missing `ON DELETE CASCADE` or incorrect foreign key setup.

**How to avoid:**
```sql
-- Always use CASCADE for team-owned data
REFERENCES teams(id) ON DELETE CASCADE

-- For player-user linkage, use SET NULL
REFERENCES auth.users(id) ON DELETE SET NULL
```

### Pitfall 3: Invite Link Abuse
**What goes wrong:** Invite links shared publicly lead to unauthorized team joins.

**How to avoid:**
- Set `max_uses` limit (e.g., 50)
- Short expiration (7 days)
- Optional: bind to email address for targeted invites
- Track who created each invite

### Pitfall 4: Avatar Storage Costs
**What goes wrong:** Users upload massive images, causing storage bloat.

**How to avoid:**
- Client-side crop to reasonable size (512x512 max)
- Supabase Storage bucket limits
- Compress JPEG before upload

### Pitfall 5: Offline Edit Conflicts
**What goes wrong:** Multiple users edit same player data offline, causing sync conflicts.

**How to avoid:**
- Use `updated_at` timestamps
- Last-write-wins is acceptable for Phase 2
- Show sync status clearly in UI
- Consider adding simple conflict UI in later phase

### Pitfall 6: Missing Sync Status on Entities
**What goes wrong:** Can't tell if team/player data is synced or pending.

**How to avoid:**
- Always include `sync_status` field: 'synced' | 'pending' | 'error'
- Show visual indicators in UI
- Include in all database tables

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JWT custom claims for team membership | Membership table with RLS | 2024 | More flexible, supports multiple teams per user |
| Server-side image cropping | Client-side with canvas API | 2024 | Faster UX, less server load |
| Email-based invites only | Sharable link invites + QR | 2025 | Better for WhatsApp sharing |
| Role enums in JWT | Database role column | 2024 | Dynamic role changes without re-login |
| WebSocket real-time | Supabase Realtime (SSE-based) | 2024 | Better mobile battery, auto-reconnect |

## Open Questions

1. **Team size limits?**
   - What we know: Requirements don't specify limits
   - What's unclear: Should we enforce max players per team?
   - Recommendation: Start with no limit, add soft limit at 30 players if needed

2. **Player statistics storage?**
   - What we know: Phase 5 will add match statistics
   - What's unclear: Should player schema include stats columns now or later?
   - Recommendation: Keep player table minimal; add stats in Phase 5 migration

3. **Team deletion behavior?**
   - What we know: Users want to manage teams
   - What's unclear: Soft delete or hard delete? What about match history?
   - Recommendation: Soft delete (add `deleted_at` column) to preserve match records

## Sources

### Primary (HIGH confidence)
- Supabase Row Level Security docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Custom Claims & RBAC: https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac
- react-easy-crop: https://github.com/ValentinH/react-easy-crop (2.7k stars, actively maintained)
- Supabase Storage Image Transforms: https://supabase.com/docs/guides/storage/serving/image-transformations
- Supabase Realtime Presence: https://supabase.com/docs/guides/realtime/presence

### Secondary (MEDIUM confidence)
- RLS Performance Guide: https://github.com/GaryAustin1/RLS-Performance
- react-avatar-editor alternative: https://github.com/mosch/react-avatar-editor
- Offline-first patterns: https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/

### Tertiary (LOW confidence)
- Team membership schema patterns from various open-source projects

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - react-easy-crop is well-established, Supabase patterns are documented
- Architecture: HIGH - Membership table pattern is standard for Supabase multi-tenant apps
- Pitfalls: MEDIUM - Based on community reports and testing, some edge cases may exist

**Research date:** 2026-02-15
**Valid until:** 2026-03-15 (30 days for stable tech, image cropping libraries move slowly)

---

## Phase 2 Implementation Checklist

### Database
- [ ] Create `teams` table with RLS
- [ ] Create `team_members` junction table with roles
- [ ] Create `players` table with roles array
- [ ] Create `team_invites` table with token management
- [ ] Add indexes for performance
- [ ] Create helper functions for admin/member checks
- [ ] Enable RLS on all tables

### Features
- [ ] TEAM-01: Create team with name/description
- [ ] TEAM-02: Add players with details
- [ ] TEAM-03: Avatar upload with crop
- [ ] TEAM-04: Multi-role assignment
- [ ] TEAM-05: Generate invite links
- [ ] TEAM-06: Join via invite link
- [ ] TEAM-07: Remove players
- [ ] TEAM-08: Co-admin assignment
- [ ] TEAM-09: View roster
- [ ] TEAM-10: 5-a-side/8-a-side modes

### Offline Support
- [ ] Teams cached in IndexedDB
- [ ] Players cached in IndexedDB
- [ ] Queue mutations for sync
- [ ] Sync status indicators
- [ ] Background sync integration

### UI/UX
- [ ] Italian translations
- [ ] Mobile-first responsive design
- [ ] Touch-friendly 48px targets
- [ ] Offline indicators
- [ ] Optimistic updates
