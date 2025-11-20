# Cloudflare R2 Configuration - CYAss Project

**Last Updated**: November 20, 2025
**Status**: ✅ ACTIVE AND CONFIGURED

---

## Overview

CYAss uses **Cloudflare R2** for photo and PDF storage in production/alpha. This provides:
- **Free tier**: 10GB storage, unlimited bandwidth
- **Cost savings**: ~$169,000 over 5 years vs Supabase Enterprise
- **S3-compatible**: Easy migration to other providers if needed

## Current Setup

### R2 Bucket Details
- **Bucket Name**: `cyass-storage`
- **Location**: Western Europe (WEUR)
- **Created**: November 20, 2025
- **Public URL**: https://pub-fda1f49e641543818793e1203550252d.r2.dev
- **S3 Endpoint**: https://43bd52aabd1bab126c7c70aaac79dbca.r2.cloudflarestorage.com

### Account Information
- **Cloudflare Account ID**: `43bd52aabd1bab126c7c70aaac79dbca`
- **Account Email**: george@interon.co.za
- **R2 Dashboard**: https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/overview

---

## Configuration Files

### 1. Local Development (.env.local)

File: `app/client/.env.local` (⚠️ GITIGNORED - Never commit this file!)

```env
# Cloudflare R2 Storage Configuration
VITE_R2_ACCOUNT_ID=43bd52aabd1bab126c7c70aaac79dbca
VITE_R2_ACCESS_KEY_ID=a4e4bfc124723f8f01587c475ed2d37e
VITE_R2_SECRET_ACCESS_KEY=cc7de5a86b662c1b3246f1b73a50628d7c85586f35a6de3ba278524205bdfe78
VITE_R2_BUCKET_NAME=cyass-storage
VITE_R2_PUBLIC_URL=https://pub-fda1f49e641543818793e1203550252d.r2.dev
```

### 2. Netlify Production Environment Variables

**Location**: https://app.netlify.com/sites/cyass-demo/settings/env

**Variables to configure:**

| Variable Name | Value | Scope |
|---------------|-------|-------|
| `VITE_R2_ACCOUNT_ID` | `43bd52aabd1bab126c7c70aaac79dbca` | All scopes |
| `VITE_R2_ACCESS_KEY_ID` | `a4e4bfc124723f8f01587c475ed2d37e` | All scopes |
| `VITE_R2_SECRET_ACCESS_KEY` | `cc7de5a86b662c1b3246f1b73a50628d7c85586f35a6de3ba278524205bdfe78` | All scopes |
| `VITE_R2_BUCKET_NAME` | `cyass-storage` | All scopes |
| `VITE_R2_PUBLIC_URL` | `https://pub-fda1f49e641543818793e1203550252d.r2.dev` | All scopes |

---

## API Credentials

### R2 API Token Details
- **Token Name**: CYAss Production
- **Permissions**: Object Read & Write
- **Bucket Scope**: `cyass-storage`
- **TTL**: Forever
- **Created**: November 20, 2025

**Manage Tokens**: https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/api-tokens

### Credentials (SECURE)
```
Access Key ID: a4e4bfc124723f8f01587c475ed2d37e
Secret Access Key: cc7de5a86b662c1b3246f1b73a50628d7c85586f35a6de3ba278524205bdfe78
```

**⚠️ SECURITY NOTE**:
- These credentials are stored in `.env.local` (gitignored)
- Same credentials configured in Netlify environment variables
- Never commit credentials to git
- Rotate credentials if exposed

---

## How It Works

### Storage Architecture
```
┌─────────────────────────────────────────┐
│ CYAss Application                       │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Storage Service (storage.ts)    │   │
│  └────────────┬────────────────────┘   │
│               │                         │
│               ├─ R2 Configured?         │
│               │                         │
│      YES ─────┤                         │
│               │                         │
│  ┌────────────▼──────────────────┐     │
│  │ R2 Storage (r2-storage.ts)   │     │
│  │ - Uses @aws-sdk/client-s3     │     │
│  │ - S3-compatible API           │     │
│  └────────────┬──────────────────┘     │
│               │                         │
│               ▼                         │
│    Cloudflare R2 Bucket                │
│    └─ cyass-storage                    │
│                                         │
│      NO ──────┤                         │
│               │                         │
│  ┌────────────▼──────────────────┐     │
│  │ Supabase Storage (fallback)  │     │
│  │ - Uses @supabase/supabase-js  │     │
│  └───────────────────────────────┘     │
└─────────────────────────────────────────┘
```

### File Upload Flow
1. User captures photo in app
2. Image compressed (1200px max, 80% quality)
3. `storage.ts` checks if R2 configured
4. If YES: `r2-storage.ts` uploads to R2 bucket
5. Returns public URL: `https://pub-xxxxx.r2.dev/{userId}/{reportId}/{itemId}/{timestamp}.jpg`
6. URL saved to Supabase database
7. PDF generation uses public URLs for images

