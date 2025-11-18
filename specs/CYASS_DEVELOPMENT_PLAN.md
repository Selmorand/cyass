# CYAss Property Reports - Complete Development Plan

## 🏗️ **Final Stack Decision (Most Reliable)**

**Frontend**: Vite + React + TypeScript + Tailwind + React Router + PWA
**Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
**PDF**: @react-pdf/renderer
**Development**: Claude Code + VS Code
**Deployment**: Netlify + Supabase
**Testing**: Local development → Staging → Production

## 📋 **Phase-by-Phase Development Plan**

### **Phase 1: Foundation Setup (Day 1-2)**
**Outcome**: Working local development environment

1. **Create Supabase project** + database tables
2. **Initialize Vite + React + TypeScript project**
3. **Set up folder structure** (detailed below)
4. **Configure Tailwind + basic components**
5. **Test local connection to Supabase**

### **Phase 2: Core Models & Services (Day 3-4)**
**Outcome**: Data models + API services working

1. **Define TypeScript interfaces** (Property, Report, Room, Item)
2. **Create Supabase service layer** (CRUD operations)
3. **Build validation utilities** (mandatory comment rule)
4. **Set up color tokens** (single source of truth)
5. **Test database operations locally**

### **Phase 3: Authentication & Routing (Day 5)**
**Outcome**: User login + protected routes

1. **Implement Supabase Auth** (email + Google)
2. **Create route structure** + protected pages
3. **Build auth hooks** (useAuth, useUser)
4. **Test auth flow locally**

### **Phase 4: Property Management (Day 6-7)**
**Outcome**: Create & manage properties with GPS

1. **Property creation form** (address + GPS capture)
2. **Property list/selection** page
3. **GPS utilities** (accuracy tracking)
4. **Address validation** (SA postal codes)
5. **Test property CRUD locally**

### **Phase 5: Room Selection & Templates (Day 8-9)**
**Outcome**: Room-by-room inspection flow

1. **Room type templates** (Standard, Bathroom, Kitchen, etc.)
2. **Room selection interface**
3. **Dynamic item lists** per room type
4. **Room navigation flow**
5. **Test room setup locally**

### **Phase 6: Inspection Capture (Day 10-12)**
**Outcome**: Photo upload + condition rating

1. **Photo upload component** (multi-select, compression)
2. **Condition rating UI** (Good/Fair/Poor/Urgent/N-A)
3. **Mandatory comment validation**
4. **Photo grid display**
5. **Test inspection flow locally**

### **Phase 7: PDF Generation (Day 13-15)**
**Outcome**: Professional PDF reports

1. **PDF template with watermarks**
2. **Photo embedding in PDFs**
3. **Legal disclaimer footer**
4. **Brand colors + badges**
5. **Test PDF generation locally**

### **Phase 8: Payment Integration & PWA (Day 16-17)**
**Outcome**: Yoco payment gateway + installable app

1. **Yoco payment integration** (CC + Instant EFT)
2. **Pay-as-you-go implementation** (R200 per PDF)
3. **PWA configuration** (manifest, service worker)
4. **Offline capability** (basic caching)
5. **Test PWA installation locally**

### **Phase 9: Deployment & Testing (Day 18-20)**
**Outcome**: Live application

1. **Netlify deployment** + custom domain
2. **Environment variable setup**
3. **End-to-end testing** (mobile devices)
4. **Performance optimization**
5. **Beta user testing**

## 📁 **Complete Folder Structure**

