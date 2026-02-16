// @ts-nocheck
/* eslint-env node */
/* global process, Buffer */
import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import crypto from 'node:crypto';

const app = express();

app.disable('x-powered-by');

const TRUST_PROXY = String(process.env.TRUST_PROXY || '') === '1';
if (TRUST_PROXY) app.set('trust proxy', true);

const NODE_ENV = process.env.NODE_ENV || 'development';
const HEALTHCHECK_UPSTREAM = String(process.env.HEALTHCHECK_UPSTREAM || '') === '1';
const HEALTHCHECK_CACHE_MS = Math.max(0, Number(process.env.HEALTHCHECK_CACHE_MS || 5000));

const PORT = Number(process.env.PORT || 8787);

const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY || process.env.VITE_WEATHERAPI_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY;

// API key validation at startup
console.log('🔑 Checking API keys...');

if (!WEATHERAPI_KEY) {
  console.error('❌ WEATHERAPI_KEY not found in environment variables!');
  console.error('   Please add it to .env file');
  console.error('   Example: WEATHERAPI_KEY=your_key_here');
}

if (!OPENWEATHER_API_KEY) {
  console.error('❌ OPENWEATHER_API_KEY not found in environment variables!');
  console.error('   Please add it to .env file');
  console.error('   Example: OPENWEATHER_API_KEY=your_key_here');
}

if (WEATHERAPI_KEY) {
  console.log('✅ WeatherAPI key:', WEATHERAPI_KEY.substring(0, 8) + '...');
}
if (OPENWEATHER_API_KEY) {
  console.log('✅ OpenWeather key:', OPENWEATHER_API_KEY.substring(0, 8) + '...');
}

const WEATHERAPI_ORIGIN = 'https://api.weatherapi.com/v1';
const OPENWEATHER_API_ORIGIN = 'https://api.openweathermap.org';
const OPENWEATHER_TILE_ORIGIN = 'https://tile.openweathermap.org';
const OPENMETEO_ORIGIN = 'https://api.open-meteo.com';

const DEFAULT_JSON_TIMEOUT_MS = 8000;
const DEFAULT_TILE_TIMEOUT_MS = 15000;

// Only proxy endpoints the app actually uses.
const WEATHERAPI_ALLOWED = new Set(['/forecast.json']);
const OPENWEATHER_ALLOWED = new Set([
  '/geo/1.0/direct',
  '/geo/1.0/reverse',
  '/data/2.5/weather',
  '/data/2.5/forecast',
  '/data/2.5/air_pollution',
]);
const OPENMETEO_ALLOWED = new Set(['/v1/forecast', '/v1/archive']);

function requireKey(name, value) {
  if (!value) {
    const err = new Error(`Missing server env var: ${name}`);
    err.statusCode = 500;
    throw err;
  }
}

// Minimal security headers (CSP is intentionally not set here).
app.use((req, res, next) => {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('cross-origin-resource-policy', 'same-site');

  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (allowedOrigin) {
    // If you deploy proxy on a different origin than the SPA, set ALLOWED_ORIGIN.
    res.setHeader('access-control-allow-origin', allowedOrigin);
    res.setHeader('vary', 'origin');
  }

  next();
});

// Correlation / request ID
app.use((req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const id = (typeof incoming === 'string' && incoming.length <= 128 && incoming.trim())
    ? incoming.trim()
    : crypto.randomUUID();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
});

function logJson(level, message, meta) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const line = JSON.stringify(payload);
  if (level === 'error' || level === 'warn') console.warn(line);
  else console.log(line);
}

function buildTargetUrl(origin, path, query, extraParams) {
  const url = new URL(origin + path);

  for (const [k, v] of Object.entries(query || {})) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      for (const item of v) url.searchParams.append(k, String(item));
    } else {
      url.searchParams.set(k, String(v));
    }
  }

  // Security: always enforce server-side auth params (client must never override).
  for (const [k, v] of Object.entries(extraParams || {})) {
    if (v == null) continue;
    url.searchParams.set(k, String(v));
  }

  return url;
}

function getClientIp(req) {
  // Express will compute req.ip; if trust proxy is enabled it will use XFF safely.
  return req.ip;
}

function validateQuery(req, { allowedKeys, maxKeys = 20, maxValueLen = 200 } = {}) {
  const keys = Object.keys(req.query || {});
  if (keys.length > maxKeys) return { ok: false, error: 'too_many_params' };

  for (const k of keys) {
    if (allowedKeys && !allowedKeys.has(k)) return { ok: false, error: 'param_not_allowed' };

    const v = req.query[k];
    const values = Array.isArray(v) ? v : [v];
    for (const item of values) {
      const s = String(item ?? '');
      if (s.length > maxValueLen) return { ok: false, error: 'param_too_long' };
    }
  }

  // Avoid extremely long URLs (basic abuse protection).
  if (String(req.originalUrl || '').length > 4096) return { ok: false, error: 'url_too_long' };

  return { ok: true };
}

