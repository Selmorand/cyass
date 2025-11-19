-- Check data WITHOUT RLS restrictions
-- Run this in Supabase SQL Editor to see what data exists

-- 1. Check all users in the system
SELECT id, email, created_at 
FROM auth.users
LIMIT 10;

-- 2. Check all reports (bypassing RLS)
SELECT 
  r.id as report_id,
  r.title,
  r.status,
  r.user_id,
  u.email as user_email,
  r.property_id,
  r.created_at
FROM reports r
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY r.created_at DESC
LIMIT 10;

-- 3. Check all rooms (bypassing RLS)
SELECT 
  rm.id as room_id,
  rm.name,
  rm.type,
  rm.report_id,
  r.title as report_title,
  r.user_id,
  u.email as user_email
FROM rooms rm
LEFT JOIN reports r ON r.id = rm.report_id
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY rm.created_at DESC
LIMIT 10;

-- 4. Check all inspection items (bypassing RLS)
SELECT 
  ii.id,
  ii.category_id,
  ii.condition,
  ii.room_id,
  rm.name as room_name,
  r.id as report_id,
  r.title as report_title,
  r.user_id,
  u.email as user_email
FROM inspection_items ii
LEFT JOIN rooms rm ON rm.id = ii.room_id
LEFT JOIN reports r ON r.id = rm.report_id
LEFT JOIN auth.users u ON u.id = r.user_id
ORDER BY ii.created_at DESC
LIMIT 10;

-- 5. Count totals
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM reports) as total_reports,
  (SELECT COUNT(*) FROM rooms) as total_rooms,
  (SELECT COUNT(*) FROM inspection_items) as total_items;