---
phase: 01-foundation-auth
plan: 06
subsystem: ui

tags: [i18n, next-intl, next-themes, dark-mode, onboarding, localization]

requires:
  - phase: 01-foundation-auth
    provides: Middleware infrastructure, Service Worker, auth system

provides:
  - Italian/English internationalization with URL-based locale routing
  - Dark/light theme system with system detection and manual toggle
  - Onboarding tutorial for first-time users with localStorage persistence
  - Locale-aware layout with NextIntlClientProvider
  - Navigation utilities with createNavigation from next-intl

affects:
  - UI components
  - User experience
  - Mobile accessibility

tech-stack:
  added: [next-intl, next-themes]
  patterns:
    - "Locale routing with /it/ and /en/ prefixes"
    - "Theme switching via data-theme attribute"
    - "Client-side hooks for onboarding state"

key-files:
  created:
    - lib/i18n/routing.ts
    - lib/i18n/request.ts
    - lib/i18n/navigation.ts
    - messages/en.json
    - messages/it.json
    - components/providers/theme-provider.tsx
    - components/theme-toggle.tsx
    - components/locale-switcher.tsx
    - components/onboarding/tutorial.tsx
    - hooks/use-onboarding.ts
    - app/[locale]/layout.tsx
    - app/[locale]/page.tsx
  modified:
    - middleware.ts (i18n + auth middleware chaining)
    - app/globals.css (data-theme dark mode support)
    - app/page.tsx (redirect to default locale)

key-decisions:
  - "Used next-intl v4 with createMiddleware for i18n routing"
  - "Italian as default locale (it) with English fallback"
  - "next-themes with data-theme attribute for theme switching"
  - "Client-side localStorage for onboarding persistence"
  - "Custom locale switcher dropdown (no shadcn dependency)"

patterns-established:
  - "Locale routing: URLs prefixed with /it/ or /en/"
  - "Theme provider: Wraps app with next-themes ThemeProvider"
  - "Onboarding hook: useOnboarding for managing tutorial state"
  - "Navigation: Use createNavigation from next-intl for locale-aware links"

duration: 127min
completed: 2026-02-14
---

# Phase 01 Plan 06: Theme, i18n, and Onboarding Summary

**Complete internationalization with Italian/English locales, system-aware dark/light theme with manual toggle, and 4-step onboarding tutorial for new users**

## Performance

- **Duration:** 127 min (2h 7m)
- **Started:** 2026-02-14T00:15:59Z
- **Completed:** 2026-02-14T02:17:53Z
- **Tasks:** 4
- **Files modified:** 16

## Accomplishments

- Configured next-intl with Italian (default) and English locale routing
- Created locale-aware layout with NextIntlClientProvider and theme support
- Implemented dark/light theme with next-themes and animated toggle button
- Built 4-step onboarding tutorial with progress indicators and localStorage persistence
- Added complete translation files for navigation, auth, and onboarding

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure i18n with next-intl** - `7f5e479` (feat)
2. **Task 2: Create locale-aware layout** - `95a1a41` (feat)
3. **Task 3: Implement dark/light theme** - `1bf6d08` (feat)
4. **Task 4: Create onboarding tutorial** - `73f3631` (feat)

## Files Created/Modified

### i18n Infrastructure
- `lib/i18n/routing.ts` - Locale routing config (it/en, it default)
- `lib/i18n/request.ts` - Request config for loading messages
- `lib/i18n/navigation.ts` - Navigation utilities with createNavigation
- `messages/it.json` - Italian translations
- `messages/en.json` - English translations

### Theme System
- `components/providers/theme-provider.tsx` - next-themes wrapper
- `components/theme-toggle.tsx` - Animated Sun/Moon toggle button
- `app/globals.css` - Updated for data-theme dark mode

### UI Components
- `components/locale-switcher.tsx` - Language dropdown with flags
- `components/onboarding/tutorial.tsx` - 4-step tutorial modal
- `hooks/use-onboarding.ts` - localStorage-based onboarding state

### App Structure
- `app/[locale]/layout.tsx` - Locale-aware layout with providers
- `app/[locale]/page.tsx` - Home page with i18n and onboarding
- `app/page.tsx` - Redirects to default locale
- `middleware.ts` - Combined i18n + auth middleware

## Decisions Made

1. **Italian as default locale**: Primary market is Italy, so `/` redirects to `/it/`
2. **data-theme attribute**: Works with next-themes and Tailwind CSS dark mode
3. **Custom locale switcher**: Avoided shadcn dependency, used simple dropdown
4. **Client-side onboarding**: localStorage flag tracks completion, resets per browser
5. **Middleware chaining**: i18n routing runs first, then auth session refresh

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

1. **next-intl v4 import syntax**: Initially used named import `{ createMiddleware }` but v4 uses default export. Fixed with `import createMiddleware from 'next-intl/middleware'`.

2. **Dropdown menu not available**: shadcn dropdown-menu component wasn't installed. Created custom dropdown with vanilla HTML/CSS instead.

## Verification Status

- ✅ i18n routing: `/it/` and `/en/` paths configured
- ✅ Translations: Complete auth, navigation, and onboarding keys
- ✅ Theme toggle: Animated Sun/Moon icons with system detection
- ✅ Onboarding: 4 steps with progress dots and skip option
- ✅ Middleware: Chains i18n routing with auth session refresh
- ✅ Layout: Locale-aware with suppressHydrationWarning for themes

## Next Phase Readiness

Phase 1 (Foundation & Auth) is complete with:
- ✅ Authentication system (Supabase, middleware)
- ✅ PWA infrastructure (manifest, service worker)
- ✅ Offline support (IndexedDB, background sync)
- ✅ i18n (Italian/English)
- ✅ Theming (dark/light mode)
- ✅ Onboarding (first-time user experience)

Ready for **Phase 02: Team Management** planning.

---
*Phase: 01-foundation-auth*
*Completed: 2026-02-14*
## Self-Check Verification

### Files Created:
- ✅ lib/i18n/routing.ts
- ✅ lib/i18n/request.ts
- ✅ lib/i18n/navigation.ts
- ✅ messages/en.json
- ✅ messages/it.json
- ✅ components/providers/theme-provider.tsx
- ✅ components/theme-toggle.tsx
- ✅ components/locale-switcher.tsx
- ✅ components/onboarding/tutorial.tsx
- ✅ hooks/use-onboarding.ts
- ✅ app/[locale]/layout.tsx
- ✅ app/[locale]/page.tsx

### Commits Verified:
- ✅ 7f5e479
- ✅ 95a1a41
- ✅ 1bf6d08
- ✅ 73f3631
