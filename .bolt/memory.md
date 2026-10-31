# Project memory

## Product intent & audience

- Solo freelance IT contractor marketing site (“Arshnet”) for non-technical small-business owners: clinics, shops, offices, and warehouses.
- Services include CCTV/IP cameras, VoIP (3CX/FreePBX/SIP/IVR), and network/helpdesk support (Wi-Fi, firewalls, UniFi/MikroTik, and monthly plans).
- Audience values reliability, fast response, and clear pricing.
- Service area is on-site in `[CITY / REGION]` plus remote support.

## Brand personality & voice

- Modern, clean, technical, approachable, and trust-oriented.
- Use plain, direct copy; avoid buzzwords, fake statistics, and invented client names.
- Trust signals include certifications, technology brand logos, testimonials, and credible case studies.

## Visual design & UX direction

- Locked palette: dark navy `#0B1220`, white base, and electric blue `#2F6BFF`.
- Space Grotesk for headings and Inter for body text; use large, high-contrast headings.
- Subtle grid/circuit-line motifs are appropriate; avoid stock-photo clichés and generic gradients.
- Prefer rounded cards, soft shadows, a sticky header with CTA, and a sticky mobile “Call now” bar with large tap targets.
- Mobile-first responsive behavior, accessible focus/contrast, and scroll-reveal animation that respects reduced-motion preferences.
- Existing cursor enhancement: isolated `NetworkCursor` component mounted once at the app root, replacing the prior cursor effect. It uses a fixed, pointer-events-free canvas for the cable and inline SVG for the RJ45 plug.
- Custom cursor behavior is desktop-only: native cursor remains on touch/coarse-pointer devices, text inputs/textareas, and when the pointer leaves the window. RTL and LTR layouts do not affect it.
- Cursor implementation supports DPR-aware resizing, a single animation loop, visibility pausing, listener cleanup, reduced-motion fallback, hover feedback, click pulse, and a 26-segment flexible cable.
- Cursor cable styling uses deep emerald `#1F3D36` with a champagne `#C8A15A` highlight; the plug has gold contacts, translucent clip, rotation toward movement, hover scaling, and LED feedback.
- Keep interactions non-blocking: no interception of clicks, scrolling, or text entry.

## Decisions, constraints & rationale

- Scope covers Home, Cameras, VoIP, Network, Pricing, Case Studies, About, and Contact; no blog, login, shop, or unrelated feature areas.
- Stack remains React + Vite + TypeScript + Tailwind, with Motion only where already present; no new dependencies.
- Use the `@/` path alias for project imports.
- Hash-based routing is implemented in-house rather than adding a router dependency.
- Contact submissions persist to Supabase with validation, RLS, and success/error states.
- Each page should have one H1, page-specific metadata/Open Graph data, and LocalBusiness JSON-LD.
- Shared patterns include SEO and scroll-reveal hooks, SectionHeading, CTAButton, FAQ accordion, and data-driven service pages.
- Performance goals: Lighthouse Performance 90+, Accessibility 95+, SEO 100; lazy-load and compress imagery.
- Cursor files currently changed: `src/components/NetworkCursor.tsx`, `src/App.tsx`, and `src/index.css`.
- Cursor CSS is scoped so `cursor: none` applies only where the custom cursor is active, allowing native text cursors and fallback behavior.
- TypeScript, production build, and diagnostics passed after the cursor implementation. Visual browser testing was unavailable, so manual desktop/RTL/LTR validation remains useful.

## Open questions & assumptions

- Final values are still needed for phone number, city/region, CTA text, pricing, bio, testimonials, and case-study metrics; placeholders remain `[BRACKETED]`.
- English is currently assumed; Persian/RTL compatibility is required for the cursor, but the site’s final language strategy is not confirmed.
- Supabase URL and anon key are assumed to be configured in the environment.
- Confirm whether the old `CursorGlow` component has any remaining references or can be removed after visual QA.
- Validate cursor feel and accessibility on real desktop browsers, including hoverable controls, inputs, window exit/re-entry, reduced motion, hidden tabs, high-DPR displays, RTL, and coarse-pointer devices.