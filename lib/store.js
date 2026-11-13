import { Redis } from '@upstash/redis';
import defaults from '../data/content.json';
import { deepMerge, normalizeLegacy, validateContent } from './validation';

let _r = null;
export function redis() {
  if (_r) return _r;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  _r = new Redis({ url, token });
  return _r;
}

export async function getContent(options = {}) {
  const r = redis();
  if (!r) return defaults;
  try {
    const stored = await r.get('site:content');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) return normalizeLegacy(deepMerge(defaults, stored));
    return defaults;
  } catch (error) {
    console.error('Content read failed:', error?.message || 'unknown error');
    if (options.strict) throw new Error('Stored website content is temporarily unavailable. No changes were made.');
    return defaults;
  }
}

export async function saveContent(content) {
  const r = redis();
  if (!r) throw new Error('Redis is not connected. Add Upstash Redis in Vercel Storage.');
  const safeContent = validateContent(content);
  const previous = await r.get('site:content');
  if (previous && typeof previous === 'object') {
    await r.lpush('site:content:history', JSON.stringify({ savedAt: new Date().toISOString(), content: previous }));
    await r.ltrim('site:content:history', 0, 9);
  }
  await r.set('site:content', safeContent);
}

export async function getContentHistory() {
  const r = redis();
  if (!r) throw new Error('Redis is not connected.');
  const rows = await r.lrange('site:content:history', 0, 9);
  return (rows || []).map((row) => {
    if (typeof row === 'string') { try { return JSON.parse(row); } catch { return null; } }
    return row;
  }).filter((row) => row && row.savedAt && row.content);
}

export async function getMessages() {
  const r = redis();
  if (!r) throw new Error('Redis is not connected.');
  const messages = await r.get('site:messages');
  return Array.isArray(messages) ? messages : [];
}

export async function saveMessages(messages) {
  const r = redis();
  if (!r) throw new Error('Redis is not connected.');
  if (!Array.isArray(messages) || messages.length > 1000) throw new Error('Invalid message collection.');
  await r.set('site:messages', messages);
}

// Remove deleted photos from the saved version history too, so no reference to a deleted image stays in the database.
export async function scrubHistory(removed) {
  const r = redis();
  if (!r || !removed || !removed.size) return;
  const rows = await r.lrange('site:content:history', 0, 9);
  for (let i = 0; i < (rows || []).length; i++) {
    let row = rows[i];
    if (typeof row === 'string') { try { row = JSON.parse(row); } catch { continue; } }
    const types = row && row.content && row.content.workOrders && row.content.workOrders.types;
    if (!Array.isArray(types)) continue;
    let changed = false;
    for (const t of types) {
      if (!t || !Array.isArray(t.photos)) continue;
      const kept = t.photos.filter((p) => !(p && removed.has(p.image)));
      if (kept.length !== t.photos.length) { t.photos = kept; changed = true; }
    }
    if (changed) await r.lset('site:content:history', i, JSON.stringify(row));
  }
}