```
cyass/
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/
│       ├── pwa-192x192.png
│       └── pwa-512x512.png
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.tsx          # Condition badges with color tokens
│   │   │   ├── Button.tsx         # Consistent button styles
│   │   │   ├── FormField.tsx      # Input/select/textarea wrapper
│   │   │   ├── Spinner.tsx        # Loading states
│   │   │   └── Modal.tsx          # Dialogs/confirmations
│   │   ├── forms/
│   │   │   ├── PropertyForm.tsx   # Address + GPS capture
│   │   │   ├── RoomSelector.tsx   # Choose rooms for inspection
│   │   │   ├── ItemInspection.tsx # Individual item rating
│   │   │   └── PhotoUpload.tsx    # Camera/gallery upload
│   │   ├── display/
│   │   │   ├── PhotoGrid.tsx      # Image gallery display
│   │   │   ├── ReportSummary.tsx  # Report overview
│   │   │   └── ConditionStats.tsx # Quick condition counts
│   │   └── layout/
│   │       ├── Header.tsx         # App navigation
│   │       ├── Footer.tsx         # Legal links
│   │       └── Layout.tsx         # Page wrapper
│   ├── pages/
│   │   ├── Auth.tsx               # Login/signup (email + Google)
│   │   ├── Dashboard.tsx          # User's reports/properties
│   │   ├── PropertyList.tsx       # Manage properties
│   │   ├── PropertyCreate.tsx     # New property setup
│   │   ├── ReportCreate.tsx       # Choose role + start report
│   │   ├── RoomSelection.tsx      # Select rooms to inspect
│   │   ├── InspectionFlow.tsx     # Room-by-room capture
│   │   ├── ReportReview.tsx       # Preview before finalize
│   │   └── ReportView.tsx         # View/download PDF
│   ├── services/
│   │   ├── supabase.ts            # Database client + helpers
│   │   ├── auth.ts                # Authentication services
│   │   ├── properties.ts          # Property CRUD operations
│   │   ├── reports.ts             # Report CRUD operations
│   │   ├── storage.ts             # File upload/download
│   │   ├── pdf.ts                 # PDF generation
│   │   └── payments.stub.ts       # Payment integration stubs
│   ├── hooks/
│   │   ├── useAuth.ts             # Authentication state
│   │   ├── useGeolocation.ts      # GPS capture utilities
│   │   ├── usePhoto.ts            # Camera/upload handling
│   │   ├── useReport.ts           # Report state management
│   │   └── usePWA.ts              # PWA install prompt
│   ├── types/
│   │   ├── database.ts            # Supabase generated types
│   │   ├── property.ts            # Property interfaces
│   │   ├── report.ts              # Report interfaces
│   │   └── common.ts              # Shared types
│   ├── utils/
│   │   ├── constants.ts           # Colors, templates, validation rules
│   │   ├── validators.ts          # Form validation functions
│   │   ├── formatters.ts          # Date/address/currency formatting
│   │   ├── geolocation.ts         # GPS utilities + geohash
│   │   └── helpers.ts             # Generic utility functions
│   ├── styles/
│   │   └── globals.css            # Tailwind + custom styles
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   └── router.tsx                 # Route definitions
├── .env.example                   # Environment variables template
├── .env.local                     # Local environment (gitignored)
├── .gitignore
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎯 **Key Technical Decisions**

### **Data Models (TypeScript-first)**
```typescript
// Core types matching your requirements
export type UserRole = 'tenant' | 'landlord' | 'buyer' | 'seller' | 'agent'
export type ConditionState = 'Good' | 'Fair' | 'Poor' | 'Urgent Repair' | 'N/A'
export type RoomType = 'Standard' | 'Bathroom' | 'Kitchen' | 'Patio' | 'Outbuilding' | 'Exterior'

// Property with full address + GPS
export interface Property {
  id: string
  display_address: string
  street_number: string
  street_name: string
  suburb: string
  city: string
  province: string
  postal_code: string
  country: string
  unit?: string
  gps_location?: GPSLocation
  created_by: string
  created_at: string
}

// Report with rooms + items
export interface Report {
  id: string
  property_id: string
  creator_role: UserRole
  creator_name: string
  status: 'draft' | 'final'
  rooms: Room[]
  pdf_url?: string
  is_paid: boolean
  disclaimer_version: 'v1.0'
  capture_meta?: CaptureMetadata
  created_at: string
}

// Room with inspection items
export interface Room {
  id: string
  name: string
  type: RoomType
  items: InspectionItem[]
}

