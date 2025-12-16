# Onboarding Overlay (One-time)

Goal: Help users configure Time Format, Ignore DST, and Saved Cities on first run.

## UX
- Trigger: First app launch or when `localStorage['onboarding:v1'] !== 'dismissed'`.
- Steps:
  1) Time Format: 12h / 24h / Auto (explain each).
  2) Ignore DST: short tip when to use.
  3) Saved Cities: add up to 3; skip allowed.
- Controls: Next/Back, Skip, Done. Keyboard accessible.
- Persistence: `onboarding:v1 = dismissed` after Done/Skip.

## Tech
- Component: `src/components/Onboarding/OnboardingOverlay.jsx`.
- State: Uses `useTime`, `useLanguage`, `useTheme`.
- i18n: new keys under `LanguageContext` if needed.
- Analytics (optional): track completion if telemetry consented.

## Acceptance criteria
- Overlay appears once per user/device.
- Settings apply immediately.
- Fully keyboard navigable.
