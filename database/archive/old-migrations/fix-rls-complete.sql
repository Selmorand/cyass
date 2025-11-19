-- Complete RLS Fix - Drop ALL policies and recreate them properly
-- Run this in Supabase SQL Editor

-- STEP 1: Drop ALL existing policies for inspection_items
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'inspection_items' 
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON inspection_items', pol.policyname);
  END LOOP;
END $$;

-- STEP 2: Drop ALL existing policies for rooms
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'rooms' 
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON rooms', pol.policyname);
  END LOOP;
END $$;

-- STEP 3: Create new, simplified policies for rooms
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "rooms_insert" ON rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "rooms_update" ON rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "rooms_delete" ON rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

-- STEP 4: Create new, simplified policies for inspection_items
CREATE POLICY "inspection_items_select" ON inspection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "inspection_items_insert" ON inspection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "inspection_items_update" ON inspection_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 
      FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "inspection_items_delete" ON inspection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 
      FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

-- STEP 5: Verify the new policies are in place
SELECT 
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('rooms', 'inspection_items')
ORDER BY tablename, policyname;

-- STEP 6: Test if the policy works for current user
WITH user_report AS (
  SELECT r.id as report_id
  FROM reports r
  WHERE r.user_id = auth.uid()
  LIMIT 1
),
user_room AS (
  SELECT rm.id as room_id
  FROM rooms rm
  WHERE rm.report_id = (SELECT report_id FROM user_report)
  LIMIT 1
)
SELECT 
  'Test Results:' as test,
  auth.uid() as current_user,
  (SELECT report_id FROM user_report) as sample_report_id,
  (SELECT room_id FROM user_room) as sample_room_id,
  CASE 
    WHEN (SELECT room_id FROM user_room) IS NOT NULL 
    THEN 'SUCCESS - Found room owned by user'
    ELSE 'FAILURE - No rooms found for user'
  END as result;