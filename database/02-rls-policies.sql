-- CYAss Row Level Security (RLS) Policies
-- Run this AFTER 01-schema.sql
--
-- These policies ensure users can only access their own data.
-- RLS provides database-level security isolation between users.

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USER PROFILES POLICIES
-- =============================================================================

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- PROPERTIES POLICIES
-- =============================================================================

CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- REPORTS POLICIES
-- =============================================================================

CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- ROOMS POLICIES (access through report ownership)
-- =============================================================================

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

-- =============================================================================
-- INSPECTION ITEMS POLICIES (access through room/report ownership)
-- =============================================================================

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

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify policies were created
SELECT
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'properties', 'reports', 'rooms', 'inspection_items')
ORDER BY tablename, policyname;
