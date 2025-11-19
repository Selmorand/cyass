-- CYAss Storage Buckets Configuration
-- Run this AFTER 01-schema.sql and 02-rls-policies.sql
--
-- ⚠️ PROTECTED: Do NOT modify bucket names or policies
-- The application code depends on these exact bucket names and structure.

-- =============================================================================
-- CREATE STORAGE BUCKETS
-- =============================================================================

-- Bucket for property inspection photos
-- CRITICAL: Bucket name MUST be 'property-photos' (application depends on this)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for generated PDF reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE POLICIES FOR PROPERTY PHOTOS
-- =============================================================================

-- Allow users to upload their own photos
-- Path structure: {userId}/{reportId}/{itemId}/{timestamp}.jpg
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own photos
CREATE POLICY "Users can view their own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'property-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- STORAGE POLICIES FOR PDF REPORTS
-- =============================================================================

-- Allow users to upload their own PDFs
-- Path structure: {userId}/{reportId}/report-{timestamp}.pdf
CREATE POLICY "Users can upload their own PDFs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own PDFs
CREATE POLICY "Users can view their own PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own PDFs
CREATE POLICY "Users can delete their own PDFs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify buckets were created
SELECT
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE id IN ('property-photos', 'reports');

-- Verify storage policies
SELECT
  policyname,
  CASE
    WHEN policyname LIKE '%photo%' THEN 'property-photos'
    WHEN policyname LIKE '%PDF%' THEN 'reports'
  END as bucket
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY bucket, policyname;
