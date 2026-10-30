import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getContent, getMessages, saveMessages, redis } from '../../../lib/store';
export const dynamic = 'force-dynamic';

const cut = (s, n) => String(s || '').trim().slice(0, n);
export async function POST(req) {
  let b; try { b = await req.json(); } catch (e) { return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 }); }
  if (b.website) return NextResponse.json({ ok: true, message: 'Thank you!' });
  const name = cut(b.name, 100), email = cut(b.email, 150), message = cut(b.message, 3000), service = cut(b.service, 100);
  if (!name || !service || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, message: 'Please fill in name, a valid email and service.' }, { status: 400 });
  const ip = (req.headers.get('x-forwarded-for') || 'x').split(',')[0].trim();
  try {
    const r = redis();
    if (r) { const k = 'rl:msg:' + ip; const n = await r.incr(k); if (n === 1) await r.expire(k, 600); if (n > 5) return NextResponse.json({ ok: false, message: 'Too many messages. Please try later.' }, { status: 429 }); }
  } catch (e) {}
  const c = await getContent();
  try {
    const m = await getMessages();
    m.unshift({ id: crypto.randomBytes(6).toString('hex'), ts: Math.floor(Date.now() / 1000), name, email, service, message, read: false });
    await saveMessages(m);
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'Could not save your message. Please email us directly.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: (c.contact && c.contact.successMessage) || 'Thank you!' });
}
