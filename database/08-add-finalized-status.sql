-- Migration: Add 'finalized' status to reports
-- Run this in Supabase SQL Editor
--
-- This adds support for finalizing reports so they cannot be edited after completion.

-- =============================================================================
-- STEP 1: Add finalized_at column
-- =============================================================================

ALTER TABLE reports
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- STEP 2: Update status CHECK constraint to include 'finalized'
-- =============================================================================

-- Drop the existing check constraint
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;

-- Add new check constraint with 'finalized' option
ALTER TABLE reports
ADD CONSTRAINT reports_status_check
CHECK (status IN ('draft', 'completed', 'finalized', 'paid'));

-- =============================================================================
-- STEP 3: Create index for faster finalized report queries
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_reports_finalized_at ON reports(finalized_at);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT
  'Migration complete!' as status,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'reports'
AND column_name IN ('status', 'finalized_at');
