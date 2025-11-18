# Supabase Storage Setup Instructions

## Quick Fix for "Bucket not found" Error

The application requires two storage buckets in Supabase that need to be created manually.

### Option 1: Manual Setup in Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/sllwsjmsogliwrahjuux/storage/buckets

2. Click "New bucket" and create these two buckets:

#### Bucket 1: property-photos
- **Name**: `property-photos`
- **Public bucket**: ✅ Yes (check this)
- **File size limit**: 10MB
- **Allowed MIME types**: 
  ```
  image/png
  image/jpeg
  image/jpg
  image/gif
  image/webp
  ```

#### Bucket 2: report-pdfs  
- **Name**: `report-pdfs`
- **Public bucket**: ✅ Yes (check this)
- **File size limit**: 50MB
- **Allowed MIME types**:
  ```
  application/pdf
  ```

3. After creating both buckets, refresh your application and try uploading images again.

### Option 2: Use Mock Storage (Development Only)

If you want to use mock storage instead of real Supabase:

1. Rename `.env.local` to `.env.local.backup`
2. The app will automatically use mock storage
3. Images will be stored in memory during your session

### Option 3: SQL Commands (Advanced)

If you have SQL access to your Supabase project, you can run:

```sql
-- Enable storage if not already enabled
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('property-photos', 'property-photos', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']),
  ('report-pdfs', 'report-pdfs', true, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;
```

## Troubleshooting

If you still see errors after creating the buckets:
1. Check that both buckets are set to **public**
2. Verify your Supabase URL and anon key in `.env.local`
3. Clear browser cache and refresh
4. Check browser console for detailed error messages

## Current Status
- ✅ Storage service implementation complete
- ✅ Mock storage fallback available
- ⚠️ Real Supabase buckets need manual creation