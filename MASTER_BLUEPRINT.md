# GYMOS MASTER BLUEPRINT

## 1. Product Vision
GYMOS is a robust, reliable, and commercially safe SaaS platform designed specifically for small to medium gyms and local fitness centers in Tier-2 and Tier-3 cities in India. The focus is on operational stability, strict data isolation, and simplicity over feature bloat.

## 2. Target Customer
* Small gyms
* Medium gyms
* Local fitness centers
* Primarily operating in Tier-2/Tier-3 Indian markets.

## 3. Business Model
B2B SaaS. Gym owners pay a subscription fee to use the platform to manage their gyms. 
**Crucial Distinction:** Platform subscription payments from Gym Owners to GYMOS are **MANUAL** (UPI, Bank Transfer, Cash).

## 4. V1 Feature Freeze (Scope Lock)

### BUCKET A — MUST BUILD (Launch Critical)
* Authentication (Owner, Manager, Reception, Platform Admin)
* RBAC (Role-Based Access Control) enforced at API level
* Gym Management (Platform onboarding, settings)
* Members (Create, Update, Renew, Expire, Status)
* Leads (Create, Track, Follow-up, Convert)
* Attendance (Daily check-ins, history)
* Payments (Member billing, idempotency handling)
* Reports (Aggregated stats for members, payments, leads)
* Exports (Direct-to-CSV streaming)
* Manual Platform Billing (Admin manually updates expiry)
* Subscription Lifecycle (Automated Cron transitions: Active -> Grace -> Restricted -> Disabled)
* Audit Logs (Append-only tracking for critical actions)

### BUCKET B — OPTIONAL IF TIME PERMITS
*(Only permitted if they do not increase architectural complexity)*
* Basic email notifications for new lead assignments.
* UI Dark mode.
* Simple dashboard charts (if standard DB queries are sufficient).

### BUCKET C — EXPLICITLY FORBIDDEN IN V1
* Mobile Apps (iOS/Android)
* AI Features (Predictive churn, AI scheduling)
* WhatsApp Automation / SMS integrations (unless basic 3rd-party webhook)
* Automated SaaS Billing (Razorpay subscriptions for platform fee)
* Marketplace / Add-on stores
* Franchise Management / Multi-branch hierarchies
* Public APIs for third-party developers
* Advanced Analytics / Data Warehousing
* White Labeling / Custom Domains per gym
* Referral Systems / Affiliate tracking
* Loyalty Programs

## 4.1 Implementation Sequence

**Phase 1: Database Schema & Core Config**
* **Goal:** Create PostgreSQL tables, strict foreign keys (`gym_id`), and define environment config.
* **Dependencies:** None.
* **Risks:** Missing indexing or incorrect cascading deletes leading to data loss.
* **Definition of Done:** DB schema mapped, initial migrations run, tables created successfully.

**Phase 2: Core Backend Setup & Tenant Isolation**
* **Goal:** Initialize Express, setup error handling, build `BaseRepository` enforcing `gym_id`.
* **Dependencies:** Phase 1.
* **Risks:** Leaky abstraction allowing controllers to bypass `BaseRepository`.
* **Definition of Done:** `BaseRepository` written, unit tests prove queries without `gym_id` fail.

**Phase 3: Authentication & Session Management**
* **Goal:** Secure login, password hashing, DB-backed sessions.
* **Dependencies:** Phase 2.
* **Risks:** Session fixation, brute force vulnerability.
* **Definition of Done:** Users can log in; DB records session; rate-limiter rejects brute force.

**Phase 4: RBAC & Middleware**
* **Goal:** Protect routes based on role and tenant affiliation.
* **Dependencies:** Phase 3.
* **Risks:** Role escalation (e.g., Reception updating Owner settings).
* **Definition of Done:** Middleware correctly rejects unauthorized roles from sensitive endpoints.

**Phase 5: Platform Gym Management & Lifecycle Cron**
* **Goal:** Admin creates gyms. Cron job transitions state based on `subscription_end_date`.
* **Dependencies:** Phase 4.
* **Risks:** Cron fails to run after server restart; incorrect date math.
* **Definition of Done:** Hourly idempotent cron successfully updates `ACTIVE` -> `GRACE` -> `RESTRICTED`.

**Phase 6: Member & Lead Management**
* **Goal:** Full CRUD APIs for Members and Leads.
* **Dependencies:** Phase 4.
* **Risks:** Accidental cross-gym modifications.
* **Definition of Done:** Staff can add/edit/view members and leads strictly within their gym.

**Phase 7: Financials (Payments) & Audit Logs**
* **Goal:** Process member payments with idempotency. Log destructive actions.
* **Dependencies:** Phase 6.
* **Risks:** Duplicate inserts via race conditions.
* **Definition of Done:** Idempotency key prevents duplicate payments; audit log records insertions.

**Phase 8: Attendance, Reports, & Exports**
* **Goal:** Check-ins, aggregated dashboards, CSV streaming.
* **Dependencies:** Phase 6, 7.
* **Risks:** Memory crashes on large CSV exports.
* **Definition of Done:** Exports stream directly via HTTP; DB aggregations return in <100ms.

**Phase 9: Frontend UI Integration**
* **Goal:** Connect React (Vite) app to the backend APIs.
* **Dependencies:** Phase 1-8.
* **Risks:** State management complexity, CORS.
* **Definition of Done:** E2E user flows function successfully in the browser.

