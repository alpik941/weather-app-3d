# Backend Proxy — Production Notes

This project uses a backend proxy to keep provider API keys off the client.

## Goals
- Provider keys are **server-only** (`WEATHERAPI_KEY`, `OPENWEATHER_API_KEY`).
- Frontend calls `VITE_API_BASE_URL` (default `/api`).

## Recommended Deployment Topology
- Put the proxy behind a reverse proxy / edge (Nginx, Caddy, Cloudflare, Fly, Render, etc.).
- Serve the SPA and the proxy on the **same origin** if possible:
  - SPA: `https://app.example/`
  - Proxy: `https://app.example/api/*`
  - This avoids CORS complexity.

If you must split origins:
- SPA: `https://app.example/`
- Proxy: `https://api.example/`
- Set `VITE_API_BASE_URL=https://api.example/api`.
- Set `ALLOWED_ORIGIN=https://app.example` in the proxy.

## Environment
Create `server/.env`:
- `WEATHERAPI_KEY=...`
- `OPENWEATHER_API_KEY=...`
- `PORT=8787`
- `TRUST_PROXY=1` only if you run behind a trusted proxy that sets `X-Forwarded-For`.
- `ALLOWED_ORIGIN=https://...` only if you need CORS.
- `HEALTHCHECK_UPSTREAM=1` to enable provider probes in health/readiness endpoints.
- `HEALTHCHECK_CACHE_MS=5000` (optional) caches readiness/probe results to avoid hammering upstreams.

## Health & Readiness
- `GET /api/health` returns process info, key presence, and (optionally) upstream probe results. Always responds `200` if the proxy is running.
- `GET /api/ready` is intended for load balancers/orchestrators. Responds `200` when the proxy is “ready”, otherwise `503`.

Readiness rules:
- If `HEALTHCHECK_UPSTREAM` is off: “ready” requires keys to be configured.
- If `HEALTHCHECK_UPSTREAM` is on: “ready” requires keys + successful upstream probes.

## Security & Abuse Controls
Implemented in `server/proxy.js`:
- Allowlist of upstream paths (prevents “free proxy” abuse).
- Rate limiting per IP (basic in-memory; replace with Redis in multi-instance deployments).
- Upstream timeouts via `AbortController`.
- Security headers (minimal).

Production recommendations:
- Use an edge WAF / bot protection.
- Add Redis-backed rate limiting.
- Add request IDs + structured logs.
- Consider caching tiles at a CDN; tiles can generate high traffic.

## Monitoring
Minimum signals to add in prod:
- Request count, latency, upstream status distribution.
- Rate-limit events.
- Timeouts count.

## Key Rotation
If keys were ever built into a client bundle, assume they were leaked.
- Rotate both provider keys.
- Apply provider-side restrictions (domain/IP restrictions where available).
