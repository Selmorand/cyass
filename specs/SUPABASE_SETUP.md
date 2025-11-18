# Supabase Setup Guide for CYAss

## Quick Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API

### 2. Configure Environment Variables
Create a `.env` file in the `cyass` directory:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Setup Database Schema
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the entire contents of `supabase/setup.sql`
4. Click "Run" to execute the script

This will create:
- All required tables (users, properties, reports, rooms, inspection_items)
- Custom types for enums
- Row Level Security policies
- Automatic triggers for timestamps
- Indexes for performance

### 4. Enable Authentication
1. Go to Authentication > Providers
2. Enable Email/Password authentication
3. Configure email templates if desired

### 5. Test the Connection
1. Restart your development server: `npm run dev`
2. The app should now connect to your Supabase instance
3. Sign up with a new account to test

## Troubleshooting

### RLS Policy Errors
If you see "row-level security policy" errors:
1. Ensure you're logged in (auth.uid() must exist)
2. Check that the setup.sql script ran successfully
3. Verify RLS is enabled on all tables

### Connection Errors
If the app can't connect:
1. Check your .env file has correct credentials
2. Ensure your Supabase project is active
3. Verify the anon key has proper permissions

### Mock Data Mode
If you don't have Supabase credentials yet, the app will automatically use mock data stored in memory. This is useful for testing but data won't persist between sessions.

## Database Schema

### Tables
- **users**: User profiles linked to auth.users
- **properties**: Property records with addresses and GPS
- **reports**: Inspection reports linked to properties
- **rooms**: Rooms within each report
- **inspection_items**: Individual inspection items per room

### Security
All tables have Row Level Security (RLS) enabled:
- Users can only see/modify their own data
- Cascading relationships ensure data integrity
- Automatic user profile creation on signup

## Next Steps
After setup, you can:
1. Create properties with GPS coordinates
2. Start inspections with room selection
3. Add inspection items with photos
4. Generate PDF reports
5. (Phase 8) Integrate PayFast payments