## 6. System Architecture
* **Stack:** Node.js (Express) Backend + React (Vite) Frontend + PostgreSQL Database.
* **Pattern:** Monolithic structure with strict Layered Architecture (Routes -> Controllers -> Services -> Repositories).
* **Target Scale:** 50 Gyms, ~25,000 members. No need for Microservices, Kubernetes, or multi-region setups.
* **Module Architecture:**
  - `API Layer:` Express Routers grouping logical endpoints.
  - `Controller Layer:` Input parsing, HTTP response formatting, DTO validation.
  - `Service Layer:` Core business logic, multi-tenant enforcement, transaction management.
  - `Repository Layer:` Direct database interaction via strict Base Repository classes.

## 7. Tenant Isolation Model (Sacred)
* **Model:** Shared Database, Shared Schema (Pool Model).
* **Enforcement Strategy:** Explicit `BaseRepository` pattern. 
* **Justification for 50 Gyms:** AsyncLocalStorage and Prisma Extensions are complex and can fail silently on version upgrades. For ~25,000 total rows, passing `gym_id` explicitly from `Controller -> Service -> Repository` is the most reliable, easily auditable method. Every repository method (e.g., `findMany(gymId, filters)`) strictly requires `gym_id` as the first argument.

## 8. Security Model
* **Sessions:** PostgreSQL-backed sessions (`sessions` table). Redis is REJECTED as overkill for ~250 max concurrent staff users. DB sessions allow instant invalidation (role changes/demotions) and are simple to maintain.
* **Hashing:** `bcrypt` (salt rounds = 12).
* **Rate Limiting:** In-memory or DB-backed rate limiting on `/auth/*` endpoints.

## 9. Roles & Permissions (RBAC Matrix)
* **`ADMIN` (Platform):** Manages all Gyms. Marks platform subscriptions as paid. Cannot read gym member data.
* **`OWNER` (Gym):** Scoped to `gym_id`. Full CRUD on Gym Settings, Staff, Members, Leads, Financials, Reports.
* **`MANAGER` (Gym):** Scoped to `gym_id`. CRUD on Members, Leads, Attendance. View Reports. Cannot modify Gym Settings or Owners.
* **`RECEPTION` (Gym):** Scoped to `gym_id`. Create Leads, Check-in Members, View active members. Cannot delete records, modify past payments, or view financial reports.

## 10. Billing Model & Payment Integrity
* **Platform Billing:** Manual. Admin updates `subscription_end_date`.
* **Gym Billing (Member Payments):** 
  - **Idempotency Strategy:** The frontend generates a UUID (`idempotency_key`) on payment form submission. The backend checks the `payments` table for this key. If it exists, it returns the existing record. If not, it processes the payment. This prevents accidental UI double-clicks without restricting legitimate identical payments (same amount, same day, same member).

## 11. Subscription Lifecycle
* **Implementation:** Node.js `node-cron` running HOURLY (not daily, to survive server restarts).
* **Logic (Idempotent transitions):**
  - `ACTIVE`: `subscription_end_date` >= `TODAY`
  - `GRACE`: `TODAY` > `subscription_end_date` AND `TODAY` <= `subscription_end_date + 7 days`.
  - `RESTRICTED`: `TODAY` > `+7 days` AND <= `+14 days`.
  - `DISABLED`: `TODAY` > `+14 days`.
* **Action:** The cron job finds gyms in incorrect statuses based on their dates and updates them.

## 12. Database Schema (Core V1 Tables)
* `gyms`: id, name, phone, address, status, subscription_end_date
* `users`: id, gym_id, role, name, email, phone, password_hash, is_active
* `sessions`: id, user_id, token_hash, expires_at
* `members`: id, gym_id, registration_id, name, phone, status, membership_end_date
* `leads`: id, gym_id, name, phone, status, next_followup
* `payments`: id, gym_id, member_id, amount, payment_mode, transaction_date, idempotency_key (UNIQUE)
* `attendance`: id, gym_id, member_id, date, check_in_time
* `audit_logs`: id, gym_id, user_id, action, entity, entity_id, timestamp, details

## 13. Reporting and Export Design
* **Reporting:** Standard Postgres aggregations (`GROUP BY`). At 25k total members across the platform, an individual gym will have max ~1,000 members. Standard DB indexes on `gym_id`, `date`, and `member_id` will yield sub-100ms report generation. No need for read-replicas.
* **Exports:** CSV exports stream directly from the database query using `fast-csv` to the HTTP response, avoiding Node.js memory limits.

## 14. Backup & Recovery Strategy
* **Automated:** Managed PostgreSQL automated daily snapshots.
* **Point-in-Time Recovery (PITR):** 7-day retention for rapid recovery in case of catastrophic user error or data corruption. 
* **Operational Rules:** Developers do not have write-access to the production database directly.

## 15. Audit Log Strategy
* Critical destructive/financial actions (`DELETE member`, `UPDATE payment`, `UPDATE role`) trigger an insertion into `audit_logs`.
* Audit logs are strictly append-only. No API endpoint exists to modify or delete them.

## 21. V2 Backlog (Reference Only)
* Automated billing integrations.
* Advanced analytics.
* Mobile applications.
