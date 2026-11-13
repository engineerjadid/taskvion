import { NextResponse } from 'next/server';
import { isAuthed, requestIsSameOrigin } from '../../../../lib/auth';
import { getContent, saveContent, getContentHistory, scrubHistory } from '../../../../lib/store';
import { photoUrls, deleteBlobs } from '../../../../lib/blob';
import { validateContent } from '../../../../lib/validation';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

const privateHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'X-Content-Type-Options': 'nosniff' };
export async function GET(req) {
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401, headers: privateHeaders });
  if (new URL(req.url).searchParams.get('history') === '1') {
    try { return NextResponse.json(await getContentHistory(), { headers: privateHeaders }); }
    catch { return NextResponse.json({ ok: false, error: 'Could not load content history.' }, { status: 503, headers: privateHeaders }); }
  }
  try { return NextResponse.json(await getContent({ strict: true }), { headers: privateHeaders }); }
  catch { return NextResponse.json({ ok: false, error: 'Stored content is temporarily unavailable. Please retry; do not restore defaults.' }, { status: 503, headers: privateHeaders }); }
}
export async function PUT(req) {
  if (!requestIsSameOrigin(req)) return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403, headers: privateHeaders });
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401, headers: privateHeaders });
  const length = Number(req.headers.get('content-length') || 0);
  if (length > 1_000_000) return NextResponse.json({ ok: false, error: 'Content is too large.' }, { status: 413, headers: privateHeaders });
  let data;
  try { data = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400, headers: privateHeaders }); }
  let safe;
  try { safe = validateContent(data); }
  catch (error) { return NextResponse.json({ ok: false, error: error?.message || 'Invalid content.' }, { status: 400, headers: privateHeaders }); }
  try {
    let before = null;
    try { before = await getContent({ strict: true }); } catch { before = null; }
    await saveContent(safe);
    revalidatePath('/', 'layout');
    revalidatePath('/privacy');
    // Work Order photos that were removed in this save are deleted from Blob storage and from saved history.
    let deleted = 0, warning = '';
    if (before) {
      const keep = JSON.stringify(safe);
      const removed = new Set([...photoUrls(before)].filter((u) => !photoUrls(safe).has(u) && !keep.includes(u)));
      if (removed.size) {
        try { deleted = await deleteBlobs(removed); await scrubHistory(removed); }
        catch { warning = 'Saved, but some removed photos could not be deleted from storage.'; }
      }
    }
    return NextResponse.json({ ok: true, deleted, warning }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not save content to Redis. Your changes were not published.' }, { status: 503, headers: privateHeaders });
  }
}
