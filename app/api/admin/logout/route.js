import { NextResponse } from 'next/server';
import { requestIsSameOrigin } from '../../../../lib/auth';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  if (!requestIsSameOrigin(req)) return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set('tv_admin', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0 });
  return response;
}
