
-- Campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Untitled campaign',
  brand TEXT NOT NULL DEFAULT 'My Brand',
  status TEXT NOT NULL DEFAULT 'draft', -- draft|analyzing|generating|ready
  voice TEXT NOT NULL DEFAULT 'Editorial',
  freedom INT NOT NULL DEFAULT 60,
  platforms TEXT[] NOT NULL DEFAULT ARRAY['IG Feed']::TEXT[],
  cover_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO anon, authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_select" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "open_insert" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update" ON public.campaigns FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open_delete" ON public.campaigns FOR DELETE USING (true);

-- Assets uploaded by user (product photos + inspiration references)
CREATE TABLE public.campaign_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, -- 'product' | 'reference'
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime TEXT,
  width INT,
  height INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX campaign_assets_campaign_idx ON public.campaign_assets(campaign_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_assets TO anon, authenticated;
GRANT ALL ON public.campaign_assets TO service_role;
ALTER TABLE public.campaign_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_select" ON public.campaign_assets FOR SELECT USING (true);
CREATE POLICY "open_insert" ON public.campaign_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update" ON public.campaign_assets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open_delete" ON public.campaign_assets FOR DELETE USING (true);

-- Creative brief (AI-written, user-editable)
CREATE TABLE public.creative_briefs (
  campaign_id UUID PRIMARY KEY REFERENCES public.campaigns(id) ON DELETE CASCADE,
  goal TEXT,
  audience TEXT,
  position TEXT,
  mood TEXT,
  color_strategy TEXT,
  visual_direction TEXT,
  palette JSONB,        -- array of hex strings
  references_dna JSONB, -- [{label, weight}]
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creative_briefs TO anon, authenticated;
GRANT ALL ON public.creative_briefs TO service_role;
ALTER TABLE public.creative_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_select" ON public.creative_briefs FOR SELECT USING (true);
CREATE POLICY "open_insert" ON public.creative_briefs FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update" ON public.creative_briefs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open_delete" ON public.creative_briefs FOR DELETE USING (true);

-- Generated variants
CREATE TABLE public.variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  direction_label TEXT NOT NULL,
  title TEXT NOT NULL,
  mood_caption TEXT,
  caption_body TEXT,
  storage_path TEXT,
  public_url TEXT,
  match_score INT,
  reasoning JSONB, -- {why:[...], dna:[{label, weight}]}
  prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX variants_campaign_idx ON public.variants(campaign_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.variants TO anon, authenticated;
GRANT ALL ON public.variants TO service_role;
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_select" ON public.variants FOR SELECT USING (true);
CREATE POLICY "open_insert" ON public.variants FOR INSERT WITH CHECK (true);
CREATE POLICY "open_update" ON public.variants FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "open_delete" ON public.variants FOR DELETE USING (true);

-- Director chat
CREATE TABLE public.director_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX director_messages_campaign_idx ON public.director_messages(campaign_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.director_messages TO anon, authenticated;
GRANT ALL ON public.director_messages TO service_role;
ALTER TABLE public.director_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open_select" ON public.director_messages FOR SELECT USING (true);
CREATE POLICY "open_insert" ON public.director_messages FOR INSERT WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER briefs_updated_at BEFORE UPDATE ON public.creative_briefs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
