-- Check which tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
  'user_profiles', 'properties', 'reports', 'rooms', 'inspection_items'
);

-- Check storage buckets
SELECT name FROM storage.buckets WHERE name IN ('property-photos', 'report-pdfs');