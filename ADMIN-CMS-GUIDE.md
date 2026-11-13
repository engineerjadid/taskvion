# Taskvion Admin CMS — Operations & Safety

## Required Vercel environment variables

Set these for Production (and Preview only if you intentionally test the Admin there):

- `ADMIN_USER`: a non-obvious administrator username.
- `ADMIN_PASSWORD`: a unique, strong password. Do not reuse an email or hosting password.
- `SESSION_SECRET`: at least 32 characters; generate a random value with `openssl rand -base64 48`.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`: required for CMS persistence, messages and login/contact rate limiting.
- `BLOB_READ_WRITE_TOKEN`: required only for Admin image uploads.
- `NEXT_PUBLIC_SITE_URL=https://www.taskvionit.com`.

After changing environment variables, redeploy the project. Keep these values out of GitHub and never paste them into the public website.

## Admin use

1. Open `https://www.taskvionit.com/admin`.
2. Edit the relevant content section and check the page for unsaved changes.
3. Download a JSON backup before large content changes.
4. Save to publish. The server validates content against the site's JSON structure.
5. Use Version history to load one of the last 10 saved versions into the editor. Review it, then click Save to publish it.
6. Use Restore JSON to load a previously downloaded backup into the editor. Review it before saving.
7. Uploaded images are public website assets. Do not upload private documents, IDs or confidential client files. Work Order photos are shown publicly: before uploading, make sure addresses, house numbers, faces and licence plates are not visible and that your client agreements allow publishing the photos.

## Work Orders (hero side card)

- Open Admin → **Work Orders**. Each entry under `types` is one work type (Grass Cut, Winterization, Re-secure, Snow Remove, Junk Remove, Lawn Remove by default).
- **Add a type:** `+ Add item`, then fill in the name (and an optional short description). **Remove a type:** `Remove` on that entry.
- **Add photos:** inside a type, use *Add photos* (several can be selected at once; large phone photos are resized automatically). Captions are optional; use ◀ ▶ to reorder.
- **Delete a photo:** press `Delete` on the photo, then **Save all changes**. On save the image is deleted from Vercel Blob storage and removed from the saved content and the saved version history, so it no longer exists anywhere. Photos removed before saving (never published) are deleted immediately.
- Because deleted photos are scrubbed from version history, restoring an older version will not bring deleted photos back.
- Use the `show` checkbox to hide the whole card. The old hero side card (`hero.panel`) is retired; existing stored values are dropped automatically on the next save.

## Data notes

- `data/content.json` remains the fallback/default content and its existing structure is retained.
- Existing Redis key `site:content` remains in use. Previous versions are stored separately under `site:content:history`.
- Existing Redis key `site:messages` remains in use.
- The application does not automatically delete or migrate existing content or messages.
- If Redis is unavailable, Admin content reads and writes fail safely; reconnect Redis and retry rather than restoring defaults over live content.

## Security notes

- Admin sessions use an HTTP-only, SameSite=Strict cookie and expire after 8 hours.
- Admin login requires Redis-backed rate limiting and a configured session secret.
- Admin write endpoints check the request origin and authentication.
- Image uploads verify the file signature and accept PNG, JPEG, WEBP, GIF and ICO up to 4 MB. SVG is not accepted.
- Contact submissions are rate-limited. If Redis is unavailable, the form returns a temporary error instead of accepting unprotected traffic.
- Regularly review and remove old contact messages from the Admin inbox according to your retention policy.

## Deployment checklist

- Confirm the Vercel Production environment has all required variables.
- Confirm Upstash Redis and Vercel Blob are connected to the same Vercel project.
- Deploy, then test Admin login, content save, JSON backup, version history, message read/delete, contact submission and image upload.
- Verify `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/site.webmanifest` and `/apple-touch-icon.png`.
