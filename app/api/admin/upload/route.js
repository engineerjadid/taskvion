import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { put } from '@vercel/blob';
import { getContent } from '../../../../lib/store';
import { isOwnBlob, deleteBlobs } from '../../../../lib/blob';
import { isAuthed, requestIsSameOrigin } from '../../../../lib/auth';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function detectImage(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6))) return 'image/gif';
  if (bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) return 'image/x-icon';
  return null;
}

export async function POST(req) {
  if (!requestIsSameOrigin(req)) return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ ok: false, error: 'Vercel Blob is not connected.' }, { status: 503 });
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') return NextResponse.json({ ok: false, error: 'Choose an image file.' }, { status: 400 });
    if (file.size < 1 || file.size > 4 * 1024 * 1024) return NextResponse.json({ ok: false, error: 'Image must be between 1 byte and 4 MB.' }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const contentType = await detectImage(bytes);
    if (!contentType) return NextResponse.json({ ok: false, error: 'Unsupported or invalid image file. Use PNG, JPG, WEBP, GIF or ICO.' }, { status: 415 });
    const ext = ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/x-icon': 'ico' })[contentType];
    const blob = await put(`uploads/${cryptoRandomName()}.${ext}`, new Blob([bytes], { type: contentType }), { access: 'public', addRandomSuffix: true, contentType, cacheControlMaxAge: 31536000 });
    return NextResponse.json({ ok: true, path: blob.url }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false, error: 'Image upload failed. Please try again.' }, { status: 500 });
  }
}
// Deletes an uploaded image that was never saved to the website (for example a photo removed before clicking Save).
// Images used by the live website content are refused.
export async function DELETE(req) {
  if (!requestIsSameOrigin(req)) return NextResponse.json({ ok: false, error: 'Invalid request origin.' }, { status: 403 });
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Not logged in.' }, { status: 401 });
  try {
    const { url } = await req.json();
    if (typeof url !== 'string' || !isOwnBlob(url)) return NextResponse.json({ ok: false, error: 'Invalid image.' }, { status: 400 });
    const live = JSON.stringify(await getContent({ strict: true }));
    if (live.includes(url)) return NextResponse.json({ ok: false, error: 'Image is in use.' }, { status: 409 });
    await deleteBlobs([url]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not delete image.' }, { status: 500 });
  }
}
function cryptoRandomName() {
  return crypto.randomBytes(16).toString('hex');
}