function createRateLimiter({ windowMs, maxRequests }) {
  const hits = new Map();
  const MAX_TRACKED_IPS = 5000;
  let lastCleanupAt = 0;

  const cleanup = (now) => {
    // Remove expired buckets.
    for (const [ip, bucket] of hits.entries()) {
      if (now > bucket.resetAt) hits.delete(ip);
    }
    // Cap memory growth under “many unique IPs” abuse.
    while (hits.size > MAX_TRACKED_IPS) {
      const firstKey = hits.keys().next().value;
      if (firstKey == null) break;
      hits.delete(firstKey);
    }
  };

  return (req, res, next) => {
    const now = Date.now();

    // Cheap periodic cleanup.
    if (now - lastCleanupAt > 30_000) {
      cleanup(now);
      lastCleanupAt = now;
    }

    const ip = getClientIp(req) || 'unknown';

    const bucket = hits.get(ip) || { resetAt: now + windowMs, count: 0 };
    if (now > bucket.resetAt) {
      bucket.resetAt = now + windowMs;
      bucket.count = 0;
    }

    bucket.count += 1;
    hits.set(ip, bucket);

    res.setHeader('x-ratelimit-limit', String(maxRequests));
    res.setHeader('x-ratelimit-remaining', String(Math.max(0, maxRequests - bucket.count)));
    res.setHeader('x-ratelimit-reset', String(Math.floor(bucket.resetAt / 1000)));

    if (bucket.count > maxRequests) {
      res.status(429).json({ error: 'rate_limited' });
      return;
    }

    next();
  };
}

const jsonRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 120 });
const tileRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 300 });
const healthRateLimit = createRateLimiter({ windowMs: 60_000, maxRequests: 300 });

async function forwardJsonResponse(res, upstream) {
  // Avoid caching errors by default; allow light caching for success.
  res.setHeader('cache-control', upstream.ok ? 'public, max-age=60' : 'no-store');

  const status = upstream.status;
  const contentType = upstream.headers.get('content-type') || '';
  const text = await upstream.text();

  res.status(status);
  res.setHeader('content-type', 'application/json; charset=utf-8');

  if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
    res.send(text);
    return;
  }

  // Normalize non-JSON upstream errors into JSON.
  if (!upstream.ok) {
    const code = status === 401 || status === 403
      ? 'upstream_unauthorized'
      : status === 429
        ? 'upstream_rate_limited'
        : 'upstream_error';
    res.send(JSON.stringify({ error: code, status }));
    return;
  }

  res.send(JSON.stringify({ ok: true }));
}

async function forwardBinaryResponse(res, upstream) {
  const contentType = upstream.headers.get('content-type');
  if (contentType) res.setHeader('content-type', contentType);

  res.setHeader('cache-control', upstream.ok ? 'public, max-age=300' : 'no-store');

  res.status(upstream.status);
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}

function isAbortError(err) {
  return err?.name === 'AbortError' || String(err?.code || '') === 'ABORT_ERR';
}

async function probeUpstream(url, { timeoutMs = 4000 } = {}) {
  const started = Date.now();
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      headers: {
        'user-agent': 'weather-app-proxy/1.0',
        accept: 'application/json',
      },
      signal: ac.signal,
    });
    return {
      healthy: resp.ok,
      status: resp.status,
      latencyMs: Date.now() - started,
    };
  } catch (e) {
    return {
      healthy: false,
      status: isAbortError(e) ? 504 : 0,
      latencyMs: Date.now() - started,
    };
  } finally {
    clearTimeout(t);
  }
}

async function computeReadinessUncached() {
  const keysConfigured = {
    weatherapi: !!WEATHERAPI_KEY,
    openweather: !!OPENWEATHER_API_KEY,
  };

  const baseReady = keysConfigured.weatherapi && keysConfigured.openweather;

  if (!HEALTHCHECK_UPSTREAM) {
    return { ready: baseReady, keysConfigured, upstream: null };
  }

  const upstream = {};
  const probes = [];

  if (keysConfigured.weatherapi) {
    const url = buildTargetUrl(
      WEATHERAPI_ORIGIN,
      '/forecast.json',
      { q: 'London', days: 1, aqi: 'no', alerts: 'no' },
      { key: WEATHERAPI_KEY }
    );
    probes.push(
      probeUpstream(url, { timeoutMs: 4000 }).then((r) => {
        upstream.weatherapi = r;
      })
    );
  } else {
    upstream.weatherapi = { healthy: false, status: 500, latencyMs: 0, error: 'missing_key' };
  }

  if (keysConfigured.openweather) {
    const url = buildTargetUrl(
      OPENWEATHER_API_ORIGIN,
      '/data/2.5/weather',
      { q: 'London', units: 'metric' },
      { appid: OPENWEATHER_API_KEY }
    );
    probes.push(
      probeUpstream(url, { timeoutMs: 4000 }).then((r) => {
        upstream.openweather = r;
      })
    );
  } else {
    upstream.openweather = { healthy: false, status: 500, latencyMs: 0, error: 'missing_key' };
  }

  await Promise.all(probes);

  const upstreamReady = Boolean(upstream.weatherapi?.healthy) && Boolean(upstream.openweather?.healthy);
  return { ready: baseReady && upstreamReady, keysConfigured, upstream };
}

