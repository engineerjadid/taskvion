import { NextResponse } from 'next/server';
import { isAuthed } from '../../../../lib/auth';
import { getMessages, saveMessages } from '../../../../lib/store';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json(await getMessages());
}
export async function PATCH(req) {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  let body;
  try { body = await req.json(); } catch (e) { return NextResponse.json({ ok: false, error: 'Bad JSON' }, { status: 400 }); }
  const { id, action } = body || {};
  if (typeof id !== 'string' || !id || !['delete', 'toggle-read'].includes(action)) return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  let m = await getMessages();
  m = action === 'delete' ? m.filter((x) => x.id !== id) : m.map((x) => (x.id === id ? { ...x, read: !x.read } : x));
  try { await saveMessages(m); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
