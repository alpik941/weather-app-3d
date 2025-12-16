# Time & Display Quick Guide

A short, user-friendly note to set time correctly and customize the app fast. This matches the app's Settings > Time sections.

## 1) Set the display clock (Display Mode)
- What it is: Choose how hours show on the clock.
- Options:
  - 12h (AM/PM)
  - 24h
  - Auto (uses your device/locale preference)
- How: Settings → Time → Time Format → pick 12h/24h or leave on Auto.
- Why: Match your habit and avoid confusion when reading hourly forecasts.

## 2) Ignore DST (Daylight Saving Time)
- What it is: Forces time calculations to ignore seasonal DST shifts.
- Use when:
  - You compare historical/forecast hours across DST boundaries.
  - Your local clock is wrong due to DST glitches.
- How: Settings → Time → Advanced → Ignore DST.
- Why: Keeps hourly alignment consistent (no ±1h jump).

## 3) Rollback Mode
- What it is: A safety switch that rolls the clock logic back to the previous rule set.
- Use when:
  - You notice unexpected hour labels during a DST changeover day.
  - You want to temporarily freeze the time rules for analysis.
- How: Settings → Time → Advanced → Rollback Mode (visible in development or when previously enabled).
- Why: Eliminates edge-case surprises during timezone transitions.

## 4) Timezone correctness (behind the scenes)
- The app automatically uses the weather provider’s timezone for each location.
- All grouping (days) and formatting go through the app’s Time system to avoid “wrong day” issues across zones.
- Tip: If times look off, toggle Ignore DST or switch 12h/24h to re-evaluate.

## 5) Fast personalization (60 seconds)
1) Pick your language (Settings → Language).
2) Choose 12h or 24h (Settings → Time → Time Format).
3) If your city shifts time soon, enable Ignore DST for a day, then turn it off.
4) Save up to 3 cities for quick switching (Settings → Saved Cities).
5) Optional: Dark/Light theme to match your system.

## Benefits at a glance
- Clear, consistent hours across timezones.
- No surprises at DST boundaries (Ignore DST + Rollback Mode).
- Familiar clock style (12h/24h/Auto) improves readability.
- One-minute setup to fit your preference.

---

## Ideas to add before React Native
- Onboarding tips: Show a one-time overlay highlighting Time Format, Ignore DST, and Saved Cities.
- Offline cache: Keep the last successful forecast per city for spotty connections.
- Severe alerts opt-in: Surface alert count in the header with a quick view.
- Accessibility: Larger text toggle and better contrast presets.
- Performance: Skeleton loaders and fewer re-renders in forecast lists.
- Telemetry (opt-in): Anonymous usage to learn which settings matter most.
- Error reporting: Lightweight client-side logging with redaction.
- E2E tests: A couple of flows (change time mode → verify labels; DST toggle → day grouping).
- Parity checklist for mobile: Track which web features will move to React Native.

If you’d like, I can wire this guide into Settings → Support as a “Quick guide” link.
