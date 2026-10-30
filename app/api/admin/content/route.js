import { NextResponse } from 'next/server';
import { isAuthed } from '../../../../lib/auth';
import { getContent, saveContent } from '../../../../lib/store';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json(await getContent());
}
export async function PUT(req) {
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'Not logged in' }, { status: 401 });
  let d; try { d = await req.json(); } catch (e) { return NextResponse.json({ ok: false, error: 'Bad JSON' }, { status: 400 }); }
  if (!d || !d.settings || !d.theme || !d.hero || !d.services || !d.contact || !d.nav) return NextResponse.json({ ok: false, error: 'Invalid data' }, { status: 400 });
  try { await saveContent(d); revalidatePath('/'); } catch (e) { return NextResponse.json({ ok: false, error: e.message }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
