# GYMOS V1 Deployment Guide

This document outlines the strict deployment process for moving the GYMOS V1 Monolith into a production environment.

## Infrastructure Requirements
*   **Database:** Managed PostgreSQL instance (e.g., Render, Railway, AWS RDS). Must support UUID generation (`uuid-ossp`).
*   **Backend:** Node.js PaaS instance (Node v18+).
*   **Frontend:** Static Hosting (e.g., Cloudflare Pages, Vercel, Netlify).

## 1. Database Setup
1. Provision a PostgreSQL 15+ database.
2. Obtain the connection string (`DATABASE_URL`).
3. Set up automated daily snapshots/backups via your DB provider (critical for ledger safety).

## 2. Backend Deployment
1. Set the following Environment Variables in your hosting dashboard:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgres://user:pass@host:port/dbname`
   - `FRONTEND_URL=https://your-production-domain.com` (Required for strict CORS/Cookie safety)
2. **Build Command:** `npm install`
3. **Pre-start Command (Migrations):** `node src/db/runMigrations.js`
4. **Pre-start Command (Bootstrap - Optional):** `node src/utils/bootstrap.js` (Run only once to generate Platform Admin).
5. **Start Command:** `node index.js`

## 3. Frontend Deployment
1. Set the following Environment Variable in your hosting dashboard:
   - `VITE_API_BASE_URL=https://your-backend-api.com/api/v1`
2. **Build Command:** `npm install && npm run build`
3. **Publish Directory:** The `/dist` folder.
4. **Routing:** Ensure your static host is configured to rewrite all 404 traffic back to `index.html` (React Router SPA requirement).

## Security Verification (Post-Deploy)
*   Attempt to access the backend API from a domain *other* than the `FRONTEND_URL`. It must be rejected by CORS.
*   Log in successfully and inspect your browser cookies. The `sessionId` cookie must have `Secure` and `HttpOnly` flags active.