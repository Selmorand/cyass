# CYAss - Cover Your Assets

A Progressive Web App for professional property condition reporting in South Africa. Create comprehensive solo condition reports with photo documentation, video walkthroughs, compliance tracking, and PDF generation.

## Features

### Property Management
- Add and manage multiple properties with SA-specific address formats
- Capture GPS coordinates with accuracy tracking
- Support for various property types and special features
- Property-level metadata (address, GPS, ownership details)

### Role-Based Inspection System
- **6 specialized user roles** with tailored inspection templates:
  - **Tenant**: Move-in/move-out documentation
  - **Landlord**: Comprehensive property condition assessments
  - **Buyer**: Pre-purchase due diligence inspections
  - **Seller**: Property listing documentation
  - **Agent**: Professional reports with template flexibility
  - **Contractor**: Before/after repair documentation with cost tracking
- **Agent Template Selection**: Agents can choose which template to use (Tenant, Landlord, Buyer, Seller, or Contractor)
- **28+ inspection categories** including:
  - Standard room items (walls, windows, doors, floors, ceilings)
  - Electrical systems and appliances with serial numbers
  - Plumbing and water systems
  - HVAC and climate control
  - Security systems (gates, burglar bars, alarms, electric fence)
  - Solar and renewable energy systems
  - Structural indicators (foundation cracks, roof sagging, wall cracks)
  - Damp and moisture assessment
  - Safety equipment (fire extinguishers, smoke detectors)
  - Garden and irrigation
  - Garage and parking
  - Pool and water features
  - Outbuildings and boundary walls
  - Marketing photos (for agents)
  - Repair recommendations with cost estimates
  - Before/after repair documentation (for contractors)

### Compliance Document Tracking
- **Certificates of Compliance (COC)**:
  - Electrical COC
  - Gas COC
  - Plumbing COC (required in Western Cape)
  - Water Installation Certificate
  - Electric Fence Certificate
- **Statutory Documents**:
  - Beetle Certificate (wood borer inspections - coastal provinces)
  - Building Plans verification
  - Occupation Certificate
  - Warranty Documents tracking
- Capture certificate numbers, expiry dates, and supporting photos

### Photo Documentation
- Capture multiple photos per inspection item (unlimited)
- Direct camera access on mobile devices (no gallery picker)
- Automatic compression to 1024px for optimal storage
- Before/after photo support for repairs
- Marketing photos for property listings
- Photo grids in PDF reports with clickable thumbnails

### Video Walkthroughs
- Optional 1-minute video recording per room (720p, memory-efficient)
- Shows entire room condition in context
- Stored with clickable links in PDF reports (external URLs)
- Duration tracking and display

### PDF Report Generation
- Professional PDF format with branding
- Role-specific watermarks: "CYAss SOLO REPORT - Created by {ROLE} - Not jointly signed"
- Photo grids with clickable thumbnails
- Clickable video links with duration
- GPS coordinates and timestamps
- Legal disclaimers and compliance statements
- Comprehensive condition summary

### Authentication & User Management
- Email/password authentication via Supabase
- **Password reset functionality** with email verification
- Role-based access control
- Row Level Security (RLS) for data isolation
- Session persistence during photo/video uploads (no logout during async operations)

### Offline Capability (PWA)
- Installable on mobile devices as native app
- Offline capability with service workers
- Direct camera access for photo capture
- GPS location services
- App-like experience on mobile
- Background sync for uploads

### Storage Options
- **Primary**: Cloudflare R2 (production) - S3-compatible, free 10GB + unlimited bandwidth
- **Fallback**: Supabase Storage (development/backup)
- Automatic detection and fallback if R2 not configured
- Storage status indicator in UI

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form + Zod** - Form handling and validation
- **@react-pdf/renderer** - PDF generation
- **PWA** - Progressive Web App capabilities

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication with email/password
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Storage (fallback option)
- **Cloudflare R2** - Object Storage (Production)
  - Photos, videos, and PDFs
  - S3-compatible API
  - Free tier: 10GB storage, unlimited bandwidth
  - Automatic fallback to Supabase Storage if not configured

## Project Structure

