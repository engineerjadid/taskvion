import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAuthed } from '../../../../lib/auth';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Not logged in' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ ok: false, error: 'Vercel Blob is not connected (Storage tab).' }, { status: 500 });
  try {
    const f = (await req.formData()).get('file');
    if (!f || typeof f === 'string') return NextResponse.json({ ok: false, error: 'No file' }, { status: 400 });
    if (!/^image\/(png|jpeg|webp|gif|x-icon|vnd\.microsoft\.icon)$/.test(f.type)) return NextResponse.json({ ok: false, error: 'Only png, jpg, webp, gif, ico allowed' }, { status: 400 });
    if (f.size > 4 * 1024 * 1024) return NextResponse.json({ ok: false, error: 'Max 4 MB' }, { status: 400 });
    const safe = (f.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
    const b = await put('uploads/' + safe, f, { access: 'public', addRandomSuffix: true });
    return NextResponse.json({ ok: true, path: b.url });
  } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); }
}
