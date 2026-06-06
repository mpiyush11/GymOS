# FINAL THEME 1 SPECIFICATION (PRE-DEVELOPMENT)

## 1. SOCIAL PROOF DECISIONS (KEEP OR REMOVE)

*   **Social Proof / Google Reviews Section: KEEP.**
    *   *Reasoning:* In Tier-2/3 India, Google Reviews are the ultimate trust proxy. If we don't display them, the user will leave the site to check Google Maps anyway, breaking the conversion funnel. We will add a hardcoded or statically configurable "Top Reviews" section (since V1 doesn't have an automated Google API integration yet).
*   **Success Stories / Before-After Section: REMOVE.**
    *   *Reasoning:* Gym owners struggle to collect high-quality, professional before/after photos. Uncurated, poorly lit cell-phone photos destroy the "Luxury" premium perception outlined in the Blueprint. 
*   **Statistics Section (e.g., "5000+ Happy Members"): REMOVE.**
    *   *Reasoning:* Highly generic, often perceived as fake, and takes up valuable mobile screen real estate that should be used for pricing or trainers.

---

## 2. FINAL LEAD JOURNEY ARCHITECTURE

1.  **Visitor** lands on the mobile website via Instagram/Local SEO.
2.  **Website** displays transparent pricing and a sticky WhatsApp button.
3.  Visitor enters Phone/Name in the Lead Form.
4.  **Public Lead API** (`POST /api/v1/public/leads` with `X-Gym-Public-Key`) captures the data, bypassing the auth middleware.
5.  **Management System** records it with `source: 'WEBSITE'` and `status: 'NEW'`.
6.  **Reception** logs into the Dashboard, sees "Pending Leads", and calls the number.
7.  **Conversion:** The Receptionist or Manager clicks "Convert", entering the cash payment to seamlessly create an `ACTIVE` member.

---

## 3. FINAL HERO RULES (NO GENERIC COPY)

*   *Banned Copy:* "Get Fit Today", "No Pain No Gain", "Welcome to our Gym".
*   *Mandated Structure:*
    *   **H1 (The Hook):** "The Most Premium Fitness Experience in [Local Area]"
    *   **H2 (The Proof):** "Imported equipment, certified trainers, and transparent pricing."
    *   **Primary CTA:** "View Pricing" (Scrolls down).
    *   **Secondary CTA:** "Book Free Trial" (Scrolls to Form).

---

## 4. FINAL CTA HIERARCHY

1.  **Global Mobile Sticky:** WhatsApp FAB (Bottom Right). Always accessible.
2.  **Global Header:** "Join Now" (Anchors to Lead Form).
3.  **Hero Primary:** "View Pricing" (Keeps them on page to build value before asking for data).
4.  **Plans Cards:** "Select Plan" (Anchors to Lead Form).

---

## 5. FINAL MOBILE HIERARCHY (Z-INDEX & SPACING)

*   **Z-Index 50:** Top Navbar (Gym Name + "Join Now" button).
*   **Z-Index 40:** WhatsApp Sticky FAB.
*   **Spacing:** Minimum `padding-y: 4rem` (`py-16`) between all sections. Elements must have breathing room to feel luxurious. 

---

## 6. FINAL SECTION ORDER

1.  **Hero:** (Hook + Local Validation).
2.  **About/Highlights:** (Cleanliness, Air Conditioning, Parking - key local concerns).
3.  **Membership Plans:** (Grid of 3, highlighting the 3-month or 6-month tier).
4.  **Trainers:** (Horizontal scroll snap on mobile).
5.  **Google Reviews Summary:** (Static trust validation).
6.  **Lead Capture Form:** (Name, Phone, Submit).
7.  **Footer:** (Address, Business Hours, Map Link, Phone).

---

## 7. WHAT THEME 2 MUST INHERIT (THEME CONTRACT LOCK)

If a developer builds "Theme 2" tomorrow, they **MUST** inherit:
1.  The `X-Gym-Public-Key` API submission architecture.
2.  The exact `MASTER_WEBSITE_VARIABLES.md` JSON structure (no requesting new backend fields).
3.  The "No Email" rule on the Lead Form.
4.  The sticky WhatsApp button mandate for mobile.
5.  The transparent display of `membership_prices` without gating them behind a form.

---

## 8. FINAL READINESS SCORE
This specification perfectly aligns the backend capabilities, the marketing psychology, and the frontend data constraints.

**Readiness:** 100% Ready for React/Tailwind coding.