# TaskVion Website (Next.js + Vercel)

## Deploy steps
1. Create a new GitHub repo and push this folder (or drag the folder into Vercel via CLI).
2. Vercel > Add New > Project > import the repo > Deploy.
3. In the Vercel project open the **Storage** tab:
   - Create **Upstash Redis** (Marketplace) and connect it to the project (stores content + messages).
   - Create **Blob** and connect it (stores uploaded images).
4. Project > Settings > **Environment Variables**, add:
   - `ADMIN_USER` = your admin username
   - `ADMIN_PASSWORD` = a long strong password
   - `SESSION_SECRET` = a cryptographically random secret of at least 32 characters (generate with `openssl rand -base64 48`)
5. **Redeploy** (Deployments > ... > Redeploy).
6. Open `https://www.taskvionit.com/admin` and log in.

Before step 3-5 the public site already shows default content, but admin save/upload will not work.
Custom domain: Project > Settings > Domains. Add `www.taskvionit.com` and set it as the primary domain. Configure `taskvionit.com` to redirect permanently (301) to `www.taskvionit.com` in Vercel Domains.

## SEO configuration
- Set `NEXT_PUBLIC_SITE_URL=https://www.taskvionit.com` in Vercel Project Settings → Environment Variables for the Production environment. The code fallback also uses this canonical origin.
- The App Router automatically serves `/robots.txt` and `/sitemap.xml`.
- After deploying, submit `https://www.taskvionit.com/sitemap.xml` in Google Search Console.
- Replace the example contact email and WhatsApp number in Admin → Settings before publishing campaigns.


## Phase 3 — Technical SEO deployment checklist

1. In Vercel → Project → Settings → Environment Variables, set `NEXT_PUBLIC_SITE_URL` to `https://www.taskvionit.com` for Production, then redeploy.
2. After deployment, open `https://www.taskvionit.com/robots.txt`, `/sitemap.xml`, `/opengraph-image`, and `/privacy` and confirm they return successfully.
3. In Google Search Console, inspect `https://www.taskvionit.com/` and the privacy page, run Live Test, then request indexing. Submit `https://www.taskvionit.com/sitemap.xml`.
4. Verify the canonical URL shown in the rendered HTML is `https://www.taskvionit.com/` and that the non-www domain redirects to the www version.
5. Test the homepage URL with Google Rich Results Test and Schema Markup Validator. FAQ rich results are not guaranteed to display; the FAQ schema is included to describe visible page content.
6. Add a real social profile URL and business contact details in Admin only when those details are public and correct. Do not add fabricated reviews, client logos, certifications, U.S. office addresses or performance guarantees.

The default canonical origin is `https://www.taskvionit.com`. Preview deployments should not be submitted to Search Console as the canonical site.

## Admin CMS and data safety updates
- Admin login requires `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET` (32+ characters), and Upstash Redis.
- Contact messages and content are stored in Upstash Redis. Back up the content from Admin before major edits.
- Admin now supports JSON backup download, JSON restore into the editor, and up to 10 saved content versions. Restoring a version loads it into the editor first; click Save to publish.
- If Redis is temporarily unavailable, the Admin content endpoint fails closed instead of silently presenting defaults for editing.
- Image uploads accept PNG, JPEG, WEBP, GIF and ICO files up to 4 MB and verify file signatures before upload. SVG uploads are intentionally disabled.
- Keep all environment secrets in Vercel Environment Variables; never commit `.env.local` or production tokens.

## Phase 4.1 — review fixes
- Admin no longer opens the editor when stored content fails to load (prevented accidental reset to defaults); server also rejects payloads missing core sections.
- Link allowlist (http/https, mailto, tel, #, relative), `mailto:` reply link encoded, stricter contact email check, contact `service` must match a configured option.
- Rate-limit keys are created with a TTL atomically; successful admin login clears the counter.
- Added `.gitignore`, Content-Security-Policy, `X-Frame-Options: DENY`.
- Content save revalidates the layout and `/privacy`.

## Work Orders section (hero side card)
- Replaces the old workflow card. Work types and their completed-job photos are managed in Admin → Work Orders (see `ADMIN-CMS-GUIDE.md`).
- Visitors click a work type to see its photo gallery, then click a photo for a large view (keyboard arrows and Esc work).
- Removing a photo/type and saving deletes the image from Vercel Blob and from the stored content and version history. Requires `BLOB_READ_WRITE_TOKEN` (already needed for uploads).

## Animations
- Hero entrance, scroll fade-in, hero stat count-up, button shine and card glow. Styles are at the end of `app/globals.css`; scroll/counter logic is in `lib/motion.js` (started by `components/MotionEffects.js`).
- All motion is skipped for visitors who enable "reduce motion" in their device settings.
- To stop the count-up for a stat, keep its value non-numeric or below 2 (for example `QC`).
