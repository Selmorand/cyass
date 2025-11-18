# CYAss - Cover Your Assets

A Progressive Web App for professional property condition reporting in South Africa. Create comprehensive solo condition reports with photo documentation and PDF generation.

## Features

- **Property Management**: Add and manage multiple properties with SA-specific address formats
- **Room-by-Room Inspection**: Detailed condition assessment for each room and item
- **Photo Documentation**: Capture and attach multiple photos per inspection item
- **GPS Location Capture**: Automatic GPS coordinates with accuracy tracking
- **PDF Report Generation**: Professional PDF reports with watermarks and legal disclaimers
- **Role-Based Access**: Support for tenants, landlords, buyers, sellers, and agents
- **Offline Capability**: PWA features for working without internet connection
- **Mobile Optimized**: Responsive design with direct camera access on mobile devices

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
  - Authentication
  - File storage
  - Row Level Security (RLS)
  - Real-time subscriptions

## Project Structure

```
new-cyass/
├── app/
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Route page components
│   │   │   ├── services/    # API service layer
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── types/       # TypeScript definitions
│   │   │   └── utils/       # Utility functions
│   │   ├── public/          # Static assets
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── service/             # Service layer documentation
│       └── README.md        # Supabase integration docs
├── database/                # SQL files for database setup
│   ├── database-setup.sql
│   ├── create-activity-table.sql
│   └── supabase/
├── data/                    # Data storage (future use)
├── scripts/                 # Development scripts
│   ├── setup.bat           # Install dependencies
│   ├── run.bat             # Start dev server
│   ├── build.bat           # Build for production
│   └── test.bat            # Run tests
├── specs/                   # Documentation and specifications
└── CLAUDE.md               # AI assistant guidelines
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Windows OS (for .bat scripts) or WSL/Git Bash

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
   - Create a `.env` file in `app/client/`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up database:
   - Go to Supabase SQL Editor
   - Run SQL files from `/database` folder in order:
     - `database-setup.sql`
     - Other migration files as needed

### Running the Application

Start the development server:
```bash
scripts\run.bat
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Supabase Dashboard**: https://app.supabase.com

### Building for Production

Build the application:
```bash
scripts\build.bat
```

Production files will be in `app/client/dist/`. Deploy to Netlify, Vercel, or any static hosting service.

## Core Features

### Property Management
- Add properties with South African address format
- Capture GPS coordinates with accuracy indicators
- Support for various property types and special features

### Inspection Flow
1. Select or add a property
2. Choose rooms to inspect
3. For each room, assess predefined items:
   - Walls, Windows, Doors
   - Floors/Carpets, Ceilings
   - Room-specific items (plumbing, appliances, etc.)
4. Rate condition (Good/Fair/Poor/Urgent Repair/N/A)
5. Add comments (mandatory for issues)
6. Capture photos with direct camera access

### Report Generation
- Professional PDF format
- Photo grids with clickable thumbnails
- GPS coordinates and timestamps
- Legal disclaimers and watermarks
- Creator role identification

## User Roles

- **Tenant**: Document move-in/move-out conditions
- **Landlord**: Property condition assessments
- **Buyer**: Pre-purchase inspections
- **Seller**: Property listing documentation
- **Agent**: Professional property reports

## Business Rules

1. **Mandatory Comments**: Items marked as Fair/Poor/Urgent Repair require explanatory comments
2. **Photo Evidence**: Support for multiple photos per inspection item
3. **GPS Accuracy**: Captures location with precision indicators
4. **Solo Reports**: Reports are marked as created by one party (not jointly signed)
5. **Data Privacy**: Users only access their own data via Row Level Security

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
```

### Database Migrations
SQL files in `/database` should be run in your Supabase project:
1. Initial schema setup
2. RLS policies
3. Storage bucket configuration
4. Activity tracking tables

### Testing
```bash
# Run tests (when implemented)
scripts\test.bat
```

## Deployment

### Netlify
1. Connect GitHub repository
2. Build settings:
   - Build command: `cd app/client && npm run build`
   - Publish directory: `app/client/dist`
3. Add environment variables in Netlify dashboard

### Environment Variables
Required for production:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security

- Row Level Security (RLS) ensures data isolation
- Authenticated users only access their own data
- Secure file uploads to Supabase Storage
- Environment variables for sensitive configuration

## PWA Features

- Installable on mobile devices
- Offline capability with service workers
- Direct camera access for photo capture
- GPS location services
- App-like experience on mobile

## Legal Notice

All generated reports include the disclaimer:
> "This document reflects the observations of the reporting party only. It has not been reviewed or signed by an opposing party and may not be complete or exhaustive. CYAss provides tooling only and does not certify property condition or statutory compliance."

## Troubleshooting

### Camera Not Working
- Ensure HTTPS connection (required for camera access)
- Check browser permissions for camera
- Mobile devices should open camera directly, not gallery

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure RLS policies are configured

### PDF Generation Errors
- Check browser console for specific errors
- Verify all required data is present
- Ensure images are properly uploaded to storage

## Support

For issues or questions:
- Check `/specs` folder for detailed documentation
- Review CLAUDE.md for development guidelines
- Contact support team for assistance

## License

Proprietary - All rights reserved

## Version

v1.0.0 - Initial release with core functionality