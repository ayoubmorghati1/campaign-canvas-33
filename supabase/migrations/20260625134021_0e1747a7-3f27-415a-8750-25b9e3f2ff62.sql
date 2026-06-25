ALTER TABLE public.variants
  ADD COLUMN parent_variant_id UUID REFERENCES public.variants(id) ON DELETE CASCADE;
CREATE INDEX variants_parent_idx ON public.variants(parent_variant_id);