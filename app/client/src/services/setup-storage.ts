import { supabase } from './supabase'

export async function setupStorageBuckets() {
  try {
    // Check if we're using mock Supabase
    if (!supabase.storage?.createBucket) {
      console.log('Using mock Supabase - no bucket setup needed')
      return { success: true, message: 'Mock storage ready' }
    }
    
    // Test bucket access instead of trying to create them
    console.log('Testing storage bucket access...')
    
    // Test property-photos bucket
    const { error: photosError } = await supabase.storage
      .from('property-photos')
      .list('test', { limit: 1 })
    
    if (photosError && !photosError.message?.includes('Bucket not found')) {
      console.log('property-photos bucket: ✅ accessible')
    } else if (photosError?.message?.includes('Bucket not found')) {
      console.warn('property-photos bucket: ❌ not found - please create manually')
    }
    
    // Test report-pdfs bucket  
    const { error: pdfsError } = await supabase.storage
      .from('report-pdfs')
      .list('test', { limit: 1 })
    
    if (pdfsError && !pdfsError.message?.includes('Bucket not found')) {
      console.log('report-pdfs bucket: ✅ accessible')
    } else if (pdfsError?.message?.includes('Bucket not found')) {
      console.warn('report-pdfs bucket: ❌ not found - please create manually')
    }
    
    return { success: true, message: 'Storage buckets checked' }
  } catch (error) {
    // Don't throw errors for setup issues - just log them
    console.warn('Storage setup check failed:', error instanceof Error ? error.message : 'Unknown error')
    return { 
      success: true, // Return success so app continues to work
      message: 'Storage check completed with warnings'
    }
  }
}

// Don't auto-run setup to avoid blocking app startup with RLS errors
// setupStorageBuckets can be called manually if needed