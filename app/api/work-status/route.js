import { NextResponse } from 'next/server';
import { getContent } from '../../../lib/store';
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const num = (x) => (Number.isFinite(Number(x)) && Number(x) > 0 ? Math.floor(Number(x)) : 0);

// Public, read-only. Returns only the work-status section (no other site content).
export async function GET() {
  const c = await getContent();
  const w = c.workStatus || {};
  if (!w.show) return NextResponse.json({ ok: true, show: false }, { headers });
  return NextResponse.json({
    ok: true,
    show: true,
    updatedAt: String(w.updatedAt || ''),
    items: (Array.isArray(w.items) ? w.items : []).map((x) => ({
      name: String(x.name || ''), completed: num(x.completed), pending: num(x.pending), note: String(x.note || ''),
    })),
  }, { headers });
}
