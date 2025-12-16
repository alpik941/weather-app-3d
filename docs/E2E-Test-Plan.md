# E2E Test Plan (Time & DST)

Tooling: Playwright or Cypress.

## Scenario A: Switch time mode updates labels
- Steps:
  1) Open app, navigate to Hourly Forecast.
  2) Toggle Time Format to 12h.
  3) Assert hourly labels contain AM/PM.
  4) Toggle to 24h.
  5) Assert hourly labels in 00–23 format.

## Scenario B: Ignore DST adjusts day grouping
- Precondition: Use a location crossing a DST boundary in the forecast period.
- Steps:
  1) Capture grouping (dayKey) with Ignore DST off.
  2) Toggle Ignore DST on.
  3) Assert boundary hours re-group as expected (no +-1h shift across days).

## Scenario C: Alerts badge and preview
- Mock alerts response to include 2 items.
- Steps: Assert badge shows "2" and preview lists both with timezone-aware times.
