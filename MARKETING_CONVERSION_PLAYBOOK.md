# MARKETING CONVERSION PLAYBOOK (THEME 1)
**Target:** Tier-2 and Tier-3 Gyms in India.
**Goal:** Maximize local trust and inbound lead generation (Form + WhatsApp).

---

## 1. HERO COPY STRATEGY
The Hero section determines whether a visitor bounces or scrolls. It must instantly answer: "Is this gym good?" and "Is it near me?".

*   **Headline Rules (`hero_headline`):** 
    *   Must be outcome-focused or status-focused.
    *   Maximum 6 words.
    *   No generic filler (e.g., "Welcome to GymOS").
    *   *Rule:* Focus on transformation or local dominance (e.g., "The Premium Fitness Experience").
*   **Subheadline Rules (`hero_subheadline`):** 
    *   Must explicitly state the locality/city.
    *   Must state the primary differentiator (e.g., "Imported equipment & certified trainers in [Local Area]").
*   **Primary CTA (`cta_button_text`):** 
    *   Must be low-commitment. Never use "Buy Now" or "Pay Online".
    *   *Rule:* Use "Book Free Trial" or "Get Offers". Anchors to Lead Form.
*   **Secondary CTA:** 
    *   Must offer immediate transparency.
    *   *Rule:* Use "View Pricing". Anchors to Membership Plans section.

---

## 2. TRUST BUILDING STRATEGY
In Tier-2/3 India, digital skepticism is high. Visitors assume online photos might be fake or stolen.

*   **How to Build Trust:**
    *   Show real faces. The `trainers` array with local names builds massive credibility.
    *   List clear `business_hours` (proves the business is operational).
    *   Embed a `google_maps_url` (proves physical existence).
*   **What Must NEVER Appear:**
    *   Stock photos of foreign fitness models.
    *   "Coming Soon" badges.
    *   Vague pricing ("Call for Price" causes immediate bounce).

---

## 3. MEMBERSHIP PLAN PSYCHOLOGY
Transparency is the ultimate conversion hack in local markets.

*   **Highlighted Plan Decision:** **The 3-Month or 6-Month Plan.**
*   **Reasoning:**
    *   Highlighting the 1-Month plan anchors the perceived value too low and encourages high churn.
    *   Highlighting the 12-Month plan creates sticker shock (too expensive for an upfront local payment).
    *   Highlighting the 3-Month or 6-Month plan creates the "Goldilocks" effect. It feels like a serious commitment but remains financially accessible. It makes the 1-Month plan look like a bad deal, pushing users to upgrade to the middle tier.
*   **Joining Fee Logic:** Stating the `joining_fee` explicitly prevents bait-and-switch anger when the lead walks into the gym.

---

## 4. WHATSAPP CONVERSION STRATEGY
WhatsApp is the default communication engine of Tier-2/Tier-3 India.

*   **CTA Philosophy:** The WhatsApp button is an escape hatch for high-intent users who hate filling out forms.
*   **Best Button Wording:** Avoid generic "Chat". Use "WhatsApp Us" or simply the WhatsApp Icon.
*   **Mobile-First Behavior:** It must be a sticky floating action button (FAB) in the bottom-right corner. It must remain visible at all times during scrolling. It must use the `whatsapp://` or `wa.me/` URI scheme to instantly open the native app, pre-filled with a greeting (e.g., "Hi, I want to know more about the gym memberships").

---

## 5. LEAD FORM STRATEGY
The lead form captures users browsing late at night or during work when they cannot WhatsApp immediately.

*   **Minimum Fields:** Name, Phone.
*   **Maximum Fields:** Name, Phone, Message (Optional).
*   **Form Completion Psychology:** Every additional required field drops conversion by ~15%. We do NOT ask for Email. We do NOT ask for Goal (Weight loss/gain). The only goal is getting the phone number to the Receptionist/Manager.
*   **Success Message Rules:** Must explicitly tell them *what happens next*. (e.g., "Success! Our manager will call you within 2 hours to schedule your visit.")

---

## 6. LOCAL MARKET CONVERSION RULES (Tier-2 / Tier-3)
1.  **Pricing is King:** Do not hide prices. If the competitor hides prices and you show them, you win the lead.
2.  **No English Jargon:** Avoid hyper-technical fitness terms in the copy (e.g., "Hypertrophy Programming"). Use universally understood terms ("Muscle Gain", "Weight Loss").
3.  **Visual Proof:** A photo of the actual local gym entrance converts higher than a 4K stock photo of a random gym.

---

## 7. ANTI-CONVERSION RULES (DO NOT DO THIS)
*   **Pop-ups:** Never use modal pop-ups offering discounts on page load. It blocks the hero section and annoys mobile users.
*   **Autoplay Audio:** Never autoplay gym music or videos with sound.
*   **Horizontal Scrolling Clutter:** Do not force users to swipe through 15 photos to find the price.
*   **Fake Urgency:** Do not use "Offer expires in 12:00:00" countdown timers. Local markets recognize this as a cheap gimmick.

---

## 8. IMMUTABLE MARKETING RULES
Future theme developers must obey these laws:
1.  **The form asks for Phone, not Email.** (WhatsApp/Call is the only valid follow-up channel).
2.  **The WhatsApp button must be sticky on mobile.**
3.  **Prices must be rendered natively via the variables contract, never hidden behind a "Request Quote" wall.**
4.  **No mandatory third-party scripts (e.g., HubSpot, Marketo) that slow down mobile load times.** Speed = Trust.
