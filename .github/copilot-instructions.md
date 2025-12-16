# MeylisBrothers Weather App — Agent Guide

Short, project-specific rules to help AI agents be productive in this repo.

## Architecture & State
- Dual platform: Web (primary) in `src/` with Vite + React + Tailwind + Three.js; Mobile (early) in `mobile/` via Expo.
- Global state via contexts. Always use hooks, never access context objects directly:
	- `useTheme()` → theme, temp unit (celsius/fahrenheit), wind unit (ms/kmh/mph/kn/points).
	- `useLanguage()` → `t(key)` for i18n (see `src/contexts/LanguageContext.jsx`).
	- `useTime()` → timezone-aware `formatTime/formatDate/dayKey`, hour12 toggle, ignoreDST/rollback.
	- `AuthContext` is optional (Supabase); code should degrade gracefully if not configured.

## Weather data (do not call APIs directly)
- Use `src/services/weatherService.js` for all fetches and conversions.
- Provider chain: WeatherAPI.com (primary) → OpenWeatherMap fallback; weekly may fall back to Open‑Meteo.
- Sunrise/sunset via SunriseSunset.io; converted to ISO then Unix seconds (`convertUTCToTimestamp`).
- Data shapes are documented in `src/types/weather.js` (e.g., `WeatherData`, `ForecastData`, hourly/daily items).
- Always propagate timezone from provider (IANA id when available) to downstream UI.

Example: `getForecastData(city)` returns `{ list: [...], city: { name, country, timezone }, timezone }` with `dt` in seconds.

## Time & timezone (critical)
- All display/time grouping goes through `src/utils/timeFormat.js`:
	- `formatTimestampTZ`, `formatDateTZ`, `getDisplayTime`, `getDisplayDate`, `dayKey`, `dayStartEpoch`.
- In components use `useTime()` helpers; do NOT use `new Date(...).toLocale*` directly.
- `TimeContext` handles hour12/ignoreDST/rollback and can accept IANA tz or numeric offset.

Example: `const { formatDate } = useTime(); formatDate(item.dt, { locale, opts: { weekday: 'short' } });`

## Units, wind, and translations
- Temperatures are stored as Celsius. Convert with `convertTemperature` from `weatherService.js`.
- Wind: use `src/utils/windSpeed.js` → `convertWindSpeed`, `formatWindSpeed`, `getWindSpeedUnit`.
- i18n: `const { t, language } = useLanguage();` Keys live in `LanguageContext.jsx` (10+ languages).

Example (see `src/components/ForecastCard.jsx`): uses `useTheme`, `useLanguage`, `useTime`, and `convertTemperature` to render a day card.

## Styling, animation, 3D
- Tailwind for styling; dark mode toggled via `ThemeContext` (adds `dark` class on `<html>`).
- Framer Motion for transitions/animations.
- Three.js scene lives in `src/components/three/SolarScene.jsx`; celestial components in `CelestialSun.jsx`/`CelestialMoon.jsx`.

## Workflows
- Web scripts (package.json): `npm run dev`, `npm run build`, `npm run preview`, `npm test` (Vitest).
- Tests live next to utils (e.g., `src/utils/timeFormat.test.js`, moon/time normalization tests).
- Env vars (Vite): `VITE_WEATHERAPI_KEY`, `VITE_OPENWEATHER_API_KEY`, optional `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Conventions & gotchas
- Fetch only via service functions; keep component props pure and shaped per `types/weather.js`.
- Always keep/forward timezone from responses; group by location day using `useTime().dayKey`.
- When adding features: implement on web first, then adapt to `mobile/` with similar structure.
- Errors: `ErrorBoundary.jsx` for React errors; services log and gracefully fall back when providers/keys are missing.
