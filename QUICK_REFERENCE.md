# CYAss Quick Reference

**Project**: CYAss - Property Condition Reporting PWA
**Last Updated**: November 20, 2025

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| **Live App** | https://app.cyass.co.za |
| **GitHub Repo** | https://github.com/Selmorand/cyass |
| **Netlify Dashboard** | https://app.netlify.com/sites/cyass-demo |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/sllwsjmsogliwrahjuux |
| **R2 Dashboard** | https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/overview |

---

## 📁 Key Files & Locations

### Configuration Files
- `app/client/.env.local` - Local development config (⚠️ GITIGNORED)
- `app/client/.env` - Example config template
- `netlify.toml` - Netlify build settings
- `vite.config.ts` - Vite build configuration

### Documentation
- `README.md` - Project overview and setup
- `R2_CONFIGURATION.md` - Complete R2 setup and reference
- `CLOUDFLARE_R2_SETUP.md` - Step-by-step R2 setup guide
- `.claude/CLAUDE.md` - AI assistant guidelines
- `.claude/protected-code.md` - Code areas that must not be modified

### Database
- `database/01-schema.sql` - Complete database schema
- `database/02-rls-policies.sql` - Row Level Security
- `database/03-activity-logs.sql` - Activity tracking
- `database/04-storage-buckets.sql` - Storage bucket setup

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
scripts\setup.bat

# Start dev server (localhost:5173)
scripts\run.bat

# Build for production
scripts\build.bat

# Manual commands
cd app/client
npm install
npm run dev
npm run build
```

---

## 🔐 Credentials & Accounts

### Cloudflare Account
- **Email**: george@interon.co.za
- **Account ID**: `43bd52aabd1bab126c7c70aaac79dbca`
- **Dashboard**: https://dash.cloudflare.com

### R2 Storage
- **Bucket**: `cyass-storage`
- **Public URL**: https://pub-fda1f49e641543818793e1203550252d.r2.dev
- **Credentials**: See `R2_CONFIGURATION.md` or `app/client/.env.local`

### Supabase
- **Project URL**: https://sllwsjmsogliwrahjuux.supabase.co
- **Project ID**: `sllwsjmsogliwrahjuux`
- **Credentials**: See `app/client/.env.local`

### Netlify
- **Site**: cyass-demo
- **Custom Domain**: app.cyass.co.za
- **Deploy**: Auto-deploy from GitHub main branch

---

## 🌍 Environment Variables

### Required for All Environments

```env
# Supabase (Database + Auth)
VITE_SUPABASE_URL=https://sllwsjmsogliwrahjuux.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Cloudflare R2 (Storage - Optional, falls back to Supabase)
VITE_R2_ACCOUNT_ID=43bd52aabd1bab126c7c70aaac79dbca
VITE_R2_ACCESS_KEY_ID=a4e4bfc124723f8f01587c475ed2d37e
VITE_R2_SECRET_ACCESS_KEY=cc7de5a86b662c1b3246f1b73a50628d7c85586f35a6de3ba278524205bdfe78
VITE_R2_BUCKET_NAME=cyass-storage
VITE_R2_PUBLIC_URL=https://pub-fda1f49e641543818793e1203550252d.r2.dev

# Branding
VITE_APP_NAME=SelfProHost
VITE_SUPPORT_EMAIL=support@selprohost.co.za
```

**Configure in**:
- Local: `app/client/.env.local` (gitignored)
- Netlify: https://app.netlify.com/sites/cyass-demo/settings/env

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│          CYAss PWA (React)              │
│         app.cyass.co.za                 │
└──────────┬──────────────────────────────┘
           │
           ├─────────────┬─────────────────┬──────────────┐
           │             │                 │              │
           ▼             ▼                 ▼              ▼
    ┌──────────┐  ┌──────────┐     ┌──────────┐  ┌──────────┐
    │ Supabase │  │    R2    │     │  Netlify │  │  GitHub  │
    │          │  │          │     │          │  │          │
    │ Database │  │  Photos  │     │ Hosting  │  │   Repo   │
    │   Auth   │  │   PDFs   │     │  Build   │  │  Source  │
    └──────────┘  └──────────┘     └──────────┘  └──────────┘
```

