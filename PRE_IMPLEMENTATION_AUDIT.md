# PRE-IMPLEMENTATION AUDIT PLAN

## 1. Architecture Plan
*(To be populated upon codebase review)*
* Evaluate current tech stack, routing, ORM/Database interaction, and authentication mechanisms.
* Map data flow from Request -> Middleware (Auth/Tenant) -> Controller -> Service -> DB.

## 2. Known Risks
* **Tenant Bleed (IDOR):** The highest risk in B2B SaaS. Ensuring `gym_id` is validated on every single read/write operation.
* **Role Escalation:** A Receptionist performing Owner actions.
* **Lifecycle Failures:** Cron jobs failing silently, leaving gyms in 'Active' state when they should be 'Restricted'.

## 3. Previous Mistakes To Avoid
* **Infinite Audit Loops:** Generating endless theoretical P3/P4 findings instead of focusing on V1 launch blockers.
* **Overengineering:** Recommending enterprise solutions (K8s, Kafka) for a 50-gym target.
* **Scope Creep:** Building automated platform billing or mobile apps.
* **Blind Trust:** Assuming previous code comments or PRs actually fixed security flaws.

## 4. Multi-Tenant Risks
* Missing `WHERE gym_id = ?` clauses.
* Caching data globally instead of per-tenant.
* Global configuration pollution.

## 5. Financial Risks
* Race conditions in marking payments.
* Floating point errors in currency calculations (if applicable).
* Deleting payment records instead of soft-deleting/voiding them.

## 6. Session Risks
* Lack of session invalidation on password change or role demotion.
* Weak session cookies (missing HttpOnly, Secure flags).

## 7. Data-Loss Risks
* Unintended cascading deletes.
* Lack of database backup strategy (operational risk).
* Missing soft-deletes on critical business entities (Members, Leads, Payments).

## 8. Launch Success Criteria
* No tenant data leakage (P0).
* No financial or subscription corruption (P0).
* No privilege escalation (P0).
* Acceptable operational reliability for 50 gyms / 25k members.
* Manual platform billing and automated lifecycle work perfectly.

## 10. Previously Known Issues To Verify First
*(Do NOT assume fixed. Verify directly from source code.)*

* **OTP generation randomness:** Are cryptographically secure algorithms used?
* **Session token security:** Are tokens long enough, unpredictable, and stored securely?
* **Tenant isolation:** Are `gym_id` checks present on *every* scoped query?
* **Cross-gym access protection:** Can a user manually alter a URL/payload to access another gym's data?
* **Staff login scalability:** How are staff linked to gyms, and does it scale for V1?
* **Firestore production readiness:** Are indexes defined? Are security rules robust? (Note: checking if Firestore is actually used vs traditional DB).
* **Rate limiting architecture:** Is it present for auth endpoints to prevent brute force?
* **Subscription lifecycle correctness:** Do cron jobs transition states exactly as designed?
* **Refund handling correctness:** Can refunds result in negative balances or corrupted revenue numbers?
* **Audit logging coverage:** Are critical destructive actions actually logged?
* **DPDP compliance gaps:** Are basic data protection and consent mechanisms in place for the Indian context?
* **Cron reliability:** What happens if a nightly cron job fails? Does it retry?
* **Financial record integrity:** Are payments stored immutably or can they be easily altered without a trail?
* **Permission boundary enforcement:** Are roles checked server-side before execution?
