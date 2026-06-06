# THEME 1 MASTER BLUEPRINT

## SECTION 1 — TARGET CUSTOMER
### 1. Gym Owner Perspective
**Why the owner buys this website:** They want a completely hands-off, zero-maintenance asset that acts as an automated lead magnet. They do not want to manage hosting, plugins, or complex content management systems. They want a digital storefront that makes their local gym look better than the big-box franchise down the street.
### 2. End Customer Perspective
**Why the visitor submits a lead:** They want to know the price, see the equipment, and confirm the location without walking in physically. They submit a lead because the website feels trustworthy enough to hand over their phone number without fearing endless spam.
### 3. Local Market Reality (Tier-2 / Tier-3 India)
**Customer Behavior:** Over 90% of traffic is mobile. Trust is built through visible locality (WhatsApp numbers, local maps, familiar owner/trainer faces). A purely "Western" luxury template with stock photos alienates this demographic. True luxury here means cleanliness, transparency in pricing, and direct human connection (WhatsApp).

---

## SECTION 2 — CONVERSION STRATEGY
**Visitor Journey Map:**
1. **Landing (Hero):** Instant validation of premium quality and location. Hook the visitor.
2. **Trust (About/Facilities):** Prove the gym is real, clean, and well-equipped.
3. **Offer (Plans):** Transparent pricing removes the anxiety of "Is this too expensive for me?".
4. **Social Proof (Trainers):** Humanizes the brand. Shows authority.
5. **Lead Form (Capture):** Low-friction data entry.
6. **WhatsApp (Fallback Capture):** Sticky CTA for immediate high-intent queries.

---

## SECTION 3 — FINAL SECTION ORDER
1. **Hero:** 
   * *Purpose:* Hook & 3-second validation.
   * *Variables:* `gym_name`, `hero_headline`, `hero_subheadline`, `cta_button_text`, `logo_url`.
   * *CTA:* Scroll to Lead Form.
2. **About / Highlights:**
   * *Purpose:* Build trust and premium perception.
   * *Variables:* `about_text`.
3. **Membership Plans:**
   * *Purpose:* Price transparency.
   * *Variables:* `membership_prices`, `joining_fee`.
   * *CTA:* "Select Plan" (Scrolls to Lead Form).
4. **Trainers:**
   * *Purpose:* Authority and human connection.
   * *Variables:* `trainers`.
5. **Location & Contact:**
   * *Purpose:* Local validation.
   * *Variables:* `address`, `google_maps_url`, `business_hours`.
6. **Lead Capture (Footer/Bottom):**
   * *Purpose:* Convert intent to database entry.
   * *Variables:* `lead_form_enabled`.
   * *CTA:* Submit.

---

## SECTION 4 — HERO STRATEGY
*   **Headline Rules:** Must contain the primary value proposition (e.g., "Transform Your Life at [Gym Name]").
*   **Subheadline Rules:** Must validate the location or key differentiator (e.g., "The largest premium fitness center in [City]").
*   **Primary CTA:** `cta_button_text` (e.g., "Get a Free Trial"). Anchors directly to the Lead Form.
*   **Secondary CTA:** "View Plans". Anchors to the pricing section.
*   **Goal Met:** Within 3 seconds, visitor knows the brand, location, and what action to take next.

---

## SECTION 5 — MEMBERSHIP PLAN STRATEGY
*   **Structure:** Fixed array mappings (1 Month, 3 Month, 6 Month, 12 Month).
*   **Display Hierarchy:** 3 or 4 card grid/flex layout.
*   **Highlight Logic:** The 3-Month or 6-Month plan should visually pop (e.g., a "Best Value" badge or inverted colors) to drive mid-tier commitment.
*   **Joining Fee:** Displayed clearly below the grid (e.g., "*A one-time joining fee of ₹[joining_fee] applies to all new members.*") to prevent surprise objections during walk-in.

---

## SECTION 6 — TRAINER STRATEGY
*   **Mandatory fields:** `name`, `designation`.
*   **Optional fields:** `bio`, `image_url`.
*   **Best Approach:** A clean, horizontal scroll snap on mobile, grid on desktop.
*   **Maintenance Burden:** Extremely low. If an owner doesn't upload images, the UI gracefully falls back to an elegant initial-based avatar (e.g., "R" for Rahul).

---

## SECTION 7 — GALLERY POLICY
**Decision:** PLATFORM CONTROLLED (Internal mapping, no arbitrary Owner uploads in V1).
**Justification:** Allowing owners to directly upload uncompressed, poorly cropped, pixelated mobile phone photos will instantly destroy the "Luxury" perception of Theme 1. In V1, the Platform Admin collects 3-4 high-quality images during onboarding, compresses them, and maps them to the theme. Owners cannot break the design.

---

## SECTION 8 — LEAD GENERATION
**Exact Flow:**
1. Visitor fills out Name, Phone, and optional Message.
2. Frontend validation prevents submission if Phone < 10 digits.
3. Form executes `POST https://api.gymos.in/api/v1/public/leads` with `X-Gym-Public-Key`.
4. Backend applies Rate Limit (3/hr) -> Validates Gym -> Creates Lead -> Returns 201.
5. Theme displays Success Message: "Thank you! Our team will contact you shortly."

---

## SECTION 9 — MOBILE FIRST RULES
*   **Scroll Behavior:** Smooth scrolling for all anchor links. Native CSS scroll-snap for horizontal trainer/plan cards.
*   **Sticky Elements:** 
    * A persistent bottom-right "WhatsApp" floating action button mapping to `whatsapp`.
    * A persistent bottom-left "Call" floating action button mapping to `phone`.
*   **CTA Placement:** Lead form must be visible without scrolling horizontally.

---

## SECTION 10 — LUXURY RULES (NON-NEGOTIABLE)
1. **Typography:** Clean, sans-serif fonts (e.g., Inter or Roboto). No cursive. High contrast.
2. **Spacing:** Massive padding and margins (`p-12`, `mb-20`). Whitespace creates luxury.
3. **Animations:** Subtle fade-ups on scroll. No bouncing, flashing, or cheap "shake" effects.
4. **Image Usage:** Full-width hero with a heavy dark overlay to ensure white text is always legible regardless of the background photo.
5. **Section Density:** One concept per viewport height. Do not cram plans, trainers, and contact info into a single screen.

---

## SECTION 11 — THEME CONTRACT (IMMUTABLE RULES)
All future themes (Theme 2, Theme 3) MUST:
1. Consume only variables defined in `MASTER_WEBSITE_VARIABLES.md`.
2. Post leads exactly to the defined public API architecture.
3. Rely on the backend for all business logic (no frontend price calculation or fake discounts).
4. Retain the ability to change visual layout, typography, and color without requesting backend schema modifications.

---

## SECTION 12 — FINAL VERDICT
*   **Theme 1 Conversion Score:** 9/10 (Optimized for lead capture and direct WhatsApp contact).
*   **Theme 1 Luxury Score:** 9/10 (Protected by strict Gallery policies and whitespace rules).
*   **Theme 1 Maintenance Score:** 10/10 (Zero-touch for the gym owner after initial setup).
*   **Theme 1 Scalability Score:** 10/10 (100% compliant with the agnostic variable contract).
*   **Overall Readiness:** 100% Ready for Frontend React/Tailwind Development.