### Storage Path Structure
```
cyass-storage/
└── {userId}/
    └── {reportId}/
        └── {itemId}/
            ├── 1732088400000.jpg
            ├── 1732088401000.jpg
            └── 1732088402000.jpg
```

---

## Testing

### ⚠️ CRITICAL: Configure CORS First

**Before testing uploads**, configure CORS policy (see Troubleshooting section above).

Without CORS:
- ❌ Photo uploads will fail with CORS error
- ❌ Video uploads will fail with CORS error
- ❌ You'll see: `"Access to fetch...blocked by CORS policy"`

### Local Testing

1. **Ensure R2 credentials in `.env.local`** (already done)
2. **Configure CORS in R2 bucket** (see Troubleshooting section)
3. **Restart dev server**:
   ```bash
   cd app/client
   npm run dev
   ```
4. **Check browser console** - Should see:
   ```
   Storage: Using Cloudflare R2
   ```
5. **Create property and upload photo**
6. **Verify in console**:
   ```
   R2: Upload successful, public URL: https://pub-fda1f49e641543818793e1203550252d.r2.dev/...
   ```
7. **Test video upload** (if video feature enabled)
8. **Check for CORS errors** - Should be none

### Production Testing (Netlify)

1. **Configure CORS in R2 bucket** (CRITICAL - do this first!)
2. **Add R2 env vars to Netlify** (see above)
3. **Deploy to production** (push to GitHub main branch)
4. **Open**: https://app.cyass.co.za (or https://cyass-demo.netlify.app)
5. **Hard refresh**: `Ctrl+Shift+R` to clear cache
6. **Check browser console**: Should show "Using Cloudflare R2"
7. **Upload test photo**
8. **Upload test video** (if video feature enabled)
9. **Verify in R2 dashboard**: https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/buckets/cyass-storage
10. **Check for CORS errors in console** - Should be none

---

## Monitoring & Usage

### R2 Dashboard
**View Usage**: https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/overview

**Metrics to Monitor**:
- **Storage Used**: Should be < 10GB for free tier
- **Class A Operations**: Writes (1M free/month)
- **Class B Operations**: Reads (10M free/month)

### Expected Usage (Alpha - 200 reports/month)
- **Storage**: ~2GB/month (cumulative)
- **Writes**: ~6,000/month
- **Reads**: ~600,000/month

**All well under free tier limits!** ✅

### Set Up Alerts

1. Go to: https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/notifications
2. Click **"Add"** under R2 Storage Threshold
3. Set threshold: **8GB (80% of free tier)**
4. Add email: george@interon.co.za
5. Save

---

## Troubleshooting

### Issue: "Storage: Using Supabase Storage" instead of R2

**Cause**: R2 not configured or env vars not loaded

**Fix**:
1. Check `.env.local` has all 5 R2 variables
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: Upload fails with 403 Forbidden

**Cause**: API token permissions issue

**Fix**:
1. Go to R2 API Tokens: https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/api-tokens
2. Verify token has "Object Read & Write" permission
3. Verify token is scoped to `cyass-storage` bucket
4. Regenerate token if needed

### Issue: Images/Videos don't upload or display (CORS error)

**Cause**: CORS policy not configured

**Fix**:
1. Go to bucket settings: https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/buckets/cyass-storage
2. Click **"Settings"** tab → Scroll to **"CORS Policy"** section
3. Click **"Add CORS Policy"** (or Edit if exists)
4. Add this policy:
```json
[
  {
    "AllowedOrigins": [
      "https://cyass-demo.netlify.app",
      "https://app.cyass.co.za",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

**Important**:
- `PUT` method is **required** for video uploads
- `https://cyass-demo.netlify.app` is your Netlify domain
- `https://app.cyass.co.za` is your custom domain
- Include all localhost ports for development
- `ExposeHeaders: ["ETag"]` allows AWS SDK to read upload confirmations

---

## Cost Monitoring

### Free Tier Limits
- **Storage**: 10GB/month - FREE
- **Egress (bandwidth)**: Unlimited - FREE forever
- **Class A operations** (writes): 1M/month - FREE
- **Class B operations** (reads): 10M/month - FREE

### When You'll Exceed Free Tier
- **Storage**: ~5 months at current rate (2GB/month)
- **Operations**: Never (well under limits)

### Paid Tier Pricing (after 10GB)
- **Storage**: $0.015/GB/month (~$1.50 for 100GB)
- **Egress**: $0 (always free!)
- **Class A ops**: $4.50 per million
- **Class B ops**: $0.36 per million

### Cost Projection
- **Year 1**: $0-15/month
- **Year 5**: ~$10/month
- **5-year total**: ~$270

**Compare to Supabase Enterprise: ~$180,000!** 💰

---

## Security Best Practices

