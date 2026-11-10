import { del } from '@vercel/blob';

// Work Order photo helpers: find which uploaded images a content object uses and delete the ones that were removed.
const arr = (x) => (Array.isArray(x) ? x : []);

export function photoUrls(content) {
  const out = new Set();
  const types = content && content.workOrders && content.workOrders.types;
  for (const t of arr(types)) for (const p of arr(t && t.photos)) if (p && typeof p.image === 'string' && p.image) out.add(p.image);
  return out;
}

// Only files uploaded through the Admin (Vercel Blob, /uploads/...) may ever be deleted.
export function isOwnBlob(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && u.hostname.endsWith('.public.blob.vercel-storage.com') && u.pathname.startsWith('/uploads/');
  } catch { return false; }
}

export async function deleteBlobs(urls) {
  const list = [...urls].filter(isOwnBlob);
  if (!list.length) return 0;
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Vercel Blob is not connected.');
  await del(list);
  return list.length;
}
