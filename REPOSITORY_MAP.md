# REPOSITORY MAP

## Purpose
This document provides a continuous, live map of the codebase. It ensures that if context is lost, any developer can understand the repository structure, file purposes, dependencies, and risk areas without rereading the entire source code.

## Target Structure (Greenfield V1)
As we begin implementation, the repository will be structured as follows:

```
/
├── server/                 # Backend Node.js / Express App
│   ├── src/
│   │   ├── config/         # Environment, DB config
│   │   ├── controllers/    # Request/Response handling & validation
│   │   ├── middlewares/    # Auth, Tenant injection, Rate limiting
│   │   ├── models/         # DB Schema definitions / Migrations
│   │   ├── repositories/   # Direct DB access (BaseRepository enforces gym_id)
│   │   ├── routes/         # Express routing definitions
│   │   ├── services/       # Core business logic
│   │   ├── utils/          # Helpers (Hashing, CSV generation, Idempotency)
│   │   └── app.js          # Express app setup
│   ├── package.json
│   └── .env
├── client/                 # Frontend React / Vite App
│   ├── src/
│   │   ├── api/            # API client wrappers
│   │   ├── components/     # Reusable UI (Buttons, Tables)
│   │   ├── pages/          # Views (Dashboard, Members, Leads)
│   │   ├── context/        # Auth & Tenant state
│   │   └── App.js
│   └── package.json
└── README.md
```

## Modules Overview
*   **File Path:** `/server/package.json`
*   **Purpose:** Backend Node.js dependency management.

*   **File Path:** `/server/src/models/schema.sql`
*   **Purpose:** Master PostgreSQL schema definition for the entire V1 platform.
*   **Dependencies:** PostgreSQL, `uuid-ossp` extension.
*   **Auth Involvement:** NONE.
*   **Tenant Involvement:** HIGH (`gym_id` foreign keys and indices set on all tenant tables).
*   **Financial Involvement:** HIGH (`payments` table with `idempotency_key` defined. Soft deletes enforced to prevent data loss).
*   **Risk Notes:** Any structural changes here must ensure `gym_id` is preserved to avoid catastrophic IDOR vulnerabilities.

*   **File Path:** `/server/src/config/db.js`
*   **Purpose:** PostgreSQL Connection Pool.
*   **Dependencies:** `pg`, `dotenv`.

*   **File Path:** `/server/src/repositories/BaseRepository.js`
*   **Purpose:** Core database abstraction layer.
*   **Tenant Involvement:** SACRED. This is the ultimate barrier against tenant bleeding. All methods strictly require `gymId`.
*   **Financial/Audit Involvement:** Respects `deleted_at IS NULL` to support soft-deletes and data retention.

*   **File Path:** `/server/src/db/runMigrations.js`
*   **Purpose:** Custom SQL migration runner. Tracks applied migrations in `schema_migrations`.
*   **Dependencies:** `pg`, `fs`.

*   **File Path:** `/server/src/repositories/SessionRepository.js`
*   **Purpose:** Handles creation, validation, and revocation of DB-backed sessions.
*   **Auth Involvement:** HIGH. Uses SHA-256 hashing to protect stored tokens.

*   **File Path:** `/server/src/middlewares/auth.js`
*   **Purpose:** Reads cookie/header, validates via SessionRepository, and injects `req.user` (`gym_id`, `role`).
*   **Tenant Involvement:** HIGH. This is where `gym_id` enters the application context per request.

*   **File Path:** `/server/src/middlewares/rbac.js`
*   **Purpose:** Enforces the `ROLE_HIERARCHY` (`ADMIN` > `OWNER` > `MANAGER` > `RECEPTION`).

*   **File Path:** `/server/src/app.js` & `/server/index.js`
*   **Purpose:** Express application setup and entry point.
*   **Dependencies:** `express`, `cors`, `helmet`.

*   **File Path:** `/server/src/controllers/authController.js`
*   **Purpose:** Handles user login, password verification (bcrypt), session creation, and secure cookie setting.
*   **Auth Involvement:** HIGH (Core Authentication).
*   **Tenant Involvement:** MEDIUM (Returns `gym_id` on successful auth).

*   **File Path:** `/server/src/routes/authRoutes.js`
*   **Purpose:** Exposes `/login`, `/logout`, and `/me`. Applies `express-rate-limit` to prevent brute force attacks.

*   **File Path:** `/server/src/db/migrations/002_add_lead_source.sql`
*   **Purpose:** Additive migration to add `source` to leads and enforce `UNIQUE(gym_id, phone)`.

*   **File Path:** `/server/src/repositories/LeadRepository.js`
*   **Purpose:** Lead-specific DB access.

*   **File Path:** `/server/src/services/LeadService.js`
*   **Purpose:** Lead lifecycle (Create, Follow-up, Convert). 
*   **Risk Notes:** `convertLead` uses raw PostgreSQL transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) to prevent partial member creation failures.

*   **File Path:** `/server/src/repositories/AttendanceRepository.js`
*   **Purpose:** DB access for attendance records.

*   **File Path:** `/server/src/services/AttendanceService.js`
*   **Purpose:** Enforces check-in business rules (No double check-ins, blocks FROZEN/EXPIRED members).

*   **File Path:** `/server/src/db/migrations/004_add_payment_void_tracking.sql`
*   **Purpose:** Schema modification to support `void_reason`, `voided_by`, and `voided_at`.

*   **File Path:** `/server/src/repositories/PaymentRepository.js`
*   **Purpose:** Financial ledger DB access. Specifically overrides and disables generic updates/soft deletes to enforce strict immutability.

*   **File Path:** `/server/src/services/PaymentService.js`
*   **Purpose:** Core financial logic. `processPayment` runs the atomic (Payment + Renewal) transaction. `voidPayment` processes cancellations securely.

*   **File Path:** `/server/src/controllers/paymentController.js` & `/server/src/routes/paymentRoutes.js`
*   **Purpose:** Exposes ledger APIs. Enforces Enum validation and RBAC (`MANAGER` required for voids).
*   **Purpose:** Appends immutable tracking logs to `audit_logs` using `BaseRepository`.

*   **File Path:** `/server/src/repositories/MemberRepository.js`
*   **Purpose:** Member-specific queries (e.g., `findByPhone`).

*   **File Path:** `/server/src/services/MemberService.js`
*   **Purpose:** Core business logic for creating, updating, freezing, and renewing members.

*   **File Path:** `/server/src/controllers/memberController.js` & `/server/src/routes/memberRoutes.js`
*   **Purpose:** Exposes Member API with strict RBAC (`RECEPTION` vs `MANAGER`).
