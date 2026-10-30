import { Redis } from '@upstash/redis';
import defaults from '../data/content.json';

let _r = null;
export function redis() {
  if (_r) return _r;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  _r = new Redis({ url, token });
  return _r;
}
export async function getContent() {
  try {
    const r = redis();
    if (r) { const c = await r.get('site:content'); if (c && typeof c === 'object') return c; }
  } catch (e) {}
  return defaults;
}
export async function saveContent(c) {
  const r = redis();
  if (!r) throw new Error('Redis is not connected. Add Upstash Redis in Vercel Storage.');
  await r.set('site:content', c);
}
export async function getMessages() {
  try { const r = redis(); if (!r) return []; const m = await r.get('site:messages'); return Array.isArray(m) ? m : []; } catch (e) { return []; }
}
export async function saveMessages(m) {
  const r = redis();
  if (!r) throw new Error('Redis is not connected.');
  await r.set('site:messages', m.slice(0, 1000));
}
