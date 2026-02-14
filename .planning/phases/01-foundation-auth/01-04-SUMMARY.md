---
phase: 01-foundation-auth
plan: 04
subsystem: pwa
tags: [pwa, manifest, icons, offline, nextjs]

requires:
  - phase: 01-03
    provides: "Service Worker infrastructure and offline capabilities"

provides:
  - PWA manifest with app metadata
  - App icons in required sizes (192x192, 512x512)
  - Apple touch icon for iOS
  - Favicon for browsers
  - Offline fallback page
  - Layout configured for PWA installability

affects:
  - 01-05
  - 01-06
  - 02-team-management

tech-stack:
  added:
    - "Next.js 15 MetadataRoute.Manifest"
    - "Sharp for icon generation"
  patterns:
    - "manifest.ts for PWA configuration"
    - "Viewport configuration for mobile"
    - "Offline page at /offline"

key-files:
  created:
    - app/manifest.ts
    - public/icons/icon-192x192.png
    - public/icons/icon-512x512.png
    - public/icons/apple-touch-icon.png
    - public/icons/favicon.ico
    - app/offline/page.tsx
    - scripts/generate-icons.js
  modified:
    - app/layout.tsx

key-decisions:
  - "Used Next.js 15 built-in manifest.ts for automatic /manifest.webmanifest generation"
  - "Green (#22c55e) theme color representing football field"
  - "Programmatic icon generation using Sharp for MVP icons"
  - "Italian language (it) as primary language"

duration: 5min
completed: 2026-02-14
---

# Phase 1 Plan 04: PWA Manifest and Assets Summary

**PWA manifest with app icons, theme configuration, and offline fallback page for installable web app experience**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-14T00:15:39Z
- **Completed:** 2026-02-14T00:20:59Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Created PWA manifest at `/manifest.webmanifest` with app metadata
- Generated branded app icons in all required sizes (192x192, 512x512, 180x180)
- Created offline fallback page at `/offline` with retry functionality
- Updated layout with viewport configuration and theme-color meta tags
- Set Italian (it) as primary language for i18n foundation

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PWA Manifest** - `c339bd7` (feat)
2. **Task 2: Create PWA Icons and Assets** - `c625db5` (feat)
3. **Task 3: Create Offline Fallback Page** - `b166e94` (feat)

## Files Created/Modified

- `app/manifest.ts` - PWA manifest with MetadataRoute.Manifest export
- `public/icons/icon-192x192.png` - PWA icon 192x192 (green with CM logo)
- `public/icons/icon-512x512.png` - PWA icon 512x512 (green with CM logo)
- `public/icons/apple-touch-icon.png` - iOS home screen icon (180x180)
- `public/icons/favicon.ico` - Browser favicon (32x32)
- `app/offline/page.tsx` - Offline fallback page with CloudOff icon and retry button
- `scripts/generate-icons.js` - Node.js script for icon generation using Sharp
- `app/layout.tsx` - Updated with viewport, theme-color, manifest link, and ServiceWorkerRegister

## Decisions Made

1. **Next.js 15 Manifest API** - Using `app/manifest.ts` with `MetadataRoute.Manifest` export provides automatic generation at `/manifest.webmanifest` without manual route configuration

2. **Green Theme Color (#22c55e)** - Chosen to represent football field green, creating instant visual association with the app's purpose

3. **Programmatic Icon Generation** - Used Sharp library to generate SVG-based PNG icons. This creates consistent branded icons with "CM" initials while keeping the process repeatable for future icon updates

4. **Italian Primary Language** - Set `lang: "it"` in manifest and `lang="it"` in HTML to match the app's target audience (Italian football players)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. All components compiled successfully and icons generated at correct sizes.

## User Setup Required

None - no external service configuration required.

## PWA Installability Criteria Met

| Criteria | Status | Notes |
|----------|--------|-------|
| Valid manifest | ✅ | `/manifest.webmanifest` generated |
| Icons 192x192 | ✅ | Created with Sharp |
| Icons 512x512 | ✅ | Created with Sharp |
| Theme color | ✅ | #22c55e (green) |
| Background color | ✅ | #ffffff (white) |
| Start URL | ✅ | "/" |
| Display mode | ✅ | "standalone" |
| Offline page | ✅ | `/offline` accessible |

## Testing PWA Installability

To verify PWA installability:

1. Build the app: `npm run build`
2. Serve locally or deploy
3. Open in Chrome/Edge
4. Check DevTools > Application > Manifest
5. Verify all icons load correctly
6. Check DevTools > Lighthouse > PWA for audit

## Next Phase Readiness

- PWA foundation complete and ready for Phase 2 (Team Management)
- All PWA requirements met for Chrome/Edge installation
- iOS Safari support configured with apple-touch-icon
- Offline page ready for Service Worker integration

---
*Phase: 01-foundation-auth*  
*Completed: 2026-02-14*

## Self-Check: PASSED

- ✅ app/manifest.ts exists and exports MetadataRoute.Manifest
- ✅ public/icons/icon-192x192.png exists (192x192 PNG)
- ✅ public/icons/icon-512x512.png exists (512x512 PNG)
- ✅ public/icons/apple-touch-icon.png exists (180x180 PNG)
- ✅ public/icons/favicon.ico exists (32x32 PNG)
- ✅ app/offline/page.tsx exists with offline fallback UI
- ✅ app/layout.tsx updated with viewport and theme-color
- ✅ 4 commits with proper format (feat/docs(01-04): ...)
- ✅ SUMMARY.md created at .planning/phases/01-foundation-auth/01-04-SUMMARY.md
- ✅ STATE.md updated with Plan 04 context and decisions
