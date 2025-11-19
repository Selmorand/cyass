# Cloudflare R2 Setup Guide

This guide walks you through setting up Cloudflare R2 for CYAss photo and PDF storage.

## Why Cloudflare R2?

**Cost Comparison (5-year projection for 20 agencies @ 10 tests/month):**
- Supabase Enterprise: ~$180,000+
- **Cloudflare R2 + Supabase Pro: ~$11,000** ✅

**R2 Free Tier (Perfect for Alpha):**
- 10GB storage/month - FREE
- Unlimited egress (bandwidth) - FREE forever
- 1M writes, 10M reads/month - FREE

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with your email
3. Verify your email address
4. Login to dashboard

## Step 2: Create R2 Bucket

1. From Cloudflare dashboard, click **R2** in the left sidebar
2. Click **Create bucket**
3. Enter bucket name: `cyass-storage` (or your preferred name)
4. Select location: **Automatic** (Cloudflare optimizes globally)
5. Click **Create bucket**

## Step 3: Enable Public Access

1. Click on your newly created bucket
2. Go to **Settings** tab
3. Scroll to **Public access** section
4. Click **Connect domain** OR **Enable R2.dev subdomain**

**Option A: R2.dev Subdomain (Quickest - for Alpha)**
- Click **Allow Access** under R2.dev subdomain
- You'll get a URL like: `https://pub-xxxxxxxxxxxxx.r2.dev`
- Copy this URL (you'll need it for .env)

**Option B: Custom Domain (Production recommended)**
- Click **Connect domain**
- Enter your domain: `cdn.cyass.co.za`
- Follow DNS setup instructions
- Verify domain

## Step 4: Create API Credentials

1. From R2 overview page, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure token:
   - **Token name**: `CYAss Production`
   - **Permissions**:
     - ✅ Object Read & Write
     - ❌ Admin Read & Write (not needed)
   - **Bucket scope**: Select your bucket (`cyass-storage`)
   - **TTL**: Leave as "Forever" (can rotate later)
4. Click **Create API Token**
5. **IMPORTANT**: Copy these values immediately (shown only once):
   - Access Key ID
   - Secret Access Key
   - Jurisdiction-specific endpoint for S3 clients

## Step 5: Get Your Account ID

1. From Cloudflare dashboard, click **R2** in sidebar
2. Look at the URL: `https://dash.cloudflare.com/ACCOUNT_ID/r2/overview`
3. Copy the `ACCOUNT_ID` from the URL
4. Or find it in the right sidebar under "Account ID"

## Step 6: Configure Environment Variables

### Local Development (.env.local)

Add these to `app/client/.env.local`:

```env
# Cloudflare R2 Configuration
VITE_R2_ACCOUNT_ID=your_account_id_here
VITE_R2_ACCESS_KEY_ID=your_access_key_id_here
VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
VITE_R2_BUCKET_NAME=cyass-storage
VITE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

**Example:**
```env
VITE_R2_ACCOUNT_ID=abc123def456
VITE_R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0
VITE_R2_SECRET_ACCESS_KEY=ZXhhbXBsZV9zZWNyZXRfa2V5X2RvX25vdF9zaGFyZQ==
VITE_R2_BUCKET_NAME=cyass-storage
VITE_R2_PUBLIC_URL=https://pub-1234567890ab.r2.dev
```

### Netlify Production Deployment

1. Go to https://app.netlify.com
2. Select your site (app.cyass.co.za)
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** and add each:
   - `VITE_R2_ACCOUNT_ID` = your_account_id
   - `VITE_R2_ACCESS_KEY_ID` = your_access_key_id
   - `VITE_R2_SECRET_ACCESS_KEY` = your_secret_access_key
   - `VITE_R2_BUCKET_NAME` = cyass-storage
   - `VITE_R2_PUBLIC_URL` = https://pub-xxxxx.r2.dev
5. **Important**: Set scope to **All scopes**
6. Click **Save**
7. Trigger a new deploy to apply changes

## Step 7: Verify Configuration

### Local Test

1. Restart your dev server: `npm run dev`
2. Check browser console on page load:
   - Should see: `Storage: Using Cloudflare R2`
   - If you see `Storage: Using Supabase Storage`, R2 config is missing
3. Create a test property and capture a photo
4. Check console for: `R2: Upload successful`
5. Verify photo displays correctly
6. Generate PDF and verify images are linked

### Production Test

1. After deploying to Netlify with R2 env vars
2. Open https://app.cyass.co.za
3. Open browser DevTools → Console
4. Create property and upload photo
5. Verify console shows R2 upload success
6. Check R2 dashboard to see files uploaded

## Storage Behavior

**Automatic Fallback:**
- ✅ **R2 configured**: Uses Cloudflare R2 (production/alpha)
- ❌ **R2 not configured**: Falls back to Supabase Storage (local dev)

**Same Code, Different Storage:**
- Application code unchanged
- Upload paths identical: `{userId}/{reportId}/{itemId}/{timestamp}.jpg`
- URLs stored in database work across both systems

## Monitoring Usage

### R2 Dashboard

1. Go to **R2** → **Your Bucket**
2. View **Metrics** tab:
   - Storage used (out of 10GB free)
   - Class A operations (writes)
   - Class B operations (reads)
3. Set up **Email notifications** for quota warnings

### Alpha Testing Limits

**Expected usage (20 agencies, 10 tests/month):**
- Storage: ~2GB/month (well under 10GB free tier)
- Operations: ~6K writes, ~600K reads (well under free limits)

**Recommendation:** Check dashboard weekly during alpha.

## Troubleshooting

### "R2 is not configured" message

**Issue**: Console shows "Using Supabase Storage" instead of "Using Cloudflare R2"

**Fix**:
1. Check all 5 environment variables are set
2. Verify no typos in variable names (must start with `VITE_`)
3. Restart dev server: `Ctrl+C` then `npm run dev`
4. For Netlify: Verify env vars in dashboard, trigger new deploy

### CORS Errors

**Issue**: Browser blocks R2 image loads with CORS error

**Fix**:
1. Go to R2 bucket → **Settings** → **CORS Policy**
2. Add CORS rule:
```json
[
  {
    "AllowedOrigins": ["https://app.cyass.co.za", "http://localhost:5173", "http://localhost:5174"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```
3. Click **Save**

### Upload Fails with 403 Forbidden

**Issue**: R2 upload fails with permission error

**Fix**:
1. Check API token permissions include "Object Read & Write"
2. Verify API token is scoped to correct bucket
3. Regenerate API token if needed
4. Update environment variables with new credentials

### Photos Don't Display in PDF

**Issue**: PDF generates but photos are broken/missing

**Fix**:
1. Verify public access is enabled on R2 bucket
2. Check browser network tab - are images loading?
3. Test image URL directly in browser
4. Verify `VITE_R2_PUBLIC_URL` ends without trailing slash

## Cost Monitoring

### When You'll Exceed Free Tier

**Storage (10GB free):**
- 10GB = ~1,000 reports @ 10MB each
- At 200 reports/month: **5 months** until paid tier

**Paid Pricing After Free Tier:**
- Storage: $0.015/GB/month (~$1.50 for 100GB)
- Egress: $0 (always free!)

### Setting Up Billing Alerts

1. Go to **Billing** in Cloudflare dashboard
2. Click **Notifications**
3. Enable **R2 Storage Threshold** alert
4. Set threshold: 8GB (80% of free tier)
5. Add email for notifications

## Migration Path

**Current (Alpha):**
- Supabase Free: Database + Auth
- R2 Free: Photos + PDFs

**Beta/Production:**
- Supabase Pro ($25/mo): Database + Auth
- R2 Free/Paid: Photos + PDFs + Videos

**No code changes needed** - same architecture scales to production!

## Security Best Practices

1. ✅ Never commit `.env.local` to git (already in .gitignore)
2. ✅ Rotate API tokens every 6-12 months
3. ✅ Use separate tokens for dev/staging/production
4. ✅ Limit API token scope to specific bucket
5. ✅ Enable 2FA on Cloudflare account
6. ✅ Monitor R2 access logs for suspicious activity

## Support

**Cloudflare R2 Docs:** https://developers.cloudflare.com/r2/
**Cloudflare Community:** https://community.cloudflare.com/

**For CYAss-specific issues:** Check console logs for detailed error messages.