```
new-cyass/
├── app/
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   │   ├── RoleBasedInspectionField.tsx  # Dynamic inspection field rendering
│   │   │   │   ├── StorageStatusBanner.tsx       # R2/Supabase status indicator
│   │   │   │   └── ...
│   │   │   ├── pages/       # Route page components
│   │   │   │   ├── InspectionFlow.tsx            # Main inspection workflow
│   │   │   │   ├── ForgotPassword.tsx            # Password reset request
│   │   │   │   ├── ResetPassword.tsx             # Password reset confirmation
│   │   │   │   ├── DebugUser.tsx                 # User debug page (dev only)
│   │   │   │   └── ...
│   │   │   ├── services/    # API service layer
│   │   │   │   ├── authService.ts                # Authentication with password reset
│   │   │   │   ├── storageService.ts             # R2/Supabase storage abstraction
│   │   │   │   └── ...
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── types/       # TypeScript definitions
│   │   │   │   └── inspection.ts                 # Role-based inspection types
│   │   │   └── utils/       # Utility functions
│   │   ├── public/          # Static assets
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── create-test-users.mjs        # Script to create test users
│   │   ├── fix-landlord-role.mjs        # Script to fix landlord role in DB
│   │   └── verify-user-roles.mjs        # Script to verify user roles
│   └── service/             # Service layer documentation
│       └── README.md        # Supabase integration docs
├── database/                # SQL files for database setup
│   ├── database-setup.sql
│   ├── create-activity-table.sql
│   └── supabase/
├── data/                    # Data storage (future use)
├── scripts/                 # Development scripts (Windows)
│   ├── setup.bat           # Install dependencies
│   ├── run.bat             # Start dev server
│   ├── build.bat           # Build for production
│   └── test.bat            # Run tests
├── specs/                   # Documentation and specifications
│   ├── QUICK_REFERENCE.md
│   ├── ROOM_VIDEO_WALKTHROUGH_FEATURE.md
│   └── STRUCTURE.md
├── .claude/                 # AI assistant guidelines
│   ├── CLAUDE.md           # Project guidelines for Claude Code
│   ├── protected-code.md   # Protected code documentation
│   └── development-guide.md
├── CLOUDFLARE_R2_SETUP.md   # Complete R2 setup guide
└── README.md                # This file
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Windows OS (for .bat scripts) or WSL/Git Bash
- Cloudflare account (optional - for R2 storage)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd new-cyass
```

2. Run setup script:
```bash
scripts\setup.bat
```

3. Configure Supabase:
   - Create a `.env.local` file in `app/client/`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Configure Cloudflare R2 (Optional - recommended for production):
   - See `CLOUDFLARE_R2_SETUP.md` for complete step-by-step instructions
   - Add R2 environment variables to `.env.local`:
   ```env
   VITE_R2_ACCOUNT_ID=your_account_id
   VITE_R2_ACCESS_KEY_ID=your_access_key_id
   VITE_R2_SECRET_ACCESS_KEY=your_secret_access_key
   VITE_R2_BUCKET_NAME=cyass-storage
   VITE_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
   ```
   - If not configured, app automatically falls back to Supabase Storage

5. Set up database:
   - Go to Supabase SQL Editor
   - Run SQL files from `/database` folder in order:
     - `database-setup.sql`
     - Other migration files as needed

### Running the Application