const readinessCache = {
  at: 0,
  value: null,
  inFlight: null,
};

async function computeReadiness() {
  if (HEALTHCHECK_CACHE_MS <= 0) return computeReadinessUncached();

  const now = Date.now();
  if (readinessCache.value && (now - readinessCache.at) < HEALTHCHECK_CACHE_MS) {
    return readinessCache.value;
  }

  if (readinessCache.inFlight) return readinessCache.inFlight;

  readinessCache.inFlight = (async () => {
    const v = await computeReadinessUncached();
    readinessCache.value = v;
    readinessCache.at = Date.now();
    return v;
  })().finally(() => {
    readinessCache.inFlight = null;
  });

  return readinessCache.inFlight;
}

app.get('/api/health', async (req, res) => {
  healthRateLimit(req, res, () => {});
  if (res.headersSent) return;
  const readiness = await computeReadiness();
  res.json({
    ok: true,
    ready: readiness.ready,
    env: NODE_ENV,
    trustProxy: TRUST_PROXY,
    uptimeSeconds: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    keysConfigured: readiness.keysConfigured,
    upstreamChecksEnabled: HEALTHCHECK_UPSTREAM,
    upstream: readiness.upstream,
  });
});

// Readiness endpoint for load balancers/orchestrators.
app.get('/api/ready', async (req, res) => {
  healthRateLimit(req, res, () => {});
  if (res.headersSent) return;
  const readiness = await computeReadiness();
  res.status(readiness.ready ? 200 : 503).json({ ready: readiness.ready, keysConfigured: readiness.keysConfigured, upstream: readiness.upstream });
});

// WeatherAPI proxy: /api/weatherapi/<path>?q=...&days=...
app.get('/api/weatherapi/*', async (req, res, next) => {
  try {
    jsonRateLimit(req, res, () => {});
    if (res.headersSent) return;

    requireKey('WEATHERAPI_KEY (or VITE_WEATHERAPI_KEY)', WEATHERAPI_KEY);

    const path = '/' + req.params[0];
    if (!WEATHERAPI_ALLOWED.has(path)) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const qv = validateQuery(req, {
      allowedKeys: new Set(['q', 'days', 'aqi', 'alerts', 'lang']),
      maxKeys: 10,
      maxValueLen: 300,
    });
    if (!qv.ok) {
      res.status(400).json({ error: qv.error });
      return;
    }

    const targetUrl = buildTargetUrl(WEATHERAPI_ORIGIN, path, req.query, { key: WEATHERAPI_KEY });

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), DEFAULT_JSON_TIMEOUT_MS);
    const upstream = await fetch(targetUrl, {
      headers: {
        'user-agent': 'weather-app-proxy/1.0',
        accept: 'application/json',
      },
      signal: ac.signal,
    });
    clearTimeout(t);

    await forwardJsonResponse(res, upstream);
  } catch (e) {
    if (isAbortError(e)) {
      res.status(504).json({ error: 'upstream_timeout' });
      return;
    }
    next(e);
  }
});

// OpenWeather proxy: /api/openweather/<path>?...
app.get('/api/openweather/*', async (req, res, next) => {
  try {
    jsonRateLimit(req, res, () => {});
    if (res.headersSent) return;

    requireKey('OPENWEATHER_API_KEY (or VITE_OPENWEATHER_API_KEY)', OPENWEATHER_API_KEY);

    const path = '/' + req.params[0];
    if (!OPENWEATHER_ALLOWED.has(path)) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const allowedByPath = (() => {
      switch (path) {
        case '/geo/1.0/direct':
          return new Set(['q', 'limit', 'lang']);
        case '/geo/1.0/reverse':
          return new Set(['lat', 'lon', 'limit', 'lang']);
        case '/data/2.5/weather':
          return new Set(['q', 'lat', 'lon', 'units', 'lang']);
        case '/data/2.5/forecast':
          return new Set(['q', 'lat', 'lon', 'units', 'lang']);
        case '/data/2.5/air_pollution':
          return new Set(['lat', 'lon']);
        default:
          return new Set();
      }
    })();

    const qv = validateQuery(req, {
      allowedKeys: allowedByPath,
      maxKeys: 10,
      maxValueLen: 300,
    });
    if (!qv.ok) {
      res.status(400).json({ error: qv.error });
      return;
    }

    const targetUrl = buildTargetUrl(OPENWEATHER_API_ORIGIN, path, req.query, { appid: OPENWEATHER_API_KEY });

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), DEFAULT_JSON_TIMEOUT_MS);
    const upstream = await fetch(targetUrl, {
      headers: {
        'user-agent': 'weather-app-proxy/1.0',
        accept: 'application/json',
      },
      signal: ac.signal,
    });
    clearTimeout(t);

    await forwardJsonResponse(res, upstream);
  } catch (e) {
    if (isAbortError(e)) {
      res.status(504).json({ error: 'upstream_timeout' });
      return;
    }
    next(e);
  }
});

