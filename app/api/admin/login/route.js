import { NextResponse } from 'next/server';
import { sign, sameStr, COOKIE } from '../../../../lib/auth';
import { redis } from '../../../../lib/store';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const u = process.env.ADMIN_USER, p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return NextResponse.json({ ok: false, error: 'ADMIN_USER / ADMIN_PASSWORD are not set in Vercel Environment Variables.' }, { status: 500 });
  const ip = (req.headers.get('x-forwarded-for') || 'x').split(',')[0].trim();
  try {
    const r = redis();
    if (!r) return NextResponse.json({ ok: false, error: 'Admin login is unavailable until Upstash Redis is connected.' }, { status: 503 });
    const trustedIp = req.headers.get('x-real-ip') || ip;
    const k = 'rl:login:' + trustedIp;
    const n = await r.incr(k);
    if (n === 1) await r.expire(k, 900);
    if (n > 8) return NextResponse.json({ ok: false, error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Admin login is temporarily unavailable. Please try again later.' }, { status: 503 });
  }
  let b = {}; try { b = await req.json(); } catch (e) {}
  const okU = sameStr(b.user || '', u), okP = sameStr(b.password || '', p);
  if (!(okU && okP)) return NextResponse.json({ ok: false, error: 'Wrong username or password.' }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('tv_admin', sign(Date.now() + COOKIE.maxAge * 1000), COOKIE);
  return res;
}
