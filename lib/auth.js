import crypto from 'crypto';
import { cookies } from 'next/headers';

const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
const mac = (p) => crypto.createHmac('sha256', secret()).update(p).digest('hex');
export function sign(exp) { const p = String(exp); return p + '.' + mac(p); }
export function verify(tok) {
  if (!tok || !secret()) return false;
  const i = tok.indexOf('.'); if (i < 1) return false;
  const p = tok.slice(0, i), h = tok.slice(i + 1), x = mac(p);
  if (h.length !== x.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(h), Buffer.from(x))) return false;
  return Number(p) > Date.now();
}
export function isAuthed() { const c = cookies().get('tv_admin'); return verify(c && c.value); }
export function sameStr(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}
export const COOKIE = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 60 * 60 * 24 * 7 };
