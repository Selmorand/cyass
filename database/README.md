# CYAss Database Setup

This folder contains the SQL migration files for setting up the CYAss database in Supabase.

## Quick Start

Run these files **in order** in your Supabase SQL Editor:

1. **`01-schema.sql`** - Core database schema (tables, indexes, triggers)
2. **`02-rls-policies.sql`** - Row Level Security policies
3. **`03-activity-logs.sql`** - Activity logging table
4. **`04-storage-buckets.sql`** - Storage buckets and policies

## Migration Files

### 01-schema.sql
**Core database schema**
- Creates all main tables: user_profiles, properties, reports, rooms, inspection_items
- Includes all columns with proper constraints
- Property types: House, Townhouse, Flat, Cluster, Cottage, Granny Flat, Other
- Room types: Standard, Bathroom, Kitchen, Patio, Outbuilding, Exterior, SpecialFeatures
- Creates indexes for performance
- Sets up triggers for automatic user profile creation

### 02-rls-policies.sql
**Row Level Security (RLS) policies**
- Enables RLS on all tables
- Creates policies ensuring users can only access their own data
- Nested policies for rooms (through reports) and inspection_items (through rooms)
- Critical for multi-tenant data isolation

### 03-activity-logs.sql
**Activity tracking**
- Creates activity_logs table for usage analytics
- Tracks: login, report_created, property_created, heartbeat, etc.
- Automatic cleanup of logs older than 30 days
- Helps keep Supabase account active

### 04-storage-buckets.sql
**⚠️ PROTECTED - Do not modify**
- Creates `property-photos` bucket (public, for inspection photos)
- Creates `reports` bucket (public, for PDF files)
- Storage policies enforce user isolation
- Application code depends on these exact names

## Important Notes

### First Time Setup
If this is a fresh Supabase project, run all files in order (01-04).

### Existing Database
If your database is already set up:
- You can run individual files to add missing features
- Files use `IF NOT EXISTS` and `ON CONFLICT` to prevent errors
- Always check Supabase console after running to verify success

### Protected Areas
**NEVER modify these without explicit permission:**
- Bucket names (`property-photos`, `reports`)
- Storage path structure
- Room type enum values
- RLS policy logic for rooms and inspection_items

## Verification

After running the migrations, verify success:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'properties', 'reports', 'rooms', 'inspection_items', 'activity_logs');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'properties', 'reports', 'rooms', 'inspection_items', 'activity_logs');

-- Check storage buckets
SELECT id, name, public FROM storage.buckets;
```

## Troubleshooting

### "relation already exists" error
This is safe to ignore if the table was already created. The scripts use `IF NOT EXISTS` to handle this.

### "policy already exists" error
Drop the existing policy first:
```sql
DROP POLICY "policy_name" ON table_name;
```
Then re-run the migration.

### RLS blocking inserts
Check if you're authenticated:
```sql
SELECT auth.uid();  -- Should return your user UUID
```

## Archive Folder

The `archive/` folder contains old migration files and debug scripts that are no longer needed but kept for reference:
- `debug/` - Diagnostic scripts
- `temporary-fixes/` - One-time fixes that are now consolidated
- `old-migrations/` - Superseded migration files

**Do not use files from the archive folder** - they may conflict with the current schema.

## Support

For issues:
1. Check the verification queries above
2. Review Supabase logs in the dashboard
3. Check `.env.local` has correct credentials
4. Ensure you're running migrations as the authenticated user (not service role)
