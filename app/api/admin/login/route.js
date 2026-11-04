import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sign, sameStr, COOKIE, sessionReady, requestIsSameOrigin } from '../../../../lib/auth';
import { redis } from '../../../../lib/store';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!requestIsSameOrigin(req)) return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return NextResponse.json({ ok: false, error: 'Admin credentials are not configured.' }, { status: 503 });
  if (!sessionReady()) return NextResponse.json({ ok: false, error: 'Set SESSION_SECRET to a random value of at least 32 characters in Vercel.' }, { status: 503 });
  let body;
  try {
    if (Number(req.headers.get('content-length') || 0) > 4000) return NextResponse.json({ ok: false, error: 'Request is too large.' }, { status: 413 });
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }
  if (!body || typeof body.user !== 'string' || typeof body.password !== 'string' || body.user.length > 200 || body.password.length > 500) {
    return NextResponse.json({ ok: false, error: 'Enter a valid username and password.' }, { status: 400 });
  }
  const ip = req.headers.get('x-real-ip') || (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const ipKey = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
  try {
    const r = redis();
    if (!r) return NextResponse.json({ ok: false, error: 'Admin login is unavailable until Redis is connected.' }, { status: 503 });
    const key = `rl:login:${ipKey}`;
    await r.set(key, 0, { ex: 900, nx: true });
    const attempts = await r.incr(key);
    if (attempts > 8) return NextResponse.json({ ok: false, error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  } catch {
    return NextResponse.json({ ok: false, error: 'Login protection is temporarily unavailable. Please try again later.' }, { status: 503 });
  }
  const userOk = sameStr(body.user, username);
  const passOk = sameStr(body.password, password);
  if (!(userOk && passOk)) return NextResponse.json({ ok: false, error: 'Wrong username or password.' }, { status: 401 });
  try { await redis().del(`rl:login:${ipKey}`); } catch {}
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set('tv_admin', sign(Date.now() + COOKIE.maxAge * 1000), COOKIE);
  return response;
}
