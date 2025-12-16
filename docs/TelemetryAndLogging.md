# Telemetry (Opt-in) & Client Logging

## Telemetry (optional)
- Consent dialog: No data sent without explicit opt-in.
- Events: setting changes (time format, DST, theme), feature views (hourly/weekly/alerts), errors.
- Transport: `navigator.sendBeacon` or Supabase table with row-level security.
- Privacy: No PII; truncate text fields; rotate IDs.

## Client logging for bug reports
- Logger buffers recent messages (level, timestamp, context).
- API:
  - `logger.info/warn/error(meta)`
  - `logger.getBuffer()` returns last N lines
  - `logger.export()` returns redacted text
- UI: Settings → Support → “Export logs” (attach to email if support email configured).
