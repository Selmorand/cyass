-- Fix RLS policies for inspection_items table
-- Run this in Supabase SQL Editor to fix the "row-level security policy" error

-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Users can manage inspection items of own reports" ON inspection_items;

-- Create separate policies for INSERT, UPDATE, and DELETE operations
-- This is more explicit and works better with Supabase RLS

-- Policy for INSERT operations
CREATE POLICY "Users can insert inspection items in own reports" ON inspection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

-- Policy for UPDATE operations
CREATE POLICY "Users can update inspection items in own reports" ON inspection_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

-- Policy for DELETE operations
CREATE POLICY "Users can delete inspection items in own reports" ON inspection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id 
      AND reports.user_id = auth.uid()
    )
  );

-- Also fix the rooms policies for better clarity
DROP POLICY IF EXISTS "Users can manage rooms of own reports" ON rooms;

-- Create separate policies for rooms INSERT, UPDATE, DELETE
CREATE POLICY "Users can insert rooms in own reports" ON rooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rooms in own reports" ON rooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rooms in own reports" ON rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reports 
      WHERE reports.id = rooms.report_id 
      AND reports.user_id = auth.uid()
    )
  );

-- Verify the policies are in place
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('rooms', 'inspection_items')
ORDER BY tablename, policyname;