import crypto from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'tv_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) return '';
  return value;
}

function mac(payload) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

export function sessionReady() {
  return Boolean(secret());
}

export function sign(expiresAt) {
  const payload = String(expiresAt);
  if (!secret()) throw new Error('SESSION_SECRET must be configured with at least 32 characters.');
  return `${payload}.${mac(payload)}`;
}

export function verify(token) {
  if (!token || !secret() || typeof token !== 'string') return false;
  const i = token.indexOf('.');
  if (i < 1) return false;
  const payload = token.slice(0, i);
  const signature = token.slice(i + 1);
  if (!/^\d{13}$/.test(payload) || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = mac(payload);
  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const expiry = Number(payload);
  return Number.isSafeInteger(expiry) && expiry > Date.now();
}

export function isAuthed() {
  const cookieStore = cookies();
  return verify(cookieStore.get(SESSION_COOKIE)?.value);
}

export function sameStr(a, b) {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

export function requestIsSameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // Non-browser clients may omit Origin; cookie SameSite remains strict.
  try {
    const parsed = new URL(origin);
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    return Boolean(host && parsed.host.toLowerCase() === host.toLowerCase());
  } catch {
    return false;
  }
}

export const COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
