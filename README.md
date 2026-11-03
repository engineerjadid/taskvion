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
   - `SESSION_SECRET` = any long random text (30+ characters)
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
