# Supabase Storage Policies Setup

## The Problem
Your buckets exist but uploads are failing because storage policies aren't configured. Supabase requires explicit policies to allow users to upload, download, and delete files.

## Quick Fix - Add Storage Policies

### Step 1: Go to Storage Policies
1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/sllwsjmsogliwrahjuux/storage/policies)
2. You should see your two buckets: `property-photos` and `report-pdfs`

### Step 2: Add Policies for property-photos bucket

Click on `property-photos` bucket, then click "New Policy" and add these policies:

#### Policy 1: Allow authenticated uploads
- **Policy Name**: `Allow authenticated uploads`
- **Allowed operations**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(auth.uid() IS NOT NULL)
```

#### Policy 2: Allow authenticated reads
- **Policy Name**: `Allow public reads`  
- **Allowed operations**: `SELECT`
- **Target roles**: `authenticated`, `anon`
- **Policy definition**:
```sql
true
```

#### Policy 3: Allow users to update their own files
- **Policy Name**: `Allow users to update own files`
- **Allowed operations**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(auth.uid() = (storage.foldername(name))[1])
```

#### Policy 4: Allow users to delete their own files
- **Policy Name**: `Allow users to delete own files`
- **Allowed operations**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(auth.uid() = (storage.foldername(name))[1])
```

### Step 3: Add Policies for report-pdfs bucket

Repeat the same policies for the `report-pdfs` bucket.

### Alternative: Quick Setup SQL

If you have SQL Editor access, run this script:

```sql
-- Policies for property-photos bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-photos');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'property-photos');

CREATE POLICY "Allow users to update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'property-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policies for report-pdfs bucket  
CREATE POLICY "Allow authenticated pdf uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'report-pdfs');

CREATE POLICY "Allow public pdf reads" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'report-pdfs');

CREATE POLICY "Allow users to update own pdfs" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'report-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete own pdfs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'report-pdfs' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## For Development/Testing (Less Secure)

If you just want to test quickly, you can create a single permissive policy:

1. Go to each bucket's policies
2. Create a new policy called "Allow all for testing"
3. Check all operations: SELECT, INSERT, UPDATE, DELETE
4. Target roles: `authenticated`, `anon`
5. Policy definition: `true`

⚠️ **Warning**: This allows anyone to upload/delete files. Only use for testing!

## After Adding Policies

1. Save the policies
2. Go back to http://localhost:5174/test-storage
3. Run the test again
4. All four tests should now pass ✅

## Troubleshooting

If uploads still fail after adding policies:
1. Check that your user is authenticated (the app should handle this)
2. Verify the bucket names are exactly `property-photos` and `report-pdfs`
3. Make sure the buckets are set to PUBLIC
4. Clear your browser cache and try again
5. Check the browser console for specific error messages