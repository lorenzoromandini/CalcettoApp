# Plan 02-03 Summary: Player Management

**Phase:** 02-team-management  
**Plan:** 03  
**Wave:** 2  
**Status:** ✅ Complete  
**Date:** 2026-02-15

---

## Objective

Implement player management with avatar upload/cropping and multi-role assignment (TEAM-02, TEAM-03, TEAM-04). Enables team admins to add and manage players with complete profiles including photos and positions.

---

## What Was Implemented

### Core Features
1. **Player Creation Form**
   - Name and surname fields (required/optional)
   - Nickname field (optional)
   - Jersey number input (1-99)
   - Multi-role selector (goalkeeper, defender, midfielder, attacker)
   - Avatar upload with client-side cropping
   - Mobile-friendly design (48px+ touch targets)

2. **Avatar Upload & Cropping**
   - File upload with 5MB limit
   - Client-side cropping using react-easy-crop
   - Square crop (1:1 aspect ratio) with round preview
   - Zoom slider for fine-tuning
   - JPEG output at 95% quality
   - Upload to Supabase Storage 'avatars' bucket

3. **Player List Page**
   - Displays all players for a team
   - Player cards with:
     - Avatar (or placeholder)
     - Name and surname
     - Nickname (if set)
     - Jersey number badge
     - Role badges with icons
   - Loading skeleton states
   - Empty state with CTA

4. **Multi-Team Player Support**
   - Players are team-agnostic entities
   - player_teams junction table stores team-specific data
   - Same player can have different jersey numbers in different teams
   - Roles belong to the player (global), jersey number is per-team

### New Files Created

```
lib/image-utils.ts               # Canvas-based image cropping utilities
hooks/use-players.ts             # React hooks for player data management
components/players/player-card.tsx    # Player list item with avatar, roles, jersey number
app/[locale]/teams/[teamId]/players/page.tsx           # Players list page
app/[locale]/teams/[teamId]/players/players-page-client.tsx  # Client component for list
app/[locale]/teams/[teamId]/players/create/page.tsx     # Add player page
app/[locale]/teams/[teamId]/players/create/create-player-page-client.tsx  # Client component for creation
```

### Existing Files Leveraged

```
components/players/player-form.tsx     # Player creation form (already existed)
components/players/avatar-cropper.tsx  # Avatar cropping UI (already existed)
components/players/role-selector.tsx   # Multi-select role component (already existed)
lib/validations/player.ts              # Zod validation schemas (already existed)
lib/db/players.ts                      # Player CRUD operations (already existed)
```

### Modified Files

```
messages/it.json                 # Added player translations (IT)
messages/en.json                 # Added player translations (EN)
```

---

## Key Design Decisions

### Avatar Workflow
1. User selects image file (validated: image type, <5MB)
2. Image displayed in cropper with round preview
3. User adjusts crop area and zoom
4. Client-side crop using Canvas API (getCroppedImg)
5. JPEG blob uploaded to Supabase Storage
6. Public URL stored in player record

### Multi-Role Selection
- Toggle buttons for each role
- Multiple roles can be selected
- Visual feedback with icons and colors
- Selected state: primary background color

### Multi-Team Architecture
```
players table: id, name, surname, nickname, avatar_url, roles (global)
player_teams table: id, player_id, team_id, jersey_number (per-team)
```

This allows:
- Same player in multiple teams
- Different jersey numbers per team
- Shared avatar and roles across teams

---

## Technical Details

### Dependencies Used
```json
{
  "react-easy-crop": "^5.5.6",
  "@types/react-easy-crop": "^1.16.0"
}
```

### Image Processing
- **Crop:** Canvas API with source region extraction
- **Quality:** 95% JPEG (good balance of quality/size)
- **Max Dimensions:** 512x512 (controlled storage costs)
- **Format:** Always JPEG for consistency

### Routes Added
- `GET /[locale]/teams/[teamId]/players` - List team players
- `GET /[locale]/teams/[teamId]/players/create` - Add new player

---

## Testing Checklist

- [x] Build passes (`npm run build`) with no TypeScript errors
- [x] Player creation form validates all fields
- [x] Avatar upload accepts images up to 5MB
- [x] Avatar cropper displays with zoom control
- [x] Cropped avatars upload to Supabase Storage
- [x] Multi-role selector allows multiple selections
- [x] Jersey number accepts values 1-99
- [x] Player list displays all team players
- [x] Player cards show avatar, name, roles, jersey number
- [x] Translations work in both Italian and English
- [x] Mobile-responsive with 48px+ touch targets
- [x] Empty state displays when no players exist
- [x] Loading skeleton shown during fetch

---

## Success Criteria Met

✅ User can add players with name, surname, nickname, jersey number  
✅ User can upload and crop player avatar to square format  
✅ User can assign multiple roles to players (GK, DEF, MID, ATT)  
✅ Jersey number is validated (1-99)  
✅ Player form validates with Italian error messages  
✅ Player list shows avatar, name, roles, and jersey number  
✅ Avatars upload to Supabase Storage after client-side crop  
✅ Multi-team player support via junction table  
✅ Build completes successfully  

---

## Known Issues / TODOs

1. **Player detail page** - Route `/teams/[teamId]/players/[playerId]` not yet implemented
2. **Player editing** - Update functionality exists but no edit page UI
3. **Avatar deletion** - No way to remove avatar once uploaded
4. **Jersey number uniqueness** - No validation yet to prevent duplicate numbers in same team

---

## Next Steps

Proceed to **Plan 02-04: Invite System**
- Generate invite links with tokens
- Share links via WhatsApp/email
- Join team via invite link
- Expire unused invites
