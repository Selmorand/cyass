-- TEMPORARY FIX: Create policies that allow ALL authenticated users
-- WARNING: Only use this for testing! Remove in production!

-- Drop existing policies first
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename
    FROM pg_policies 
    WHERE tablename IN ('inspection_items', 'rooms')
    AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Create PERMISSIVE policies for authenticated users
-- These will work even if user IDs don't match

-- Rooms - Allow all authenticated users (TEMPORARY)
CREATE POLICY "rooms_temp_all_authenticated" ON rooms
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Inspection Items - Allow all authenticated users (TEMPORARY)  
CREATE POLICY "inspection_items_temp_all_authenticated" ON inspection_items
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Verify the policies
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('rooms', 'inspection_items')
ORDER BY tablename, policyname;

-- Test with any authenticated user
SELECT 
  'Policy Test' as test,
  auth.uid() as current_user_id,
  auth.role() as current_role,
  CASE 
    WHEN auth.role() = 'authenticated' THEN 'Policies will ALLOW access'
    WHEN auth.uid() IS NOT NULL THEN 'User detected but not authenticated role'
    ELSE 'No user detected - need to authenticate'
  END as result;