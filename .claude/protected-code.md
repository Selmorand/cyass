# Protected Code - DO NOT MODIFY

This file documents code sections that must NOT be modified without explicit user permission.

## Critical Implementation Areas

### 1. Mobile Camera Functionality
**File**: `/app/client/src/components/ItemInspection.tsx`
**Lines**: 27-28, 84-121, 170

**Protected Implementation**:
```javascript
// Mobile device detection
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Dynamic DOM element creation for mobile camera
const handleCameraClick = () => {
  if (isMobileDevice()) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Forces rear camera
    input.onchange = (e) => {
      // Handle file selection
    };
    input.click();
  }
};
```

**Why Protected**:
- React's synthetic events don't handle the `capture` attribute properly
- Direct DOM manipulation bypasses React limitations
- This ensures camera opens directly instead of gallery on mobile

### 2. Supabase Storage Integration
**File**: `/app/client/src/services/storage.ts`

**Protected Aspects**:
- Bucket name: MUST remain 'property-photos'
- Storage path structure: `{userId}/{reportId}/{itemId}/{timestamp}.jpg`
- Public URL generation method
- Error handling and fallback logic

**Why Protected**:
- The 'property-photos' bucket has working RLS policies
- Changing the bucket name breaks existing functionality
- Path structure is used by PDF generation

### 3. PDF Link System
**File**: `/app/client/src/services/pdf.tsx`
**Lines**: 277-283, 308-311

**Protected Configuration**:
```javascript
const PDF_CONFIG = {
  useSignedUrls: false,  // Must stay false for public URLs
  urlExpirySeconds: 157680000, // 5 years
};
```

**Protected Components**:
- Link components wrapping image thumbnails
- `preprocessReportForPDF()` function
- External URL generation for clickable thumbnails

**Why Protected**:
- Links enable clickable PDF thumbnails
- Preprocessing converts storage paths to external URLs
- Configuration ensures long-lived public URLs

## Business Logic Protection

### Mandatory Comment Validation
**Files**: Various components and validators

**Rule**: Any item with condition !== 'Good' && condition !== 'N/A' MUST have a comment

This validation is critical for legal compliance and must not be removed or weakened.

### GPS Capture Requirements
**Files**: `/app/client/src/hooks/useGeolocation.ts`

**Requirements**:
- Must capture coordinates
- Must include accuracy indicator
- Must handle permission denial gracefully

## Database Schema Protection

### Critical Tables and RLS Policies
**Location**: `/database/` folder

Do not modify:
- User isolation via RLS
- Storage bucket policies
- Activity tracking schema

## Override Permission

To modify any protected code, the user must explicitly state:
"I give permission to modify [specific protected area]"

Without this explicit permission, find alternative solutions that don't touch protected code.