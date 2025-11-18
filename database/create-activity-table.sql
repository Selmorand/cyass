-- Create activity_logs table to track database usage
-- This helps keep Supabase account active and provides usage analytics

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Can be actual user ID or 'system' for heartbeat
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'report_created', 'report_viewed', 'property_created', 'heartbeat', 'inspection_started')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity logs
-- Allow users to read their own activity
CREATE POLICY "activity_logs_select_own" ON activity_logs
  FOR SELECT
  USING (user_id = auth.uid()::text OR user_id = 'system');

-- Allow anyone to insert activity (for heartbeat and tracking)
CREATE POLICY "activity_logs_insert" ON activity_logs
  FOR INSERT
  WITH CHECK (true);

-- Allow system to delete old logs (cleanup)
CREATE POLICY "activity_logs_delete_old" ON activity_logs
  FOR DELETE
  USING (created_at < NOW() - INTERVAL '30 days');

-- Insert initial heartbeat to test table creation
INSERT INTO activity_logs (user_id, activity_type, metadata) 
VALUES ('system', 'heartbeat', '{"message": "Activity tracking initialized"}');

-- Verify the table was created successfully
SELECT 
  'activity_logs table created successfully!' as status,
  COUNT(*) as initial_records
FROM activity_logs;