# MASTER WEBSITE VARIABLES CONTRACT (FROZEN)

## PURPOSE
This document is the absolute, permanent contract between the GYMOS backend data layer and all future public-facing website themes.
Theme 1, Theme 2, and Theme 50 MUST consume exactly these variables. Themes are NEVER allowed to invent new business logic or request new database fields bypassing this contract.

---

## CATEGORY A — OWNER EDITABLE
*(These are fields the Gym Owner can modify via the SaaS settings panel.)*

**Contact & Location**
- `phone`: Primary contact number (String)
- `whatsapp`: WhatsApp business number (String)
- `email`: Public support email (String)
- `address`: Physical address (String)
- `google_maps_url`: Embedded maps link or URL (String)

**Social & Brand**
- `about_text`: Short description of the gym (String, Max 500 chars)
- `social_links`: Object `{ instagram: "url", facebook: "url", youtube: "url" }`

**Operations**
- `business_hours`: Object (e.g., `{"mon_fri": "6AM - 10PM", "sat": "6AM - 8PM", "sun": "Closed"}`)

**Commercials (Pricing & Plans)**
- `membership_prices`: Array of Objects `[{ title: "Monthly", duration: "1 Month", price: 1500, highlight: false }]`
- `joining_fee`: One-time setup fee (Number/String)

**Staff (Trainers)**
- `trainers`: Array of Objects `[{ id: 1, name: "Rahul", designation: "Head Coach", bio: "...", image_url: "..." }]`

**Marketing & Conversion**
- `lead_form_enabled`: Boolean (Should the website render a "Join Now" contact form?)
- `cta_button_text`: Primary Call-To-Action text (String, e.g., "Join Now", "Get a Free Trial")
- `hero_headline`: Main H1 text (String)
- `hero_subheadline`: Sub H2 text (String)

---

## CATEGORY B — PLATFORM CONTROLLED
*(These are managed purely by the Platform Admin or dictated by the chosen Theme structure. Owners cannot edit these via standard forms.)*

**Platform Identity**
- `gym_name`: Inherited directly from the `gyms` table.
- `logo_url`: Inherited from gym core profile uploaded during Admin onboarding.

**Theme Structure**
- `theme_id`: The ID of the active theme (e.g., `theme_dark_pro`).
- `theme_colors`: CSS variables injected by the theme (Primary, Secondary, Accent).
- `section_order`: Array dictating layout (e.g., `['HERO', 'ABOUT', 'PLANS', 'TRAINERS', 'CONTACT']`).

---

## CATEGORY C — INTERNAL SYSTEM VARIABLES
*(Strictly hidden from Owners. Used exclusively by the frontend compilation/routing engines to bridge the public website to the backend API.)*

- `public_site_key`: A dedicated public key (e.g., `gpk_xxxxxx`) mapped to the `gym_id`. Used in the `X-Gym-Public-Key` header for lead submission.
- `api_endpoint`: The base URL where lead submissions are routed (e.g., `https://api.gymos.in/api/v1/public/leads`).

---

## THEME CONTRACT (STRICT INSTRUCTIONS)
1. **Same Variables, Always:** Themes map data purely from Category A & B. A theme cannot request a `tiktok_url` if it is not added to Category A first.
2. **Same Business Meaning:** `business_hours` means business hours. A theme cannot repurpose this variable to display "Class Schedules".
3. **Design Flexibility:** Themes are free to render the `Trainers` array as a 3D carousel, a CSS grid, or a simple list. The UI is completely unconstrained, but the data schema is locked.
4. **Lead Routing Rule:** Every theme that renders a form MUST post `name`, `phone`, and `message` to the `api_endpoint` utilizing the `public_site_key`. No local email forwarding allowed.
