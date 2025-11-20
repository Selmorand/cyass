-- Create storage bucket for room videos (Supabase fallback)
-- Run this in Supabase SQL Editor
-- This is only needed if not using Cloudflare R2

-- Create room-videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-videos', 'room-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for room-videos bucket
-- Policy 1: Users can upload their own videos
CREATE POLICY "Users can upload their own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'room-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can read their own videos
CREATE POLICY "Users can read their own videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'room-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'room-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'room-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 5: Public read access (for PDF links)
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'room-videos');

-- Verify bucket was created
SELECT
  id,
  name,
  public,
  created_at
FROM storage.buckets
WHERE id = 'room-videos';