// Open-Meteo proxy: /api/openmeteo/* (public API, no key required)
app.get('/api/openmeteo/*', async (req, res, next) => {
  try {
    jsonRateLimit(req, res, () => {});
    if (res.headersSent) return;

    const path = '/' + req.params[0];
    if (!OPENMETEO_ALLOWED.has(path)) {
      res.status(404).json({ error: 'not_found' });
      return;
    }

    const allowedByPath = (() => {
      switch (path) {
        case '/v1/forecast':
          return new Set(['latitude', 'longitude', 'timezone', 'forecast_days', 'daily', 'wind_speed_unit', 'temperature_unit', 'current', 'hourly']);
        case '/v1/archive':
          return new Set(['latitude', 'longitude', 'start_date', 'end_date', 'daily', 'timezone']);
        default:
          return new Set();
      }
    })();

    const qv = validateQuery(req, {
      allowedKeys: allowedByPath,
      maxKeys: 15,
      maxValueLen: 500,
    });
    if (!qv.ok) {
      res.status(400).json({ error: qv.error });
      return;
    }

    const targetUrl = buildTargetUrl(OPENMETEO_ORIGIN, path, req.query, {});

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), DEFAULT_JSON_TIMEOUT_MS);
    const upstream = await fetch(targetUrl, {
      headers: {
        'user-agent': 'weather-app-proxy/1.0',
        accept: 'application/json',
      },
      signal: ac.signal,
    });
    clearTimeout(t);

    await forwardJsonResponse(res, upstream);
  } catch (e) {
    if (isAbortError(e)) {
      res.status(504).json({ error: 'upstream_timeout' });
      return;
    }
    next(e);
  }
});

// OpenWeather tiles proxy: /api/openweather-tile/map/<layer>/<z>/<x>/<y>.png
app.get('/api/openweather-tile/map/:layer/:z/:x/:y.png', async (req, res, next) => {
  try {
    tileRateLimit(req, res, () => {});
    if (res.headersSent) return;

    requireKey('OPENWEATHER_API_KEY (or VITE_OPENWEATHER_API_KEY)', OPENWEATHER_API_KEY);

    const { layer, z, x, y } = req.params;
    if (!/^[a-z0-9_]+$/i.test(String(layer))) {
      res.status(400).json({ error: 'invalid_layer' });
      return;
    }
    for (const n of [z, x, y]) {
      if (!/^[0-9]+$/.test(String(n))) {
        res.status(400).json({ error: 'invalid_tile_coords' });
        return;
      }
    }

    const path = `/map/${encodeURIComponent(layer)}/${encodeURIComponent(z)}/${encodeURIComponent(x)}/${encodeURIComponent(y)}.png`;
    const targetUrl = buildTargetUrl(OPENWEATHER_TILE_ORIGIN, path, req.query, { appid: OPENWEATHER_API_KEY });

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), DEFAULT_TILE_TIMEOUT_MS);
    const upstream = await fetch(targetUrl, {
      headers: { 'user-agent': 'weather-app-proxy/1.0' },
      signal: ac.signal,
    });
    clearTimeout(t);

    await forwardBinaryResponse(res, upstream);
  } catch (e) {
    if (isAbortError(e)) {
      res.status(504).json({ error: 'upstream_timeout' });
      return;
    }
    next(e);
  }
});

app.use((err, req, res, next) => {
  const status = err?.statusCode || 500;
  const message = err?.message || 'Proxy error';
  try {
    // Minimal error logging (no keys, no full URLs)
    logJson('error', 'proxy_error', {
      status,
      path: req.path,
      ip: getClientIp(req),
      requestId: req.id,
    });
  } catch {}
  res.status(status).json({ error: message, requestId: req.id });
});

const server = http.createServer(app);

// Slowloris-ish protections (best-effort; still use a real reverse proxy in prod).
server.headersTimeout = 10_000;
server.requestTimeout = 20_000;
server.keepAliveTimeout = 5_000;

server.listen(PORT, () => {
  console.log(`[proxy] listening on http://localhost:${PORT}`);
});
