-- Add property type, unit number, and complex name fields
-- Run this in Supabase SQL Editor

-- Add new columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN (
  'House', 
  'Townhouse', 
  'Flat',
  'Cluster',
  'Cottage',
  'Granny Flat',
  'Other'
)),
ADD COLUMN IF NOT EXISTS unit_number TEXT,
ADD COLUMN IF NOT EXISTS complex_name TEXT,
ADD COLUMN IF NOT EXISTS estate_name TEXT;

-- Set default property type for existing properties
UPDATE properties 
SET property_type = 'House' 
WHERE property_type IS NULL;

-- Make property_type required for new entries
ALTER TABLE properties 
ALTER COLUMN property_type SET NOT NULL,
ALTER COLUMN property_type SET DEFAULT 'House';

-- Verify the changes
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'properties'
AND column_name IN ('property_type', 'unit_number', 'complex_name', 'estate_name')
ORDER BY column_name;