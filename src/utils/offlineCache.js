// Lightweight offline cache for last successful forecasts per city.
// Storage: localStorage; consider upgrading to IndexedDB for larger payloads.

const PREFIX = 'weather-cache:v1:';

export function cacheKey(type, id) {
  return `${PREFIX}${type}:${id}`; // e.g., forecast:London
}

export function putCache(type, id, payload) {
  try {
    const record = { ts: Date.now(), payload };
    localStorage.setItem(cacheKey(type, id), JSON.stringify(record));
    return true;
  } catch (e) {
    console.warn('offlineCache put failed', e);
    return false;
  }
}

export function getCache(type, id) {
  try {
    const raw = localStorage.getItem(cacheKey(type, id));
    if (!raw) return null;
    const record = JSON.parse(raw);
    return record || null;
  } catch (e) {
    console.warn('offlineCache get failed', e);
    return null;
  }
}

export function clearCache(type, id) {
  try {
    localStorage.removeItem(cacheKey(type, id));
  } catch {}
}
