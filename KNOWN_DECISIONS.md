# KNOWN DECISIONS

## Purpose
This document prevents future audit loops. Any business or architectural decision that has been finalized is documented here and is **LOCKED**. Future audits may challenge implementation quality but may NOT reopen these decisions without explicit approval.

## Locked Decisions

### Global Email Uniqueness (Auth)
**Decision:** Platform-wide email uniqueness.
**Reason:** Allows Owners/Staff who potentially manage multiple branches (in future) or switch gyms to use a single identity system without needing to specify a `gym_id` at the login screen. It dramatically simplifies the login flow.
**Status:** LOCKED.

### Password Hashing
**Decision:** bcrypt (cost factor 12).
**Reason:** Argon2id is technically superior, but bcrypt is entirely safe, battle-tested, and doesn't require native C++ compiler bindings which can cause build/deploy failures on basic PaaS environments.
**Status:** LOCKED.

### Lead Conversion / Member Duplicate Protection
**Decision:** The `members` table schema strictly defines `UNIQUE(gym_id, phone)`.
**Reason:** This database-level constraint mathematically guarantees that no two active members can exist with the same phone number in the same gym, acting as the ultimate fallback against any race conditions during Lead Conversion.
**Status:** LOCKED.

### Partial Payments
**Decision:** V1 does NOT support partial payments or outstanding balances.
**Reason:** Building an invoice-based ledger with outstanding balances, overdue tracking, and partial settlement logic is massive V2 complexity. For 50 Tier-2/3 gyms, if a member pays ₹500 today, the receptionist will simply log a ₹500 payment and manually extend the membership date by an appropriate fraction (e.g., 10 days instead of 30 days). The system strictly records the transaction ledger without caring about "expected vs actual" fees.
**Status:** LOCKED.

### Membership History Source of Truth
**Decision:** Option A: Payment ledger + Audit logs.
**Reason:** A separate `membership_history` table is redundant V2 complexity. In a real gym, a membership "history" is fundamentally a history of financial transactions (when they paid, how much, and what dates were granted). The `payments` table perfectly tracks this. `audit_logs` track non-financial date adjustments.
**Status:** LOCKED.

### Session Enforcement (Multi-Device)
**Decision:** Allow Multi-Session (Option B) for GymOS.
**Reason:** Single-session enforcement (destroying all sessions on login) breaks real-world gym operations. An Owner often logs in on their mobile phone while simultaneously keeping the office desktop logged in for reporting. A Manager often has the reception desk PC logged in while checking something on their iPad on the gym floor. Logging in on the phone shouldn't log out the reception desk.
**Status:** LOCKED.

### Website Public Identifier
**Decision:** Option B: Dedicated `public_site_key` (e.g., `gpk_xxxxxxxx`).
**Reason:** Exposing the internal database `gym_id` (even if it is a UUID) on the public internet is an unnecessary risk. A dedicated public site key allows us to securely map public traffic to the internal tenant without leaking the core primary key used across all internal repositories. It also allows us to easily revoke and regenerate the public key if a website is under a spam attack, without needing to migrate the entire `gym_id` structure.
**Status:** LOCKED.
**Decision:** Platform `ADMIN` role completely isolated from tenant routes.
**Reason:** Even though `ADMIN` sits at the top of the hierarchy, giving them implicit access to `GET /members` or `POST /payments` violates B2B data privacy. They can only access `/admin` endpoints.
**Status:** LOCKED.
**Decision:** Payment records extend `membership_end_date` but do NOT alter `status`. `FROZEN` members remain `FROZEN`.
**Reason:** Auto-unfreezing cheats members who pay in advance while traveling/injured (burns days) and bypasses disciplinary freezes. Payment logic and Status logic must remain 100% independent.
**Status:** LOCKED.

### Freeze/Unfreeze RBAC
**Decision:** Both `FREEZE` and `UNFREEZE` are strictly restricted to `MANAGER` and `OWNER` roles. `RECEPTION` cannot alter status.
**Reason:** Allowing Reception to unfreeze completely defeats the purpose of a disciplinary or financial freeze set by management. If a frozen member arrives at the gym, the Manager must be involved.
**Status:** LOCKED.
**Decision:** The current design of storing the active `membership_end_date` directly on the `members` table combined with immutable `payments` and `audit_logs` is commercially safe.
**Reason:** 
- It naturally supports *any* duration (Monthly, Custom, Quarterly) because the receptionist manually inputs the calculated end date.
- Renewal history and Revenue reports are NOT corrupted because reports will query the `payments` table (which stores `member_id`, `amount`, and `transaction_date`), rather than relying on the `members` table for historical revenue. 
- The `members` table strictly acts as the *current state* (Is this person allowed in the gym today?), while `payments` and `audit_logs` act as the *ledger state*.
- **Small Additive Fix Applied to Lead Phase:** I will add `lead_source` to the Leads schema.
**Status:** LOCKED.

### Member Phone Uniqueness
**Decision:** Unique per gym (`UNIQUE(gym_id, phone)`).
**Reason:** A phone number should strictly identify a single member record within a specific gym to prevent accidental duplicate entries by staff. However, the same phone number can exist in *different* gyms (if a person attends two separate franchises).
**Status:** LOCKED.
**Decision:** Manual.
**Reason:** Business choice.
**Status:** LOCKED.

### Architecture
**Decision:** Monolith.
**Reason:** Target scale is 50 gyms.
**Status:** LOCKED.

### Mobile Apps
**Decision:** Not part of V1.
**Status:** LOCKED.

### AI Features
**Decision:** Not part of V1.
**Status:** LOCKED.

### Microservices
**Decision:** Not part of V1.
**Status:** LOCKED.

### Multi-Region Deployment
**Decision:** Not part of V1.
**Status:** LOCKED.

### Subscription Lifecycle
**Decision:** Automatic state transitions. Manual payment realization.
**Status:** LOCKED.