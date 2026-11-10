import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { isAuthed, requestIsSameOrigin } from '../../../../lib/auth';
import { getContent, saveContent, getContentHistory } from '../../../../lib/store';
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
    // Compare committed portfolio image URLs before saving. Removed images are
    // deleted from Vercel Blob only after the new content has been stored.
    const previous = await getContent({ strict: true });
    const collectPortfolioImages = (content) => {
      const urls = new Set();
      for (const category of (content?.workOrders?.categories || [])) {
        if (typeof category?.photoCover === 'string' && category.photoCover) urls.add(category.photoCover);
        for (const photo of (category?.photos || [])) if (typeof photo?.image === 'string' && photo.image) urls.add(photo.image);
      }
      return urls;
    };
    const oldImages = collectPortfolioImages(previous);
    const newImages = collectPortfolioImages(safe);
    const stillReferenced = (value, target) => {
      if (typeof value === 'string') return value === target;
      if (Array.isArray(value)) return value.some((item) => stillReferenced(item, target));
      if (value && typeof value === 'object') return Object.values(value).some((item) => stillReferenced(item, target));
      return false;
    };
    await saveContent(safe);
    const removedImages = [...oldImages].filter((url) => !newImages.has(url) && !stillReferenced(safe, url) && /^https:\/\/[^/]*\.blob\.vercel-storage\.com\//i.test(url));
    if (removedImages.length && process.env.BLOB_READ_WRITE_TOKEN) {
      try { await del(removedImages, { token: process.env.BLOB_READ_WRITE_TOKEN }); }
      catch (error) { console.error('Removed portfolio image cleanup failed:', error?.message || 'unknown error'); }
    }
    revalidatePath('/', 'layout');
    revalidatePath('/privacy');
    return NextResponse.json({ ok: true, deletedPortfolioImages: removedImages.length }, { headers: privateHeaders });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not save content to Redis. Your changes were not published.' }, { status: 503, headers: privateHeaders });
  }
}
