
CREATE POLICY "campaign_inputs_read" ON storage.objects FOR SELECT USING (bucket_id = 'campaign-inputs');
CREATE POLICY "campaign_inputs_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campaign-inputs');
CREATE POLICY "campaign_inputs_update" ON storage.objects FOR UPDATE USING (bucket_id = 'campaign-inputs');
CREATE POLICY "campaign_inputs_delete" ON storage.objects FOR DELETE USING (bucket_id = 'campaign-inputs');

CREATE POLICY "campaign_outputs_read" ON storage.objects FOR SELECT USING (bucket_id = 'campaign-outputs');
CREATE POLICY "campaign_outputs_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campaign-outputs');
CREATE POLICY "campaign_outputs_update" ON storage.objects FOR UPDATE USING (bucket_id = 'campaign-outputs');
CREATE POLICY "campaign_outputs_delete" ON storage.objects FOR DELETE USING (bucket_id = 'campaign-outputs');
