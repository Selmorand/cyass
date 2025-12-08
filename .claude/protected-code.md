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

### 4. Server-Side PDF Generation (Netlify Function)
**Files**:
- `/netlify/functions/generate-pdf.mjs` - Server-side PDF generator
- `/app/client/netlify.toml` - Netlify configuration
- `/app/client/src/pages/ReportSummary.tsx` - Client-side caller

**Protected Architecture**:
```javascript
// ReportSummary.tsx - Calls Netlify Function
const response = await fetch('/.netlify/functions/generate-pdf', {
  method: 'POST',
  body: JSON.stringify({ report, property, creatorRole, creatorName })
})

// generate-pdf.mjs - Server-side processing
// 1. Fetches images from R2 (no CORS!)
// 2. Converts to base64 data URLs
// 3. Generates PDF with embedded images
// 4. Returns PDF to client
```

**Why Protected**:
- **CRITICAL FIX**: R2 public domains (`pub-*.r2.dev`) don't support CORS headers
- Client-side PDF generation was blocked by browser CORS policy
- Server-side fetching bypasses CORS entirely
- Must NOT revert to client-side PDF generation
- Netlify Function path (`../../netlify/functions`) must remain correct
- Function dependencies must be installed during build

**History**:
- Issue discovered: December 2025
- Multiple attempts to fix CORS configuration failed
- Root cause: R2 public domains intentionally don't support CORS
- Solution: Server-side PDF generation via Netlify Functions

### 5. Report Deletion with Manual Cascade
**File**: `/app/client/src/services/reports.ts`
**Function**: `deleteReport()`

**Protected Implementation**:
```javascript
async deleteReport(reportId: string): Promise<void> {
  // Step 1: Verify ownership
  const { data: reportCheck } = await supabase
    .from('reports')
    .select('id, user_id')
    .eq('id', reportId)
    .single()

  if (reportCheck.user_id !== user.id) {
    throw new Error('You do not have permission to delete this report')
  }

  // Step 2: Delete inspection_items (for each room)
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id')
    .eq('report_id', reportId)

  if (rooms && rooms.length > 0) {
    for (const room of rooms) {
      await supabase
        .from('inspection_items')
        .delete()
        .eq('room_id', room.id)
    }
  }

  // Step 3: Delete rooms
  await supabase
    .from('rooms')
    .delete()
    .eq('report_id', reportId)

  // Step 4: Delete report and verify rows were deleted
  const { data: deletedReport } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', user.id)
    .select()

  if (!deletedReport || deletedReport.length === 0) {
    throw new Error('Failed to delete report - 0 rows affected')
  }
}
```

**Why Protected**:
- **CRITICAL**: Database CASCADE DELETE conflicts with RLS policies
- Manual deletion ensures each DELETE is evaluated independently by RLS
- Must delete in order: inspection_items → rooms → report
- Must verify rows were actually deleted (not just error-free)
- Prevents silent deletion failures

**History**:
- Issue discovered: December 2025
- Initial attempt to use CASCADE DELETE failed silently
- RLS policies on child tables blocked cascade deletion
- Solution: Manual cascade with verification

### 6. Video Recorder Memory Management
**File**: `/app/client/src/components/VideoRecorder.tsx`
**Lines**: 174-183

**Protected Implementation**:
```javascript
// Handle recording stop
mediaRecorder.onstop = () => {
  const blob = new Blob(chunksRef.current, { type: mimeType })

  /**
   * ⚠️ CRITICAL - DO NOT REMOVE THIS LINE ⚠️
   * Clears video chunks immediately after blob creation to free memory.
   * Without this, video data exists in BOTH chunksRef AND blob = 2x memory usage.
   * This causes PWA crashes on mobile devices (Samsung Galaxy A73 tested).
   */
  chunksRef.current = []

  // ... rest of handler
}
```

**Why Protected**:
- After creating the blob, chunks are no longer needed
- Without this line, video data exists in TWO places (chunks + blob)
- This doubles memory usage (e.g., 3MB video = 6MB in memory)
- Causes PWA to crash/restart on mobile devices during photo capture
- **Tested on Samsung Galaxy A73 5G** - confirmed fix prevents restarts

**History**:
- Issue discovered: December 2025
- Symptom: PWA restart after recording video + taking 1-2 photos
- Root cause: Video chunks not cleared after blob creation
- Solution: Clear `chunksRef.current = []` immediately after `new Blob()`

## Database Schema Protection

### Critical Tables and RLS Policies
**Location**: `/database/` folder

**CRITICAL - RLS DELETE Policies Must Exist**:

The following policies are REQUIRED and must exist in production:

```sql
-- MUST EXIST: Reports DELETE policy
CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- MUST EXIST: Rooms DELETE policy
CREATE POLICY "rooms_delete" ON rooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = rooms.report_id
      AND reports.user_id = auth.uid()
    )
  );

-- MUST EXIST: Inspection Items DELETE policy
CREATE POLICY "inspection_items_delete" ON inspection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM rooms
      JOIN reports ON reports.id = rooms.report_id
      WHERE rooms.id = inspection_items.room_id
      AND reports.user_id = auth.uid()
    )
  );
```

**Verification**:
After any database reset or migration, verify these policies exist:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('reports', 'rooms', 'inspection_items') AND cmd = 'DELETE';
```

**Why Protected**:
- Missing DELETE policies cause silent deletion failures
- RLS enabled without policies blocks ALL deletes (even with no error)
- These policies were missing in production, causing the deletion bug
- Must be included in all database setups

Do not modify:
- User isolation via RLS
- Storage bucket policies
- Activity tracking schema (if exists)
- DELETE policies (unless adding additional security)

## Override Permission

To modify any protected code, the user must explicitly state:
"I give permission to modify [specific protected area]"

Without this explicit permission, find alternative solutions that don't touch protected code.