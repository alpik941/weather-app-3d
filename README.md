# Alpik941 Weather App — Web ↔ React Native Migration

This repo hosts the primary Web app (Vite + React) in `src/` and an Expo (React Native) app in `mobile/`.

This document summarizes how we prepared the project for a clean migration and code sharing between platforms.

## What changed

- Created `src/shared/` for cross-platform code:
  - `src/shared/utils/windSpeed.js` — canonical wind speed conversions and formatting.
  - `src/shared/config/env.js` — safe env access for Vite (web) and Expo (RN).
  - `src/shared/services/weatherService.js` — provider chain (WeatherAPI → OpenWeather → Open‑Meteo) without DOM dependencies.
- Web and Mobile now import from shared:
  - Web alias `@shared` (Vite) and path mapping added; mobile re-exports shared modules with Metro config.
  - Web `src/services/weatherService.js` re-exports shared services and keeps `getCurrentLocation` as web-only.
- Added `mobile/metro.config.js` to allow importing code from the monorepo root (shared code).

## Env variables

Configure keys using either Vite or Expo public env vars:

- Web (Vite):
  - `VITE_WEATHERAPI_KEY`
  - `VITE_OPENWEATHER_API_KEY`
- Mobile (Expo):
  - `EXPO_PUBLIC_WEATHERAPI_KEY`
  - `EXPO_PUBLIC_OPENWEATHER_API_KEY`

The shared env accessor checks both families. It is safe on both web and RN.

## Geolocation

Shared services intentionally avoid DOM APIs. On Web, `getCurrentLocation()` remains in `src/services/weatherService.js` and uses `navigator.geolocation`.
On Mobile, prefer `expo-location` and implement a platform-specific location helper within `mobile/` (not added by default).

## Navigation & UI

- Web: React Router + Tailwind + Three.js.
- Mobile: React Navigation + nativewind.

Keep presentation components platform-specific; move only pure logic and services into `src/shared/`.

## Dev scripts

Web:

```powershell
npm run dev
npm run build
npm run preview
```

Mobile (in `mobile/`):

```powershell
npm start
npm run android
npm run ios
```

## Next steps

- Extract design tokens to `src/shared/tokens.js` and consume from both Tailwind and nativewind.
- Consider moving time utilities (`src/utils/timeFormat.js`) behind a shared interface and test on RN (Hermes Intl).
- Add a small location helper in `mobile/` using `expo-location` to mirror `getCurrentLocation()`.
- Add unit tests targeting `src/shared/` (Vitest on web; Jest or Vitest with Metro for RN).
