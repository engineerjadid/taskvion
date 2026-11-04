import { NextResponse } from 'next/server';
import { isAuthed, requestIsSameOrigin } from '../../../../lib/auth';
import { getMessages, saveMessages } from '../../../../lib/store';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401, headers });
  try { return NextResponse.json(await getMessages(), { headers }); }
  catch { return NextResponse.json({ ok: false, error: 'Messages are temporarily unavailable.' }, { status: 503, headers }); }
}
export async function PATCH(req) {
  if (!requestIsSameOrigin(req)) return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403, headers });
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401, headers });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400, headers }); }
  const { id, action } = body || {};
  if (typeof id !== 'string' || !/^[a-f0-9]{8,32}$/i.test(id) || !['delete', 'toggle-read'].includes(action)) return NextResponse.json({ ok: false, error: 'Invalid action.' }, { status: 400, headers });
  try {
    const messages = await getMessages();
    const updated = action === 'delete' ? messages.filter((item) => item.id !== id) : messages.map((item) => item.id === id ? { ...item, read: !item.read } : item);
    if (updated.length === messages.length && !messages.some((item) => item.id === id)) return NextResponse.json({ ok: false, error: 'Message not found.' }, { status: 404, headers });
    await saveMessages(updated);
    return NextResponse.json({ ok: true }, { headers });
  } catch { return NextResponse.json({ ok: false, error: 'Could not update messages.' }, { status: 503, headers }); }
}