Start the development server:
```bash
scripts\run.bat
# OR
cd app/client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Supabase Dashboard**: https://app.supabase.com

### Building for Production

Build the application:
```bash
scripts\build.bat
# OR
cd app/client
npm run build
```

Production files will be in `app/client/dist/`. Deploy to Netlify, Vercel, or any static hosting service.

## User Workflows

### For Tenants
1. Sign up / Log in
2. Add property details (move-in address)
3. Conduct room-by-room inspection with tenant-specific checklist
4. Capture photos of any issues or concerns
5. Generate and download PDF report
6. Share report with landlord

### For Landlords
1. Sign up / Log in
2. Add property to portfolio
3. Conduct comprehensive property assessment
4. Document compliance certificates (COCs, Beetle Certificate, etc.)
5. Track appliance serial numbers and warranties
6. Generate PDF report for records

### For Buyers
1. Sign up / Log in
2. Add property being purchased
3. Conduct detailed pre-purchase inspection
4. Check structural indicators (cracks, damp, roof condition)
5. Verify compliance documentation requirements
6. Generate report for decision-making

### For Sellers
1. Sign up / Log in
2. Add property for sale
3. Document property condition proactively
4. Capture marketing photos
5. Generate PDF for disclosure to buyers

### For Agents
1. Sign up / Log in
2. Add client's property
3. **Select inspection template** (Tenant, Landlord, Buyer, Seller, or Contractor)
4. Conduct inspection using selected template
5. Capture professional marketing photos
6. Generate branded PDF report for client

### For Contractors
1. Sign up / Log in
2. Document property before repairs
3. Capture "before" photos of issues
4. Complete repairs
5. Capture "after" photos showing work completed
6. Document repair costs and recommendations
7. Generate before/after report for client

## Core Features Detail

### Property Management
- Add properties with South African address format:
  - Street address
  - Suburb
  - City
  - Province (dropdown)
  - Postal code
- Capture GPS coordinates with accuracy indicators (meters)
- Property type selection
- Special features tracking

### Inspection Flow
1. Select or add a property
2. Choose rooms to inspect (Kitchen, Bathroom, Bedroom, Lounge, etc.)
3. For each room:
   - **(Optional)** Record 1-minute video walkthrough (720p) showing entire room
   - Assess items based on role-specific template:
     - Standard items: Walls, Windows, Doors, Floors/Carpets, Ceilings
     - Role-specific items: Appliances, Plumbing, Electrical, Security, etc.
   - Rate condition: Good / Fair / Poor / Urgent Repair / N/A
   - Add comments (mandatory for non-Good/N/A conditions)
   - Capture multiple photos per item with direct camera access
   - Document serial numbers (for appliances)
   - Track compliance certificates and expiry dates
4. Generate professional PDF report

### Conditional Field Logic
- Solar system details only shown if "Solar Present" = Yes
- Pool equipment only shown if "Pool Present" = Yes
- Appliance serial numbers only for applicable items
- Role-specific fields (e.g., marketing photos only for Agents)
- Before/after repair fields only for Contractors

### Report Generation
- Professional PDF format with CYAss branding
- Role-specific watermark: "CYAss SOLO REPORT - Created by {ROLE} - Not jointly signed"
- Photo grids with clickable thumbnails (links to full resolution)
- Clickable video links with duration display (external URLs)
- GPS coordinates with accuracy (±X meters)
- Timestamps for all captures
- Legal disclaimer:
  > "This document reflects the observations of the reporting party only. It has not been reviewed or signed by an opposing party and may not be complete or exhaustive. CYAss provides tooling only and does not certify property condition or statutory compliance."
- Compliance certificate summary
- Condition summary by room

## Business Rules

1. **Mandatory Comments**: Items marked as Fair/Poor/Urgent Repair MUST have explanatory comments
2. **Photo Evidence**: Support for unlimited photos per inspection item
3. **GPS Accuracy**: Captures location with precision indicators (±X meters)
4. **Solo Reports**: Reports are clearly marked as created by one party (not jointly signed)
5. **Data Privacy**: Users only access their own data via Row Level Security (RLS)
6. **Regional Compliance**:
   - Beetle Certificate required for coastal provinces
   - Plumbing COC required for Western Cape
   - Electrical COC required nationwide
7. **Agent Flexibility**: Agents can select alternative role templates for client needs
8. **Video Length**: Room videos limited to 1 minute for storage efficiency

## Development

### Environment Setup
```bash
# Install dependencies
cd app/client
npm install

# Start dev server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### Utility Scripts (Development)
```bash
# Create test users for all 6 roles
node app/client/create-test-users.mjs

# Fix landlord role assignment in database
node app/client/fix-landlord-role.mjs

# Verify user roles are correctly assigned
node app/client/verify-user-roles.mjs
```

### Database Migrations
SQL files in `/database` should be run in your Supabase project:
1. Initial schema setup (`database-setup.sql`)
2. RLS policies for data isolation
3. Storage bucket configuration
4. Activity tracking tables
5. User role constraints

### Testing
```bash
# Run tests (when implemented)
scripts\test.bat

# Or directly
cd app/client
npm test
```

### Code Organization
- **Components**: Reusable UI components with TypeScript
- **Pages**: Route-specific page components
- **Services**: API abstraction layer (auth, storage, database)
- **Hooks**: Custom React hooks for state management
- **Types**: TypeScript definitions for type safety
- **Utils**: Helper functions and utilities

## Deployment

### Netlify (Recommended)
1. Connect GitHub repository to Netlify
2. Build settings:
   - Base directory: `app/client`
   - Build command: `npm run build`
   - Publish directory: `app/client/dist`
3. Add environment variables in Netlify dashboard (see below)
4. Deploy automatically on git push to main branch

### Vercel
1. Connect GitHub repository
2. Set root directory: `app/client`
3. Framework preset: Vite
4. Add environment variables
5. Deploy

### Environment Variables

