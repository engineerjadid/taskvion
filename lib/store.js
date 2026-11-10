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
