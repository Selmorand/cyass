-- Add public read access for reports, properties, rooms, and inspection_items
-- This allows QR code links to work without authentication
-- Run this in Supabase SQL Editor

-- REPORTS: Add public SELECT policy
CREATE POLICY "reports_public_select" ON reports
  FOR SELECT 
  USING (true);  -- Allow anyone to read any report

-- PROPERTIES: Add public SELECT policy  
CREATE POLICY "properties_public_select" ON properties
  FOR SELECT 
  USING (true);  -- Allow anyone to read any property

-- ROOMS: Add public SELECT policy (in addition to existing user-owned policy)
CREATE POLICY "rooms_public_select" ON rooms
  FOR SELECT 
  USING (true);  -- Allow anyone to read any room

-- INSPECTION_ITEMS: Add public SELECT policy (in addition to existing user-owned policy)
CREATE POLICY "inspection_items_public_select" ON inspection_items
  FOR SELECT 
  USING (true);  -- Allow anyone to read any inspection item

-- Verify policies were created
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('reports', 'properties', 'rooms', 'inspection_items')
AND policyname LIKE '%public%'
ORDER BY tablename, policyname;