**Required for all environments:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional for production storage (strongly recommended):**
- `VITE_R2_ACCOUNT_ID` - Cloudflare account ID
- `VITE_R2_ACCESS_KEY_ID` - R2 API access key
- `VITE_R2_SECRET_ACCESS_KEY` - R2 API secret key
- `VITE_R2_BUCKET_NAME` - R2 bucket name (e.g., `cyass-storage`)
- `VITE_R2_PUBLIC_URL` - R2 public URL (e.g., `https://pub-xxxxx.r2.dev`)

**Note**: If R2 variables are not set, the app automatically falls back to Supabase Storage. See `CLOUDFLARE_R2_SETUP.md` for complete R2 setup instructions.

### Cost Comparison (Production)

**Option 1: Supabase Only (Not Recommended)**
- Database + Storage: $25-250+/month depending on usage
- 5-year projection for 20 agencies: ~$180,000+

**Option 2: Supabase + Cloudflare R2 (Recommended)**
- Supabase Pro (Database + Auth): $25/month
- R2 Storage: Free tier (10GB + unlimited bandwidth) or $0.015/GB after
- 5-year projection for 20 agencies: ~$11,000
- **93% cost savings!**

## Security

### Authentication
- Email/password authentication via Supabase Auth
- Password reset with email verification
- Session tokens with automatic refresh
- Secure logout on all devices

### Data Isolation
- Row Level Security (RLS) policies ensure users only access their own data
- Authenticated users cannot view other users' properties or reports
- Database queries automatically filtered by user ID

### File Security
- Secure file uploads to R2/Supabase Storage
- Signed URLs for private access
- Public URLs only for report viewing
- No direct file system access

### Environment Security
- Environment variables for sensitive configuration
- Never commit `.env.local` to git (in .gitignore)
- Separate credentials for dev/staging/production
- API token rotation recommended every 6-12 months

### Best Practices
- ✅ Enable 2FA on Supabase and Cloudflare accounts
- ✅ Use separate API tokens for dev/staging/production
- ✅ Limit API token scope to specific buckets
- ✅ Monitor R2 access logs for suspicious activity
- ✅ Rotate API keys every 6-12 months
- ✅ Never share credentials in code or screenshots

## PWA Features

### Mobile Installation
- Install as native app on iOS and Android
- Add to home screen for app-like experience
- Standalone mode (no browser chrome)

### Offline Capability
- Service worker caching for offline access
- Background sync for uploads when connection restored
- Graceful fallback for network failures

### Native Device Access
- Direct camera access for photo capture (bypasses gallery picker)
- GPS location services with accuracy tracking
- Video recording with 720p compression
- Local storage for draft reports

### Performance
- Photo compression to 1024px before upload
- Video compression to 720p
- Lazy loading of images
- Optimized bundle size with code splitting

## Legal & Compliance

### Report Disclaimer
All generated reports include the legal disclaimer:
> "This document reflects the observations of the reporting party only. It has not been reviewed or signed by an opposing party and may not be complete or exhaustive. CYAss provides tooling only and does not certify property condition or statutory compliance."

### Solo Report Watermark
Every PDF is watermarked with:
> "CYAss SOLO REPORT - Created by {ROLE} - Not jointly signed"

This ensures clarity that the report represents one party's observations only.

### Compliance Certificate Tracking
The system tracks (but does not verify) common South African property compliance requirements:
- Electrical Certificate of Compliance (COC) - National requirement
- Gas Certificate of Compliance - If gas installed
- Plumbing Certificate of Compliance - Required in Western Cape
- Beetle Certificate - Recommended for coastal provinces
- Water Installation Certificate - Municipal requirement
- Electric Fence Certificate - If electric fence installed

**Important**: CYAss provides documentation tools only and does not certify compliance or property condition.

## Troubleshooting

### Authentication Issues

**Problem**: Cannot log in or sign up

**Solutions**:
- Verify Supabase environment variables are correctly set
- Check Supabase project is active (not paused)
- Ensure email confirmation is disabled for development (or check email)
- Check browser console for specific error messages

**Problem**: Forgot password email not received

**Solutions**:
- Check spam/junk folder
- Verify email address is correct
- Ensure Supabase email templates are configured
- Check Supabase Auth settings for SMTP configuration

### Camera Issues

**Problem**: Camera not working on mobile

