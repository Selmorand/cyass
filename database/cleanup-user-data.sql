-- Clean up ALL data for user: 8ea55571-3ea2-42f6-840a-5e4168ef53fd
-- Run this in Supabase SQL Editor for a clean slate

-- First, show what will be deleted
SELECT 'Data to be deleted:' as info;

SELECT 
  (SELECT COUNT(*) FROM properties WHERE user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd') as properties_count,
  (SELECT COUNT(*) FROM reports WHERE user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd') as reports_count,
  (SELECT COUNT(*) FROM rooms rm JOIN reports r ON r.id = rm.report_id WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd') as rooms_count,
  (SELECT COUNT(*) FROM inspection_items ii JOIN rooms rm ON rm.id = ii.room_id JOIN reports r ON r.id = rm.report_id WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd') as items_count;

-- Delete inspection items first (due to foreign key constraints)
DELETE FROM inspection_items 
WHERE room_id IN (
  SELECT rm.id 
  FROM rooms rm 
  JOIN reports r ON r.id = rm.report_id 
  WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd'
);

-- Delete rooms
DELETE FROM rooms 
WHERE report_id IN (
  SELECT id 
  FROM reports 
  WHERE user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd'
);

-- Delete reports
DELETE FROM reports 
WHERE user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd';

-- Delete properties
DELETE FROM properties 
WHERE user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd';

-- Verify cleanup was successful
SELECT 'After cleanup:' as info;

SELECT 
  (SELECT COUNT(*) FROM properties WHERE user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd') as properties_remaining,
  (SELECT COUNT(*) FROM reports WHERE user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd') as reports_remaining,
  (SELECT COUNT(*) FROM rooms rm JOIN reports r ON r.id = rm.report_id WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd') as rooms_remaining,
  (SELECT COUNT(*) FROM inspection_items ii JOIN rooms rm ON rm.id = ii.room_id JOIN reports r ON r.id = rm.report_id WHERE r.user_id = '8ea55571-3ea2-42f6-840a-5e4168ef53fd') as items_remaining;

SELECT 'Clean slate achieved! All data deleted for user.' as result;