---

## 📦 Storage Strategy

### Current Setup
- **R2**: Photos + PDFs (production/alpha)
- **Supabase**: Database + Auth
- **Fallback**: Supabase Storage (if R2 not configured)

### Cost Comparison (5 years)
| Solution | Cost |
|----------|------|
| R2 | $270 |
| Supabase Pro | $1,500 |
| Supabase Enterprise | $180,000 |

---

## 🛠️ Common Tasks

### Deploy to Production
```bash
git add .
git commit -m "Your message"
git push
# Netlify auto-deploys from main branch
```

### Check Current Storage Backend
- Open browser console
- Look for: "Storage: Using Cloudflare R2" or "Storage: Using Supabase Storage"

### Switch Storage Backends
**Use R2** (production):
- Add R2 env vars to `.env.local`
- Restart dev server

**Use Supabase** (fallback):
- Remove R2 env vars from `.env.local`
- Restart dev server

### Test Photo Upload
1. Start dev server: `npm run dev`
2. Create property
3. Start inspection
4. Capture photo
5. Check console for upload success
6. Verify URL in Supabase database

### Rotate R2 Credentials
1. Go to: https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/api-tokens
2. Create new token (same permissions)
3. Update `.env.local` and Netlify env vars
4. Deploy
5. Delete old token

---

## 🔍 Monitoring & Troubleshooting

### Check Storage Usage

**R2**:
- https://dash.cloudflare.com/43bd52aabd1bab126c7c70aaac79dbca/r2/overview
- Monitor: Storage (< 10GB free), Operations

**Supabase**:
- https://supabase.com/dashboard/project/sllwsjmsogliwrahjuux/settings/usage
- Monitor: Database size, Storage, Bandwidth

### Common Issues

| Issue | Solution |
|-------|----------|
| Camera not working | Check HTTPS, browser permissions |
| GPS inaccurate | Enable "Use precise location" in browser |
| Upload fails | Check R2 credentials, verify bucket exists |
| Images don't load | Check CORS policy on R2 bucket |
| Wrong storage used | Check env vars, restart dev server |

---

## 🔒 Protected Code (DO NOT MODIFY)

### Mobile Camera Implementation
- **File**: `app/client/src/components/ItemInspection.tsx`
- **Lines**: 36, 118-187
- **Why**: Forces mobile camera (not gallery) via dynamic DOM with memory cleanup

### Storage Integration
- **File**: `app/client/src/services/storage.ts`
- **Bucket Name**: MUST remain `property-photos`
- **Path Structure**: `{userId}/{reportId}/{itemId}/{timestamp}.jpg`

### PDF Link System
- **File**: `app/client/src/services/pdf.tsx`
- **Config**: `useSignedUrls: false` (must stay false)

### GPS Accuracy System
- **Files**: `useGeolocation.ts`, `AddProperty.tsx`
- **Settings**: `enableHighAccuracy: true`, `maximumAge: 0`
- **Validation**: 200m accuracy threshold, desktop warnings, mobile-specific guidance

**See `.claude/protected-code.md` for details**

---

## 📞 Support Contacts

- **Developer**: george@interon.co.za
- **Support Email**: support@selprohost.co.za
- **GitHub Issues**: https://github.com/Selmorand/cyass/issues

---

## 📝 Business Rules

1. **Mandatory Comments**: Non-Good/N/A conditions require comments
2. **GPS Required**: All properties need GPS coordinates
3. **Solo Reports**: Single-party reports only (not jointly signed)
4. **Photo Evidence**: Multiple photos supported per item
5. **SA Address Format**: Strict province/postal code validation

---

## 🎯 Key Metrics (Alpha)

### Expected Usage
- **Users**: 20 agencies
- **Reports**: 200/month (~10 per agency)
- **Storage**: ~2GB/month (photos + PDFs)
- **R2 Cost**: $0 (well under 10GB free tier)

### Performance Targets
- Page load: < 3s on 3G
- Camera capture: < 1s
- PDF generation: < 10s
- Uptime: 99.9%

---

**Last Updated**: November 20, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
