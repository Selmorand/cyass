-- Add video support to rooms table
-- Run this in Supabase SQL Editor after existing migrations

-- Add video columns to rooms table
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_duration INTEGER,  -- duration in seconds
ADD COLUMN IF NOT EXISTS video_size INTEGER;      -- file size in bytes

-- Add comment to document the feature
COMMENT ON COLUMN rooms.video_url IS 'Optional room walkthrough video URL (R2 or Supabase Storage)';
COMMENT ON COLUMN rooms.video_duration IS 'Video duration in seconds (max 120 for 2 minutes)';
COMMENT ON COLUMN rooms.video_size IS 'Video file size in bytes (max 50MB)';

-- Verify columns were added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'rooms'
  AND column_name IN ('video_url', 'video_duration', 'video_size')
ORDER BY column_name;
