import { NextResponse } from 'next/server';
import { getContent } from '../../../lib/store';
import { normalizeWork } from '../../../lib/workstatus';
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

// Public, read-only. Returns only the work-status section (no other site content).
export async function GET() {
  const c = await getContent();
  const w = normalizeWork(c.workStatus);
  if (!w.show) return NextResponse.json({ ok: true, show: false }, { headers });
  if (!w.showRevenue) w.items = w.items.map((x) => ({ ...x, revenue: 0, jobs: x.jobs.map((j) => ({ ...j, revenue: 0 })) }));
  return NextResponse.json({ ok: true, ...w }, { headers });
}
