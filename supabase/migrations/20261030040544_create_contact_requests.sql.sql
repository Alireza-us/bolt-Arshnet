/*
# Create contact_requests table (single-tenant, no auth)

1. New Tables
- `contact_requests`
- `id` (uuid, primary key)
- `name` (text, not null) — full name of the person contacting Arshnet
- `phone` (text, not null) — contact phone number
- `email` (text, not null) — contact email address
- `service` (text, not null) — which service they're interested in (cameras/voip/network/other)
- `message` (text, not null) — the message they typed
- `status` (text, default 'new') — tracking label for Arshnet to manage leads
- `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `contact_requests`.
- Grant INSERT to `anon, authenticated` so visitors can submit the contact form without signing in.
- Grant SELECT/UPDATE/DELETE to `authenticated` only (Arshnet owner) — not to anon — so submitted leads are not publicly readable.
- Allow anyone (anon + authenticated) to INSERT new contact requests (intentionally public submission).
- Only allow authenticated users to SELECT/UPDATE/DELETE requests (Arshnet managing leads). No anon read.
*/

CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  service text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON contact_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON contact_requests TO authenticated;

DROP POLICY IF EXISTS "anyone_can_submit_contact" ON contact_requests;
CREATE POLICY "anyone_can_submit_contact"
ON contact_requests FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_can_manage_contact" ON contact_requests;
CREATE POLICY "auth_can_manage_contact"
ON contact_requests FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_contact" ON contact_requests;
CREATE POLICY "auth_update_contact"
ON contact_requests FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_contact" ON contact_requests;
CREATE POLICY "auth_delete_contact"
ON contact_requests FOR DELETE
TO authenticated USING (true);
