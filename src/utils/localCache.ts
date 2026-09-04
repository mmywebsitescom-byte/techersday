// --- Local Storage Cache Utility ---------------------------------------------
// Saves Supabase data locally so repeat visits within 30 min load instantly.
// -----------------------------------------------------------------------------

const CACHE_VERSION = 'v3_locked';

export const CACHE_KEYS = {
  teachers: `tday_${CACHE_VERSION}_teachers`,
  departments: `tday_${CACHE_VERSION}_departments`,
  gallery: `tday_${CACHE_VERSION}_gallery`,
  rsvps: `tday_${CACHE_VERSION}_rsvps`,
  event: `tday_${CACHE_VERSION}_event`,
  settings: `tday_${CACHE_VERSION}_settings`,
  lastFetch: `tday_${CACHE_VERSION}_lastFetch`,
} as const;

const TTL_PUBLIC = 30 * 60 * 1000; // 30 minutes
const TTL_ADMIN = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function cacheSet<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (e) {
    console.warn('[Cache] Failed to write to localStorage:', e);
  }
}

export function cacheGet<T>(key: string, ttl: number = TTL_PUBLIC): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch (e) {
    return null;
  }
}

export function cacheDelete(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (_) {}
}

export function cacheClearAll(): void {
  try {
    Object.values(CACHE_KEYS).forEach((key) => localStorage.removeItem(key));
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('tday_')) localStorage.removeItem(key);
    });
  } catch (_) {}
}

export function cacheSnapshot(data: {
  teachers?: unknown;
  departments?: unknown;
  gallery?: unknown;
  rsvps?: unknown;
  event?: unknown;
  settings?: unknown;
}): void {
  if (data.teachers !== undefined) cacheSet(CACHE_KEYS.teachers, data.teachers);
  if (data.departments !== undefined) cacheSet(CACHE_KEYS.departments, data.departments);
  if (data.gallery !== undefined) cacheSet(CACHE_KEYS.gallery, data.gallery);
  if (data.rsvps !== undefined) cacheSet(CACHE_KEYS.rsvps, data.rsvps);
  if (data.event !== undefined) cacheSet(CACHE_KEYS.event, data.event);
  if (data.settings !== undefined) cacheSet(CACHE_KEYS.settings, data.settings);
  cacheSet(CACHE_KEYS.lastFetch, Date.now());
}

export function isCacheFresh(): boolean {
  try {
    const raw = localStorage.getItem(CACHE_KEYS.lastFetch);
    if (!raw) return false;
    const entry: CacheEntry<number> = JSON.parse(raw);
    return Date.now() - entry.timestamp < TTL_PUBLIC;
  } catch (_) {
    return false;
  }
}

export const CACHE_TTL = { PUBLIC: TTL_PUBLIC, ADMIN: TTL_ADMIN };
