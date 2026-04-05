# Milestone A — Success Criteria Checklist

## Foundation
- [x] Expo SDK 55 + React Native 0.83 initialized
- [x] TypeScript strict mode enabled
- [x] Expo Router configured with typed routes
- [x] Feature-based src/ directory structure
- [x] Environment validation via Zod (src/lib/env/)
- [x] Supabase client with SecureStore-backed session persistence
- [x] TanStack Query client configured
- [x] Zustand auth store
- [x] Sentry initialization (conditional on DSN)
- [x] PostHog initialization (conditional on API key)
- [x] RevenueCat package installed (no paywall work yet)
- [x] Theme/constants layer for consistent styling

## Auth
- [x] Anonymous/guest auth via Supabase `signInAnonymously()`
- [ ] Session auto-refresh on app foreground
- [ ] Link anonymous → email/social account (future milestone)

## Onboarding
- [x] Intro screen with "Get Started" flow
- [x] Vibe selection screen (multi-select categories)
- [x] Duration selection screen (single-select time commitment)
- [x] Starter-pack screen with onboarding completion
- [ ] Persist vibe + duration preferences to Supabase user profile
- [x] Onboarding state persisted in SecureStore

## Home Screen
- [x] Daily assignments list with quest cards
- [x] Difficulty badges + XP reward display
- [x] Tap-to-navigate to quest detail
- [ ] Fetch assignments from Supabase (currently placeholder data)
- [ ] Pull-to-refresh

## Quest Flow
- [x] Quest detail screen with metadata
- [x] Quest active screen with camera/photo picker proof capture
- [x] Reward reveal screen with XP breakdown
- [ ] Upload proof photo to Supabase Storage
- [ ] Create completion record in Supabase
- [ ] Fetch real reward data from backend

## Progress
- [x] Progress screen with level, XP bar, streak, stats
- [ ] Fetch progress snapshot from Supabase
- [ ] Real-time XP/level updates after quest completion

## Routing
- [x] Root index routes based on onboarding + session state
- [x] Tab navigation (Today + Progress)
- [x] Onboarding flow navigation (intro → vibe → duration → starter-pack → home)
- [x] Quest flow navigation (home → detail → active → reward → home)

## Not in Scope (Milestone A)
- Duels
- Weekly recap UI
- Subscriptions / paywall
- Public feed
- Advanced profile / settings
- Creator tools
- Extra tabs beyond Today + Progress