// Individual inspection item
export interface InspectionItem {
  id: string
  category: string  // "Walls", "Toilet", etc.
  condition: ConditionState
  notes?: string    // MANDATORY if condition !== 'Good' && !== 'N/A'
  photos: Photo[]
  compliance_flag?: boolean  // Auto-flagged for CoC items
}
```

### **Color Tokens (Single Source)**
```typescript
export const CONDITION_COLORS = {
  Good: '#277020',
  Fair: '#f5a409', 
  Poor: '#c62121',
  'Urgent Repair': '#c62121',
  'N/A': '#777777'
} as const
```

### **Room Templates**
```typescript
export const ROOM_TEMPLATES = {
  Standard: ['Walls', 'Windows', 'Carpets/Floors', 'Electrical Sockets', 'Light Fittings', 'Built-in Cupboards', 'Doors', 'Blinds', 'Other'],
  Bathroom: ['...Standard', 'Toilet', 'Bath', 'Shower', 'Basin/Taps', 'Mirrors/Cabinets', 'Plumbing'],
  Kitchen: ['...Standard', 'Counters', 'Sink/Taps', 'Stove', 'Extractor/Ventilation', 'Cabinets'],
  Patio: ['...Standard', 'Braai', 'Pool', 'Pool Pump', 'Jacuzzi/Hot Tub'],
  Outbuilding: ['...Standard', 'Garage Door', 'Roof/Ceiling', 'Security Systems'],
  Exterior: ['Exterior Walls', 'Roof & Gutters', 'Solar/Inverter/Batteries', 'Electrical DB', 'Gas Storage', 'Security Systems', 'Gates', 'Other']
} as const
```

### **Validation Rules**
```typescript
export const validateItem = (item: InspectionItem): string[] => {
  const errors: string[] = []
  const needsComment = item.condition !== 'Good' && item.condition !== 'N/A'
  
  if (needsComment && !item.notes?.trim()) {
    errors.push('Comment required when condition is not Good or N/A')
  }
  
  return errors
}
```

## 🎨 **PDF Template Requirements**

### **Watermark**: "CYAss SOLO REPORT - Created by {ROLE} - Not jointly signed"
### **Header**: Property address, report type, date/time
### **Room Sections**: Item name, condition badge, notes, photo grid (3-column)
### **Footer**: 
```
CYAss Solo Condition Report | Role: {ROLE} | Name: {CREATOR_NAME} | Created: {TIMESTAMP}
Property: {DISPLAY_ADDRESS} | GPS: {lat,lng ±accuracy}
Disclaimer v1.0: This document reflects observations of the reporting party only.
Not reviewed or signed by opposing party. CYAss provides tooling only.
```

## 💰 **Payment Integration (Stubs Ready)**

**Yoco Integration Points**:
- `initiatePayment(reportId, amount, method)` → Payment URL (CC/EFT)
- `verifyPayment(paymentId)` → Success/Failure  
- `generatePDFAfterPayment(reportId)` → Final PDF with download

**UI Flow**: 
1. Complete inspection → Review → "Pay R200 & Download PDF" → Choose CC/EFT → Yoco → PDF generation → Download link

## 🏢 **White-Label System for Agencies**

### **Multi-Tenant Architecture**:
- Environment-based branding configuration
- Custom domain mapping per agency
- Separate payment processing per client
- Agency dashboard for managing freelancers

### **Freelancer Features**:
- Agency-specific signup links
- Commission tracking and payouts  
- Branded reports with agency details
- Client management tools

### **Agency Admin Features**:
- Freelancer onboarding/management
- Payment processing setup
- Custom branding configuration
- Usage analytics and reporting

## 🔒 **Security & Compliance**

### **Row Level Security (Supabase)**:
```sql
-- Users can only access their own data
CREATE POLICY "Users can access own properties" ON properties
FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can access own reports" ON reports  
FOR ALL USING (auth.uid() = created_by);
```

### **Legal Disclaimer (v1.0)**:
```
This document reflects the observations of the reporting party only. 
It has not been reviewed or signed by an opposing party and may not be 
complete or exhaustive. CYAss provides tooling only and does not certify 
property condition or statutory compliance.
```

## 📱 **PWA Configuration**

**Manifest Features**:
- Installable app icon
- Standalone display mode  
- Offline shell caching
- Camera access for photo capture
- Portrait orientation lock

**Service Worker**:
- Cache app shell + static assets
- Cache inspection photos locally
- Sync when back online

## 🚀 **Development Commands**

### **Initial Setup**:
```bash
npm create vite@latest cyass -- --template react-ts
cd cyass
npm install @supabase/supabase-js react-router-dom @headlessui/react @heroicons/react
npm install react-hook-form @hookform/resolvers zod @react-pdf/renderer
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa
npx tailwindcss init -p
```

### **Development**:
```bash
npm run dev          # Local development
npm run build        # Production build  
npm run preview      # Test production build
npm run type-check   # TypeScript validation
```

## ✅ **Success Criteria Per Phase**

**Phase 1**: Vite app runs locally, Supabase connection works
**Phase 2**: Can create/read properties and reports in database
**Phase 3**: User authentication + protected routes working
**Phase 4**: Property creation with GPS capture works
**Phase 5**: Room selection generates correct item lists
**Phase 6**: Photo upload + condition rating saves correctly
**Phase 7**: PDF generates with watermarks, photos, disclaimers
**Phase 8**: PWA installs on mobile devices
**Phase 9**: Live app deployed, tested on mobile devices

## 📊 **QA Checkpoints**

After each phase:
- [ ] TypeScript compiles without errors
- [ ] All tests pass locally  
- [ ] Mobile responsive (test on phone)
- [ ] Data saves correctly to Supabase
- [ ] No console errors
- [ ] UI matches design requirements
- [ ] Performance acceptable (< 3s load time)

## 🎯 **Next Action**

**Ready to start Phase 1?** 

I'll guide you step-by-step using Claude Code to:
1. Create Supabase project + database
2. Initialize Vite project with TypeScript
3. Set up basic folder structure + dependencies
4. Test local connection

Should we begin with **Phase 1: Foundation Setup**?