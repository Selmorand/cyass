-- Test for specific user: 8ea55571-3ea2-42f6-840a-5e4168ef53fd
-- Run this in Supabase SQL Editor

-- 1. Check if this user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd';

-- 2. Check reports for this specific user
SELECT 
  r.id as report_id,
  r.title,
  r.status,
  r.user_id,
  r.property_id,
  r.created_at
FROM reports r
WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd'
ORDER BY r.created_at DESC;

-- 3. Check rooms for this user's reports
SELECT 
  rm.id as room_id,
  rm.name,
  rm.type,
  rm.report_id,
  r.title as report_title,
  r.user_id
FROM rooms rm
JOIN reports r ON r.id = rm.report_id
WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd'
ORDER BY rm.created_at DESC;

-- 4. Check if there are any inspection items for this user
SELECT 
  ii.id,
  ii.category_id,
  ii.condition,
  rm.id as room_id,
  rm.name as room_name,
  r.id as report_id,
  r.user_id
FROM inspection_items ii
JOIN rooms rm ON rm.id = ii.room_id
JOIN reports r ON r.id = rm.report_id
WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd';

-- 5. Get a sample room ID to test with
WITH user_room AS (
  SELECT rm.id
  FROM rooms rm
  JOIN reports r ON r.id = rm.report_id
  WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd'
  LIMIT 1
)
SELECT 
  'Room to test with:' as info,
  id as room_id
FROM user_room;

-- 6. Check current RLS policies
SELECT 
  tablename,
  policyname,
  cmd,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'inspection_items'
ORDER BY policyname;