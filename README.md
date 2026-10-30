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
6. Open `https://your-site.vercel.app/admin` and log in.

Before step 3-5 the public site already shows default content, but admin save/upload will not work.
Custom domain: Project > Settings > Domains.
