
-- Drop open table policies
DROP POLICY IF EXISTS open_select ON public.campaigns;
DROP POLICY IF EXISTS open_insert ON public.campaigns;
DROP POLICY IF EXISTS open_update ON public.campaigns;
DROP POLICY IF EXISTS open_delete ON public.campaigns;

DROP POLICY IF EXISTS open_select ON public.campaign_assets;
DROP POLICY IF EXISTS open_insert ON public.campaign_assets;
DROP POLICY IF EXISTS open_update ON public.campaign_assets;
DROP POLICY IF EXISTS open_delete ON public.campaign_assets;

DROP POLICY IF EXISTS open_select ON public.creative_briefs;
DROP POLICY IF EXISTS open_insert ON public.creative_briefs;
DROP POLICY IF EXISTS open_update ON public.creative_briefs;
DROP POLICY IF EXISTS open_delete ON public.creative_briefs;

DROP POLICY IF EXISTS open_select ON public.variants;
DROP POLICY IF EXISTS open_insert ON public.variants;
DROP POLICY IF EXISTS open_update ON public.variants;
DROP POLICY IF EXISTS open_delete ON public.variants;

DROP POLICY IF EXISTS open_select ON public.director_messages;
DROP POLICY IF EXISTS open_insert ON public.director_messages;

-- Ensure RLS is on (denies all without policies)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_messages ENABLE ROW LEVEL SECURITY;

-- Revoke Data API access from anon/authenticated; service_role keeps full access
REVOKE ALL ON public.campaigns FROM anon, authenticated;
REVOKE ALL ON public.campaign_assets FROM anon, authenticated;
REVOKE ALL ON public.creative_briefs FROM anon, authenticated;
REVOKE ALL ON public.variants FROM anon, authenticated;
REVOKE ALL ON public.director_messages FROM anon, authenticated;

GRANT ALL ON public.campaigns TO service_role;
GRANT ALL ON public.campaign_assets TO service_role;
GRANT ALL ON public.creative_briefs TO service_role;
GRANT ALL ON public.variants TO service_role;
GRANT ALL ON public.director_messages TO service_role;

-- Drop open storage policies for both buckets
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (qual LIKE '%campaign-inputs%' OR qual LIKE '%campaign-outputs%'
           OR with_check LIKE '%campaign-inputs%' OR with_check LIKE '%campaign-outputs%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;
