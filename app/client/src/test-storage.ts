import { supabase } from './services/supabase'

export async function testStorageBuckets() {
  console.log('🔍 Testing Storage Configuration...\n')
  
  const results = {
    propertyPhotos: false,
    reportPdfs: false,
    upload: false,
    publicAccess: false
  }
  
  try {
    // Test 1: Check if property-photos bucket exists
    console.log('1. Checking property-photos bucket...')
    const { data: photosData, error: photosError } = await supabase.storage
      .from('property-photos')
      .list('', { limit: 1 })
    
    if (photosError) {
      console.error('   ❌ property-photos bucket error:', photosError.message)
    } else {
      console.log('   ✅ property-photos bucket exists and is accessible')
      results.propertyPhotos = true
    }
    
    // Test 2: Check if report-pdfs bucket exists
    console.log('\n2. Checking report-pdfs bucket...')
    const { data: pdfsData, error: pdfsError } = await supabase.storage
      .from('report-pdfs')
      .list('', { limit: 1 })
    
    if (pdfsError) {
      console.error('   ❌ report-pdfs bucket error:', pdfsError.message)
    } else {
      console.log('   ✅ report-pdfs bucket exists and is accessible')
      results.reportPdfs = true
    }
    
    // Test 3: Try uploading a test image
    if (results.propertyPhotos) {
      console.log('\n3. Testing image upload...')
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      const base64Data = testImageData.split(',')[1]
      const binaryData = atob(base64Data)
      const bytes = new Uint8Array(binaryData.length)
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i)
      }
      const testFile = new File([bytes], 'test.png', { type: 'image/png' })
      
      const testPath = `test/storage-test-${Date.now()}.png`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(testPath, testFile)
      
      if (uploadError) {
        console.error('   ❌ Upload test failed:', uploadError.message)
        if (uploadError.message?.includes('row-level security') || uploadError.message?.includes('policy')) {
          console.error('   💡 Fix: You need to add storage policies. See STORAGE_POLICIES_SETUP.md')
          console.error('   💡 Quick fix: Check your storage configuration')
        }
      } else {
        console.log('   ✅ Successfully uploaded test image')
        results.upload = true
        
        // Test 4: Check if we can get public URL
        console.log('\n4. Testing public URL access...')
        const { data: urlData } = supabase.storage
          .from('property-photos')
          .getPublicUrl(testPath)
        
        if (urlData?.publicUrl) {
          console.log('   ✅ Public URL generated:', urlData.publicUrl)
          results.publicAccess = true
          
          // Clean up test file
          const { error: deleteError } = await supabase.storage
            .from('property-photos')
            .remove([testPath])
          
          if (!deleteError) {
            console.log('   🧹 Test file cleaned up')
          }
        }
      }
    }
    
    // Test 5: List all buckets (if we have permission)
    console.log('\n5. Listing all storage buckets...')
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        console.log('   ⚠️  Cannot list buckets (permission denied - this is normal)')
      } else if (buckets) {
        console.log('   📦 Found buckets:')
        buckets.forEach(bucket => {
          console.log(`      - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
        })
      }
    } catch (e) {
      console.log('   ⚠️  Bucket listing not available')
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 STORAGE TEST SUMMARY:')
  console.log('='.repeat(50))
  console.log(`property-photos bucket: ${results.propertyPhotos ? '✅ Working' : '❌ Not found'}`)
  console.log(`report-pdfs bucket:     ${results.reportPdfs ? '✅ Working' : '❌ Not found'}`)
  console.log(`Upload capability:      ${results.upload ? '✅ Working' : '❌ Failed'}`)
  console.log(`Public access:          ${results.publicAccess ? '✅ Working' : '❌ Failed'}`)
  console.log('='.repeat(50))
  
  const allPassed = Object.values(results).every(v => v)
  if (allPassed) {
    console.log('\n🎉 All storage tests passed! Your buckets are configured correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please check the bucket configuration.')
    console.log('\nMake sure both buckets are:')
    console.log('1. Created with the exact names: "property-photos" and "report-pdfs"')
    console.log('2. Set to PUBLIC access')
    console.log('3. Have the correct MIME type restrictions')
  }
  
  return results
}

// Auto-run the test
testStorageBuckets()