1. ✅ **Never commit .env.local** - Already gitignored
2. ✅ **Rotate credentials every 6-12 months**
3. ✅ **Use separate tokens for dev/staging/production** (optional)
4. ✅ **Limit token scope to specific bucket**
5. ✅ **Enable 2FA on Cloudflare account**
6. ✅ **Monitor access logs for suspicious activity**

### Rotating Credentials

**When to rotate**:
- Every 6-12 months (routine)
- After team member leaves
- If credentials potentially exposed

**How to rotate**:
1. Create new API token (same permissions)
2. Update `.env.local` with new credentials
3. Update Netlify environment variables
4. Deploy new build
5. Delete old API token after verification

---

## Backup & Disaster Recovery

### Data Backup Strategy

**R2 Storage**:
- Cloudflare handles redundancy automatically
- Data stored across multiple data centers
- 99.9% durability guarantee

**Database (Supabase)**:
- URLs stored in PostgreSQL
- Supabase handles automatic backups
- Point-in-time recovery available

### Disaster Recovery Plan

**Scenario 1: R2 Becomes Unavailable**
1. App automatically falls back to Supabase Storage
2. New uploads go to Supabase
3. Old R2 URLs continue working (cached by browsers)

**Scenario 2: Need to Migrate Away from R2**
1. Set up new storage (DO Spaces, Azure, etc.)
2. Copy all files from R2 to new storage
3. Update database URLs (SQL UPDATE query)
4. Change environment variables
5. Deploy

**Scenario 3: Credentials Compromised**
1. Immediately delete compromised API token
2. Create new token
3. Update env vars and redeploy
4. Review R2 access logs

---

## Migration Path (Future)

### Current Setup (Alpha)
- Supabase: Database + Auth
- Cloudflare R2: Photos + PDFs

### Future Options

**Option A: Keep R2 Forever**
- Most cost-effective
- Scales well
- No changes needed

**Option B: Migrate to DigitalOcean Spaces**
- If R2 issues persist
- $5/month for 250GB
- Easy migration (same S3 API)

**Option C: Migrate to Azure Blob**
- If Azure credits available
- Requires code changes (different API)
- More expensive

**Option D: Self-hosted MinIO**
- Full control
- S3-compatible
- Requires server management

---

## Development Guide for Future Developers

### Understanding the Storage System

**Key Files**:
- `app/client/src/services/storage.ts` - Main storage service
- `app/client/src/services/r2-storage.ts` - R2-specific implementation
- `app/client/src/services/supabase.ts` - Supabase client
- `app/client/src/components/ItemInspection.tsx` - Photo upload UI

**How to Add New Storage Provider**:

1. Create new service file (e.g., `azure-storage.ts`)
2. Implement required methods:
   ```typescript
   async uploadPhoto(file: File, reportId: string, itemId: string): Promise<string>
   async uploadPDF(file: Blob, reportId: string): Promise<string>
   async getExternalImageUrl(imageUrl: string): Promise<string>
   async compressImage(file: File): Promise<File>
   isConfigured(): boolean
   ```
3. Update `storage.ts` to check for new provider
4. Add environment variables
5. Test locally then deploy

### Running with Different Storage Backends

**Supabase Only** (default fallback):
```bash
# Remove or comment out R2 env vars in .env.local
npm run dev
```

**R2** (current production setup):
```bash
# Ensure R2 env vars in .env.local
npm run dev
```

**Testing Storage Switch**:
```bash
# Test Supabase fallback
npm run dev  # with R2 vars removed

# Test R2
npm run dev  # with R2 vars present
```

### Common Development Tasks

**View current storage being used**:
- Check browser console on page load
- Should see: "Storage: Using Cloudflare R2" or "Storage: Using Supabase Storage"

**Test photo upload**:
1. Create property
2. Start inspection
3. Upload photo
4. Check console for upload success
5. Verify URL in database

**Generate test PDF**:
1. Complete inspection
2. Generate PDF
3. Verify images are clickable
4. Check image URLs point to R2

---

## Support & Resources

### Documentation
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/
- **AWS SDK for S3**: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/

### Internal Documentation
- `CLOUDFLARE_R2_SETUP.md` - Setup guide
- `README.md` - Project overview
- `.claude/CLAUDE.md` - Development guidelines
- `.claude/protected-code.md` - Protected code areas

### Contact
- **Email**: george@interon.co.za
- **Cloudflare Support**: https://dash.cloudflare.com/support
- **GitHub Issues**: https://github.com/Selmorand/cyass/issues

---

## Changelog

### November 20, 2025 - Initial R2 Setup
- Created R2 bucket `cyass-storage`
- Enabled public access via R2.dev subdomain
- Generated API credentials
- Configured local and Netlify environments
- Implemented R2 storage service
- Updated fallback logic

---

**Document Status**: ✅ Complete and up-to-date
**Next Review**: May 2026 (6 months)
