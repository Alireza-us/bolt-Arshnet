# Project memory

## Product intent & audience

- Solo freelance IT contractor marketing site ("Arshnet").
- Services: CCTV/IP cameras, VoIP (3CX/FreePBX/SIP/IVR), network/helpdesk support (Wi-Fi, firewalls, UniFi/MikroTik, monthly plans).
- Audience: non-technical small business owners (clinics, shops, offices, warehouses). They value reliability, fast response, clear pricing.
- On-site in [CITY / REGION] plus remote support.

## Brand personality & voice

- Modern, clean, technical but approachable. Plain, direct copy — no buzzwords, fake stats, or invented client names.
- Trust-oriented: certifications, brand logos (Hikvision, Ubiquiti, MikroTik, 3CX), testimonials.

## Visual design & UX direction

- Color palette: dark navy `#0B1220` + white base; electric-blue accent `#2F6BFF`. (Locked — do not change without asking.)
- Typography: Space Grotesk (headings), Inter (body). Large high-contrast headings.
- Subtle grid/circuit-line background motif, used sparingly — no stock-photo clichés or generic gradients.
- Components: rounded cards, soft shadows, sticky header with CTA, sticky mobile "Call now" bar (44px+ tap targets).
- Smooth scroll-in animations respecting `prefers-reduced-motion`. Clean SVG icons via lucide-react for services/brands.
- Mobile-first responsive. All placeholders marked in `[BRACKETS]`.

## Decisions, constraints & rationale

- Scope locked to 6 page types: Home, Cameras, VoIP, Network, Pricing, Case Studies, About, Contact. No blog/login/shop/extra pages.
- Tech: React + Vite + Tailwind. Hash-based router (built ad-hoc, no react-router). `@/` alias → `src/`.
- Contact form submits to Supabase (table created) with RLS; validates inputs, shows success/error states.
- Per-page SEO: one H1, meta titles/descriptions, Open Graph, LocalBusiness JSON-LD.
- Shared infrastructure: SEO hook, scroll-reveal hook, reusable SectionHeading, CTAButton, FAQ accordion, service page template driven by data (`services.ts`).
- Lighthouse targets: Performance 90+, Accessibility 95+, SEO 100. Lazy-load images, compress assets.

## Open questions & assumptions

- Final placeholder values needed: phone number, city/region, CTA text, pricing amounts, bio, testimonials, case-study metrics — all currently `[BRACKETED]`.
- Site language assumed English/RTL support pending; user hasn't specified actual language or RTL need yet.
- Supabase env keys assumed configured by template; URL/anon key must be set for contact form to persist.