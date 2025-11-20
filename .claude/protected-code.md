# Protected Code - DO NOT MODIFY

This file documents code sections that must NOT be modified without explicit user permission.

## Critical Implementation Areas

### 1. Mobile Camera Functionality with Memory Management
**File**: `/app/client/src/components/ItemInspection.tsx`
**Lines**: 36, 118-187

**Protected Implementation**:
```javascript
// Mobile device detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Dynamic DOM element creation for mobile camera
const handleCameraClick = () => {
  if (isMobile) {
    const newInput = document.createElement('input');
    newInput.type = 'file';
    newInput.accept = 'image/*';
    newInput.capture = 'environment'; // Forces rear camera
    newInput.onchange = async (e) => {
      // Process photo and clean up immediately
      cleanupInputElement(newInput);
    };
    newInput.click();
  }
};

// Memory cleanup for dynamically created elements
const cleanupInputElement = (input: HTMLInputElement) => {
  input.value = '';
  input.onchange = null;
  if (input.parentNode) {
    input.parentNode.removeChild(input);
  }
};
```

**Why Protected**:
- React's synthetic events don't handle the `capture` attribute properly
- Direct DOM manipulation bypasses React limitations
- This ensures camera opens directly instead of gallery on mobile
- **Memory cleanup prevents "low memory" errors on mobile devices**
- Input elements are properly disposed after each photo capture
- File references are released immediately to free memory

### 2. Dual Storage Architecture (R2 + Supabase) with Memory-Efficient Compression
**Files**:
- `/app/client/src/services/storage.ts` (Abstraction layer)
- `/app/client/src/services/r2-storage.ts` (R2 implementation)

**Protected Architecture**:
```javascript
// Automatic storage selection based on configuration
const useR2 = r2StorageService.isConfigured()

// Primary: Cloudflare R2 (production/alpha)
if (useR2) {
  return await r2StorageService.uploadPhoto(file, reportId, itemId)
} else {
  // Fallback: Supabase Storage (local dev)
  return await supabase.storage.from('property-photos').upload(...)
}
```

**Memory-Efficient Compression**:
```javascript
// Mobile-optimized compression to prevent memory errors
async compressImage(file: File, maxWidth?: number, quality?: number): Promise<File> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const targetMaxWidth = maxWidth ?? (isMobile ? 800 : 1200) // Smaller on mobile
  const targetQuality = quality ?? (isMobile ? 0.7 : 0.8)   // Lower quality on mobile

  // ... compression logic with cleanup
  this.cleanupMemory(canvas, img, objectUrl) // Critical cleanup
}

// Memory cleanup utility
cleanupMemory(canvas, img, objectUrl) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  canvas.width = 0
  canvas.height = 0
  img.src = ''
  img.onload = null
  img.onerror = null
  URL.revokeObjectURL(objectUrl) // Free memory
}
```

**Protected Aspects**:
- **Dual storage system**: R2 primary, Supabase fallback
- **Storage path structure**: `{userId}/{reportId}/{itemId}/{timestamp}.jpg` (consistent across both)
- **Supabase bucket name**: MUST remain 'property-photos' for fallback
- **R2 bucket name**: MUST remain 'cyass-storage' (configured via env vars)
- **Public URL generation**: Different methods for R2 vs Supabase
- **Automatic fallback logic**: Based on R2 configuration presence
- **Error handling**: Comprehensive logging for both storage systems
- **Mobile-optimized compression**: 800px/0.7 quality on mobile vs 1200px/0.8 on desktop
- **Memory cleanup**: Aggressive cleanup to prevent "low memory" errors
- **Object URL revocation**: Immediately revoke URLs after use

**Why Protected**:
- The fallback mechanism enables seamless local development without R2
- The 'property-photos' bucket has working RLS policies for Supabase fallback
- Path structure consistency ensures PDFs work with both storage systems
- Changing bucket names breaks existing functionality
- R2 configuration detection must remain intact for automatic switching
- Both storage systems must maintain the same path structure
- **Memory cleanup prevents crashes on low-RAM mobile devices**
- Mobile-specific compression settings are optimized through testing
- Object URL revocation is critical for preventing memory leaks

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
**Files**:
- `/app/client/src/hooks/useGeolocation.ts` - GPS capture hook
- `/app/client/src/pages/AddProperty.tsx` - GPS validation and warnings

**Requirements**:
- Must capture coordinates with high accuracy
- Must include accuracy indicator
- Must handle permission denial gracefully
- **GPS Accuracy Validation**: Prevents submission if accuracy > 200m
- **Desktop Warning**: Alerts desktop users about limited GPS accuracy
- **Mobile Optimization**: Requests high-accuracy GPS on mobile devices

**Protected Settings**:
```typescript
// AddProperty.tsx - GPS accuracy threshold
if (accuracy && accuracy > 200) {
  throw new Error('GPS accuracy is too poor...')
}

// Desktop warning system (lines 76-94)
// Mobile-specific high-accuracy requirements
```

**Why Protected**:
- 200m accuracy threshold is critical for legal property verification
- Desktop warning prevents poor location quality from browser geolocation
- Mobile users get precise GPS guidance for accurate property location
- Error messages provide clear instructions for users to enable precise location

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