**Solutions**:
- Ensure HTTPS connection (required for camera access)
- Check browser permissions for camera access
- On iOS: Settings → Safari → Camera → Allow
- On Android: Settings → Apps → Browser → Permissions → Camera
- Mobile devices should open camera directly, not gallery picker

**Problem**: Camera opens gallery instead of camera

**Solutions**:
- This is expected on desktop browsers
- On mobile, the code uses specific detection to force camera
- Check ItemInspection.tsx:712 for camera implementation
- See `.claude/protected-code.md` for details

### Storage Issues

**Problem**: Photos/videos not uploading

**Solutions**:
- Check console for storage status ("Using Cloudflare R2" or "Using Supabase Storage")
- If R2 configured: Verify all 5 R2 environment variables are set
- If R2 configured: Check CORS policy is set on R2 bucket (see CLOUDFLARE_R2_SETUP.md:176)
- Check network tab in DevTools for upload errors
- Verify API credentials are correct

**Problem**: CORS errors when uploading to R2

**Solutions**:
- CRITICAL: R2 bucket MUST have CORS policy configured
- Go to R2 bucket → Settings → CORS Policy
- Add allowed origins: your domain(s) and localhost ports
- Add allowed methods: GET, PUT, POST, DELETE
- See CLOUDFLARE_R2_SETUP.md:176 for complete CORS configuration

### Supabase Connection Issues

**Problem**: Database queries failing

**Solutions**:
- Verify environment variables are set correctly
- Check Supabase project is active (not paused)
- Ensure RLS policies are configured correctly
- Check browser console for specific error messages
- Verify user is authenticated (check auth state)

### PDF Generation Issues

**Problem**: PDF generation fails or shows errors

**Solutions**:
- Check browser console for specific errors
- Verify all required data is present (property, rooms, items)
- Ensure images are properly uploaded to storage
- Check image URLs are accessible (test in browser)
- Verify PDF has at least one room with inspection data

**Problem**: Photos don't appear in PDF

**Solutions**:
- Verify public access is enabled on R2 bucket (or Supabase storage bucket)
- Check browser network tab - are images loading with 200 status?
- Test image URLs directly in browser address bar
- Verify `VITE_R2_PUBLIC_URL` has no trailing slash
- Check images uploaded successfully to storage

### Session/Logout Issues

**Problem**: Getting logged out during photo uploads

**Solutions**:
- This was fixed in commit `58a7a35`
- Ensure you're running latest version
- Session now persists during async operations
- If still occurring, check for JavaScript errors in console

### Agent Template Selection

**Problem**: Agent cannot select alternative templates

**Solutions**:
- Verify user role is "agent" in database
- Check StartReport page for template selection UI
- Template selector shows only for agent role
- Non-agent users see their role's template automatically

## Support & Documentation

### Additional Documentation
- `/specs/QUICK_REFERENCE.md` - Quick reference guide
- `/specs/ROOM_VIDEO_WALKTHROUGH_FEATURE.md` - Video feature documentation
- `/specs/STRUCTURE.md` - System architecture
- `CLOUDFLARE_R2_SETUP.md` - Complete R2 setup guide
- `/.claude/CLAUDE.md` - Development guidelines for Claude Code
- `/.claude/protected-code.md` - Protected code areas
- `/.claude/development-guide.md` - Development workflow guide

### Useful Links
- **Supabase Docs**: https://supabase.com/docs
- **Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com

### Getting Help
For issues or questions:
- Check console logs for detailed error messages
- Review relevant documentation in `/specs` folder
- Check git commit history for recent changes
- Contact support team for assistance

## Changelog

### v1.2.0 (Current)
- Added agent template selection system with brand green styling
- Added forgot password and password reset functionality
- Added role-based inspection system with 28+ categories
- Added Contractor role for before/after repair documentation
- Added comprehensive compliance certificate tracking (COCs, Beetle Certificate, etc.)
- Added conditional field logic for dynamic inspections
- Fixed PWA session persistence during photo uploads
- Improved storage abstraction with R2/Supabase fallback
- Added utility scripts for user management and testing

### v1.1.0
- Added video walkthrough feature (720p, 1-minute limit)
- Added Cloudflare R2 storage integration
- Improved mobile camera handling
- Enhanced PDF generation with clickable links

### v1.0.0
- Initial release with core functionality
- Property management and inspection flow
- Photo documentation
- PDF report generation
- Basic user roles (Tenant, Landlord, Buyer, Seller, Agent)

## License

Proprietary - All rights reserved

## Version

v1.2.0 - Role-Based Inspections with Compliance Tracking
