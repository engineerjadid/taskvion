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
7. Uploaded images are public website assets. Do not upload private documents, customer property photos, IDs or confidential client files.

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
