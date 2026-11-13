import { NextResponse } from 'next/server';
import { isAuthed } from '../../../../lib/auth';
import { redis } from '../../../../lib/store';
export const dynamic = 'force-dynamic';

// Tells the Admin whether storage is connected (never returns secret values).
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  let redisOk = false;
  try { const r = redis(); if (r) { await r.get('site:content'); redisOk = true; } } catch { redisOk = false; }
  return NextResponse.json({ ok: true, redis: redisOk, blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN) }, { headers: { 'Cache-Control': 'no-store' } });
}
