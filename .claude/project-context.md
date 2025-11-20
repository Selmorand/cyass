# CYAss Project Context

## Project Overview
CYAss (Cover Your Assets) is a Progressive Web App designed for the South African property market. It enables solo property condition reporting with legal compliance for rental, sale, and property management scenarios.

## Target Users
- **Tenants**: Document property conditions at move-in/move-out
- **Landlords**: Regular property inspections and condition tracking
- **Buyers**: Pre-purchase property assessments
- **Sellers**: Property condition documentation for listings
- **Agents**: Professional property condition reports

## Key Business Requirements

### South African Market Specifics
- Address format follows SA standards (street number, street name, suburb, city, province, postal code)
- Currency in ZAR (R symbol)
- Legal disclaimers comply with SA property law
- PayFast payment gateway (SA payment processor)

### Legal Compliance
- Reports clearly marked as "SOLO REPORT - Not jointly signed"
- Mandatory legal disclaimer on all PDFs
- User role identification on all reports
- Timestamp and GPS verification for legal validity

### Core Business Rules
1. **Condition Ratings**: Good, Fair, Poor, Urgent Repair, N/A
2. **Mandatory Comments**: Required for any non-Good/non-N/A condition
3. **Photo Evidence**: Multiple photos per inspection item
4. **GPS Verification**: Location capture with accuracy indicator
5. **PDF Generation**: Professional reports with watermarks

## Technical Architecture

### Frontend (Client-Side PWA)
- React SPA with TypeScript
- Offline-first architecture
- Direct device API access (camera, GPS)
- Client-side PDF generation
- IndexedDB for offline storage

### Backend (Supabase BaaS)
- PostgreSQL database with RLS
- Supabase Auth for user management
- Real-time subscriptions
- Serverless functions (future)

### Storage (Dual System)
- **Primary**: Cloudflare R2 (production/alpha) - Photos & PDFs
- **Fallback**: Supabase Storage (local dev) - Photos & PDFs
- Automatic detection and switching based on R2 configuration
- S3-compatible API via @aws-sdk/client-s3
- Cost savings: ~$169,000 over 5 years vs Supabase Enterprise

### Data Flow
1. User captures inspection data offline
2. Photos compressed and queued for upload
3. **Optional**: Record up to 1-minute video walkthrough per room
4. When online, sync to storage:
   - **R2 configured**: Upload photos/videos to Cloudflare R2 (production/alpha)
   - **R2 not configured**: Upload to Supabase Storage (local dev)
5. Public URLs stored in Supabase database
6. PDF generated client-side with external image/video URLs
7. Activity tracked for audit trail

## Development Philosophy

### Mobile-First Design
- Optimized for phone screens
- Touch-friendly interfaces
- Direct camera access (no gallery)
- Portrait orientation lock
- Minimal data usage

### Progressive Enhancement
- Core functionality works offline
- Enhanced features when online
- Graceful degradation
- Performance over features

### Security & Privacy
- User data isolation via RLS
- No cross-user data access
- Secure file uploads
- Environment variable protection
- Activity audit logging

## Current Development Phase
The project is in production-ready state with:
- ✅ Core inspection functionality
- ✅ Photo capture and storage (R2 + Supabase fallback)
- ✅ Cloudflare R2 integration (alpha ready)
- ✅ **Room video walkthroughs** (optional, 1-min max per room, 720p)
- ✅ PDF report generation (with clickable video links)
- ✅ User authentication
- ✅ Property management
- ⏳ Payment integration (stubs ready)
- ⏳ Advanced reporting features

## Future Roadmap
1. Payment processing activation
2. Multi-party report signing
3. Report templates
4. Bulk operations
5. API for third-party integration
6. Advanced analytics dashboard

## Important Constraints

### Technical Constraints
- Must work on 3G connections
- Must support older Android devices (Android 8+)
- Must handle large photo sets (50+ per report)
- **Video constraints**: 1 minute max per room, 50MB file size limit, 720p resolution
- PDF size limit of 10MB (excluding externally linked videos)
- R2 free tier: 10GB storage, unlimited egress (sufficient for alpha with videos)
- Storage path structure must remain consistent across R2 and Supabase

### Business Constraints
- Single-user reports only (current phase)
- R200 fee per PDF download (when payments active)
- 30-day report retention (free tier)
- 5GB photo storage per user

## Success Metrics
- Page load < 3 seconds on 3G
- Camera capture < 1 second
- PDF generation < 10 seconds
- 99.9% uptime for critical features
- Zero data loss for inspections

## Support & Documentation
- User documentation in `/specs`
- Technical specs in `/.claude`
- API documentation in code comments
- Test coverage reports in `/app/client/tests`