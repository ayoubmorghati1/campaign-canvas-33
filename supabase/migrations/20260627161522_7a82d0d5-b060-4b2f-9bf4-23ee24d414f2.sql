-- Explicit deny policies for storage.objects on private buckets.
-- All legitimate access goes through service_role in server functions.
DROP POLICY IF EXISTS "deny anon campaign-inputs" ON storage.objects;
DROP POLICY IF EXISTS "deny authenticated campaign-inputs" ON storage.objects;
DROP POLICY IF EXISTS "deny anon campaign-outputs" ON storage.objects;
DROP POLICY IF EXISTS "deny authenticated campaign-outputs" ON storage.objects;

CREATE POLICY "deny anon campaign-inputs" ON storage.objects
  AS RESTRICTIVE FOR ALL TO anon
  USING (bucket_id <> 'campaign-inputs')
  WITH CHECK (bucket_id <> 'campaign-inputs');

CREATE POLICY "deny authenticated campaign-inputs" ON storage.objects
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (bucket_id <> 'campaign-inputs')
  WITH CHECK (bucket_id <> 'campaign-inputs');

CREATE POLICY "deny anon campaign-outputs" ON storage.objects
  AS RESTRICTIVE FOR ALL TO anon
  USING (bucket_id <> 'campaign-outputs')
  WITH CHECK (bucket_id <> 'campaign-outputs');

CREATE POLICY "deny authenticated campaign-outputs" ON storage.objects
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (bucket_id <> 'campaign-outputs')
  WITH CHECK (bucket_id <> 'campaign-outputs');