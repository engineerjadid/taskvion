import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getContent, getMessages, saveMessages, redis } from '../../../lib/store';
export const dynamic = 'force-dynamic';

const cut = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const responseHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
export async function POST(req) {
  const length = Number(req.headers.get('content-length') || 0);
  if (length > 12_000) return NextResponse.json({ ok: false, message: 'Message is too large.' }, { status: 413, headers: responseHeaders });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400, headers: responseHeaders }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400, headers: responseHeaders });
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true, message: 'Thank you!' }, { headers: responseHeaders });
  const name = cut(body.name, 100);
  const email = cut(body.email, 150).toLowerCase();
  const message = cut(body.message, 3000);
  const service = cut(body.service, 100);
  if (!name || !service || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: 'Please fill in your name, a valid email and service.' }, { status: 400, headers: responseHeaders });
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(name + email + service + message)) return NextResponse.json({ ok: false, message: 'Please remove unsupported characters.' }, { status: 400, headers: responseHeaders });

  // Fail closed: the contact endpoint already requires Redis to persist messages.
  try {
    const store = redis();
    if (!store) return NextResponse.json({ ok: false, message: 'The contact form is temporarily unavailable. Please email us directly.' }, { status: 503, headers: responseHeaders });
    const ip = req.headers.get('x-real-ip') || (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
    const key = `rl:msg:${ipHash}`;
    const count = await store.incr(key);
    if (count === 1) await store.expire(key, 600);
    if (count > 5) return NextResponse.json({ ok: false, message: 'Too many messages. Please try again later.' }, { status: 429, headers: responseHeaders });

    const messages = await getMessages();
    messages.unshift({ id: crypto.randomBytes(6).toString('hex'), ts: Math.floor(Date.now() / 1000), name, email, service, message, read: false });
    await saveMessages(messages.slice(0, 1000));
    const content = await getContent();
    return NextResponse.json({ ok: true, message: content.contact?.successMessage || 'Thank you! Your message has been received.' }, { headers: responseHeaders });
  } catch {
    return NextResponse.json({ ok: false, message: 'Could not save your message. Please email us directly.' }, { status: 503, headers: responseHeaders });
  }
}
