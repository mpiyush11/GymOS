# GO LIVE RUNBOOK

## PURPOSE
This runbook dictates the exact chronological steps required to deploy GYMOS V1 to production, onboard the first paying gym, and safely recover from catastrophic failure.

---

## 1. EXACT LAUNCH ORDER

**Step 1: Database Provisioning**
1. Spin up Managed PostgreSQL.
2. Note the `DATABASE_URL`.

**Step 2: Backend Deployment**
1. Deploy the Express Server repo to PaaS (e.g., Render/Railway).
2. Set Environment Variables (`DATABASE_URL`, `NODE_ENV=production`).
3. Deploy. Wait for health check to pass.

**Step 3: Database Bootstrap**
1. Access the production backend shell/console.
2. Run `node src/db/runMigrations.js`
3. Run `node src/utils/bootstrap.js`

**Step 4: Frontend Deployment**
1. Deploy the React Client repo to Vercel/Netlify.
2. Set `VITE_API_BASE_URL` to the live backend URL.
3. Deploy.

**Step 5: E2E Smoke Test**
1. Navigate to the live frontend URL.
2. Log in with the bootstrap credentials (`admin@gymos.in` / `Admin@123`).
3. Verify successful login and cookie issuance.
4. Log out.

---

## 2. ROLLBACK PROCEDURE
*In the event of a catastrophic production failure immediately after launch:*

1. **Backend Code Rollback:** Use your PaaS provider's "Rollback to previous deploy" button. Do NOT attempt hot-fixing code directly on the production server.
2. **Database Rollback:** If a migration corrupts the schema, use the Managed Database provider's Point-In-Time-Recovery (PITR) to restore the DB to exactly 5 minutes before the migration script was run.
3. **Frontend Rollback:** Vercel/Netlify support instant 1-click rollbacks to previous stable builds.

---

## 3. BACKUP PROCEDURE
1. **Automated:** Ensure the PostgreSQL provider has automated daily snapshots enabled with a minimum 7-day retention period.
2. **Manual (Ledger Export):** As the Platform Admin, perform a weekly manual CSV export of the `payments` and `audit_logs` tables using `pg_dump` and store them in secure cold storage.

---

## 4. FIRST CUSTOMER ONBOARDING PROCESS
1. **Gym Creation:** The Platform Admin connects to the DB and `INSERT`s the new gym into the `gyms` table, setting `status = 'ACTIVE'` and `subscription_end_date` 1 year in the future.
2. **Owner Creation:** Admin creates the `users` record with `role = 'OWNER'` and links it to the newly created `gym_id`. (Use `bcrypt` to manually generate their initial password).
3. **Public Key Generation:** Generate a custom `public_site_key` (e.g., `gpk_ironparadise1`) and securely hand this to the theme developer building their public website.
4. **Handoff:** Admin sends the Dashboard URL, Email, and Password to the Gym Owner via WhatsApp.
5. **Onboarding Call:** Admin walks the owner through creating their first 5 Members and logging their first Payment.

---

## 5. POST-LAUNCH MONITORING PROCESS
1. **First 24 Hours:** Monitor the backend PaaS logs constantly. Watch for `ECONNREFUSED` or PostgreSQL connection pool exhaustion (`Timeout exceeded`).
2. **First Payment:** When the owner records their first real payment, check the `payments` table manually to ensure `status = 'SUCCESS'` and `idempotency_key` fired correctly. Check `audit_logs` to ensure the payment creation was recorded immutably.
3. **Midnight UTC Boundary:** Monitor the Dashboard Revenue numbers when crossing the midnight UTC boundary to ensure the `Asia/Kolkata` timezone logic holds firm and revenue doesn't temporarily disappear into the wrong month.