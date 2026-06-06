# FINAL LAUNCH CHECKLIST

## 1. Backend Deployment Checklist
- [ ] Node.js version 18+ verified on target server.
- [ ] Managed PostgreSQL database provisioned and connection string verified.
- [ ] `npm install --production` executes successfully.
- [ ] `index.js` boots cleanly without missing module errors.
- [ ] Application bound to correct internal `PORT`.

## 2. Frontend Deployment Checklist
- [ ] `npm run build` succeeds locally without Tailwind/Vite errors.
- [ ] `/dist` folder outputs correctly.
- [ ] Static hosting provider (e.g., Vercel, Cloudflare Pages) points build output to `/dist`.
- [ ] Client-side routing redirects all 404 traffic to `index.html` (Rewrite rule active).

## 3. Environment Variables Checklist
**Backend:**
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=postgres://...`
- [ ] `FRONTEND_URL=https://[YOUR-PRODUCTION-DASHBOARD-DOMAIN]` (Required for strict CORS).

**Frontend:**
- [ ] `VITE_API_BASE_URL=https://[YOUR-PRODUCTION-BACKEND-DOMAIN]/api/v1`

## 4. PostgreSQL Migration Checklist
- [ ] Database connected via CLI or GUI.
- [ ] `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` executed manually if required by host.
- [ ] Run `node src/db/runMigrations.js` in production environment.
- [ ] Verify `schema_migrations` table lists all 5 migrations.
- [ ] Verify `deleted_at` column exists on `users`, `members`, and `leads` (Soft delete safe).

## 5. Domain Configuration Checklist
- [ ] Main domain (e.g., `gymos.in`) mapped to Public Theme 1 Frontend.
- [ ] Dashboard subdomain (e.g., `app.gymos.in`) mapped to Staff React App.
- [ ] API subdomain (e.g., `api.gymos.in`) mapped to Express Backend.
- [ ] SSL/TLS certificates active on all three domains.

## 6. Vercel Deployment Checklist (If using Vercel for Frontend)
- [ ] Build Command set to `npm run build`.
- [ ] Output Directory set to `dist`.
- [ ] Add `vercel.json` to the frontend root to enforce React Router rewrites:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

## 7. Public Lead API Checklist
- [ ] Verify `POST https://api.gymos.in/api/v1/public/leads` is exposed.
- [ ] Test form submission on public website.
- [ ] Verify the request sends `X-Gym-Public-Key`.
- [ ] Verify the lead appears in the `leads` database table with `source = 'WEBSITE'`.

## 8. Security Verification Checklist
- [ ] Verify `HttpOnly`, `Secure`, and `SameSite=strict` are active on the `sessionId` cookie (requires HTTPS).
- [ ] Attempt to access `/api/v1/members` with an invalid token. Confirm `401 Unauthorized`.
- [ ] Attempt to hit the public lead API 10 times rapidly. Confirm `429 Too Many Requests` (Rate limit active).
- [ ] Attempt to use a `RECEPTION` account to `VOID` a payment. Confirm `403 Forbidden`.

## 9. Mobile Testing Checklist
- [ ] Open Public Theme 1 on iOS Safari and Chrome Android.
- [ ] Verify WhatsApp FAB sits above the footer but below the navbar.
- [ ] Verify WhatsApp button opens native WhatsApp app.
- [ ] Verify "Trainers" horizontal scroll works smoothly without breaking vertical layout.
- [ ] Verify Staff Dashboard "Check In" UI is legible on a 320px wide screen.

## 10. First Gym Onboarding Checklist
- [ ] Run `node src/utils/bootstrap.js` in production (Do this ONCE).
- [ ] Log in as Platform Admin (`admin@gymos.in`).
- [ ] Create the real first Gym manually via DB or Admin API.
- [ ] Create the first `OWNER` account for that gym.
- [ ] Provide the Owner with their login credentials and the Dashboard URL.
