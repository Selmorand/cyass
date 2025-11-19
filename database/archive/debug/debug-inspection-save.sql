-- Debug script to check why inspection items can't be saved
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check current user
SELECT auth.uid() as current_user_id;

-- 2. Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE id = auth.uid();

-- 3. Check user's reports
SELECT r.id, r.title, r.status, r.user_id, r.property_id
FROM reports r
WHERE r.user_id = auth.uid()
ORDER BY r.created_at DESC
LIMIT 5;

-- 4. Check rooms for user's reports  
SELECT 
  rm.id as room_id, 
  rm.name as room_name, 
  rm.type as room_type,
  r.id as report_id,
  r.title as report_title,
  r.user_id
FROM rooms rm
JOIN reports r ON r.id = rm.report_id
WHERE r.user_id = auth.uid()
ORDER BY rm.created_at DESC
LIMIT 10;

-- 5. Check existing inspection items
SELECT 
  ii.id,
  ii.category_id,
  ii.condition,
  rm.name as room_name,
  r.title as report_title,
  r.user_id
FROM inspection_items ii
JOIN rooms rm ON rm.id = ii.room_id
JOIN reports r ON r.id = rm.report_id
WHERE r.user_id = auth.uid()
LIMIT 10;

-- 6. Test the RLS policy directly
-- Replace the UUIDs below with actual values from your app's console logs
-- This simulates what happens when the app tries to insert

-- First, get a room_id from a report you own
WITH test_room AS (
  SELECT rm.id 
  FROM rooms rm
  JOIN reports r ON r.id = rm.report_id
  WHERE r.user_id = auth.uid()
  LIMIT 1
)
SELECT 
  'Can insert to this room?' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = (SELECT id FROM test_room)
      AND reports.user_id = auth.uid()
    ) THEN 'YES - Policy should allow insert'
    ELSE 'NO - Policy will block insert'
  END as result,
  (SELECT id FROM test_room) as room_id;

-- 7. Check all RLS policies for inspection_items
SELECT 
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'inspection_items'
AND schemaname = 'public';

-- 8. Check if there are any conflicting policies
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('rooms', 'inspection_items', 'reports')
ORDER BY tablename, policyname;