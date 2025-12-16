# Pre-React Native Roadmap

A focused checklist to complete on the web app before migrating to React Native. Each item has a brief why, a minimal implementation plan, and acceptance criteria.

## 1) One-time onboarding window (Time Format, Ignore DST, Saved Cities)
- Why: Reduce confusion and help users personalize in under a minute.
- Plan:
  - Create an `OnboardingOverlay` modal shown on first run (persist flag `onboarding:v1=dismissed`).
  - Steps: pick 12h/24h/Auto, toggle Ignore DST (explain when), add up to 3 saved cities.
  - Respect `useLanguage`, `useTime`, `useTheme`.
- Acceptance:
  - Overlay shows once; dismiss persists.
  - Changes reflect immediately in UI.

## 2) Offline caching (last successful forecast per city)
- Why: Graceful UX on weak/no connection.
- Plan:
  - Cache last successful results in `localStorage` (or IndexedDB for larger data) via `offlineCache` utils.
  - Read-through: on fetch error, fall back to cached snapshot with timestamp badge.
- Acceptance:
  - When network fails, last-known data shows with a subtle “offline” hint.

## 3) Severe warnings badge + quick preview
- Why: Surface critical weather risk.
- Plan:
  - Add small badge in header when `getWeatherAlerts` returns non-zero count.
  - Click opens a compact preview (title, severity, time), link to full panel.
- Acceptance:
  - Badge count matches alerts length; preview lists items with timezone-aware times.

## 4) Accessibility toggles (text size, high contrast)
- Why: Inclusive design.
- Plan:
  - Add "Large Text" and "High Contrast" toggles to Settings → Appearance.
  - Implement via root CSS classes (e.g., `a11y-text-lg`, `a11y-hicontrast`) so existing components inherit.
- Acceptance:
  - Text scaling increases body text by ~12–16%.
  - Contrast preset adjusts key colors while respecting dark mode.

## 5) Performance polish (skeletons, list caching)
- Why: Perceived speed and efficiency.
- Plan:
  - Add skeleton placeholders for Hourly/Weekly while loading.
  - Memoize heavy lists; virtualize if needed.
- Acceptance:
  - Skeletons render <100ms; scroll remains smooth on low-end devices.

## 6) Optional telemetry (opt-in)
- Why: Learn which settings matter to users.
- Plan:
  - Ask for consent; if accepted, log anonymous events (setting changes, views) with a privacy policy.
  - Use a simple beacon or Supabase table.
- Acceptance:
  - No data sent without consent; easy opt-out.

## 7) Bug reports (client logging)
- Why: Faster debugging in the field.
- Plan:
  - Lightweight logger that buffers recent warnings/errors; button to copy or email sanitized logs.
- Acceptance:
  - Logs redact PII and keys; export fits in a mail body.

## 8) E2E tests for time flows
- Why: Prevent regressions around DST/timezones.
- Plan:
  - Two high-value flows: (a) switch time mode → verify labels, (b) toggle Ignore DST → verify grouping by dayKey.
  - Use Playwright or Cypress in CI.
- Acceptance:
  - Tests green locally and in CI; failures point to specific helpers.

## 9) Mobile parity checklist
- Why: Smooth RN migration.
- Plan:
  - Track features/UI that must match on mobile (Settings, Hourly/Weekly, Alerts, Onboarding, A11y, Cache).
  - Mark web-specific vs shared logic (services, time utils, i18n).
- Acceptance:
  - Checklist reviewed before first RN sprint; gaps identified.

---

## Quick links
- Onboarding spec: ./OnboardingSpec.md
- Offline cache helper: ../src/utils/offlineCache.js
- Telemetry & logging: ./TelemetryAndLogging.md
- E2E scenarios: ./E2E-Test-Plan.md
