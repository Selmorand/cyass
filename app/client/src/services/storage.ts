import { supabase } from './supabase'

export const storageService = {
  /**
   * CRITICAL: Upload photo to Supabase Storage
   * ⚠️ DO NOT MODIFY without explicit user permission
   * 
   * PROTECTED FEATURES:
   * - Uses 'property-photos' bucket (NOT 'inspection-photos') 
   * - Bucket has working RLS policies
   * - Organized path: {userId}/{reportId}/{itemId}/{timestamp}.jpg
   * - Enhanced error logging for debugging
   * 
   * NEVER CHANGE:
   * - Bucket name from 'property-photos'
   * - Storage path structure
   * - Error logging system
   */
  async uploadPhoto(file: File, reportId: string, itemId: string): Promise<string> {
    try {
      console.log('Storage: Checking authentication...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('Storage: User not authenticated')
        throw new Error('User not authenticated')
      }
      console.log('Storage: User authenticated:', user.id)

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${reportId}/${itemId}/${Date.now()}.${fileExt}`
      console.log('Storage: Uploading to path:', fileName)

      const { data, error } = await supabase.storage
        .from('property-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage: Upload failed:', {
          error: error.message,
          statusCode: error.statusCode,
          cause: error.cause
        })
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log('Storage: Upload successful, getting public URL...')
      const { data: publicUrl } = supabase.storage
        .from('property-photos')
        .getPublicUrl(data.path)

      console.log('Storage: Public URL generated:', publicUrl.publicUrl)
      return publicUrl.publicUrl
    } catch (error) {
      console.error('Storage: uploadPhoto failed:', error)
      throw error
    }
  },

  async uploadPDF(file: Blob, reportId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const fileName = `${user.id}/${reportId}/report-${Date.now()}.pdf`

    const { data, error } = await supabase.storage
      .from('reports')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'application/pdf'
      })

    if (error) throw error

    const { data: publicUrl } = supabase.storage
      .from('reports')
      .getPublicUrl(data.path)

    return publicUrl.publicUrl
  },

  extractPathFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)/)
      return pathMatch ? pathMatch[1] : null
    } catch {
      return null
    }
  },

  async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        }, 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  },

  /**
   * CRITICAL: Generate external URL for PDF links
   * ⚠️ DO NOT MODIFY without explicit user permission
   * 
   * PROTECTED FEATURES:
   * - Generates clickable URLs for PDF thumbnails
   * - Supports both public and signed URLs
   * - 5-year default expiry for long-term access
   * - Uses 'property-photos' bucket with working RLS
   * 
   * @param imageUrl - The Supabase public URL from storage
   * @param useSignedUrl - Whether to use signed URLs (default: false for public bucket)
   * @param expiresInSeconds - Expiry for signed URLs (default: 5 years)
   * @returns External URL for PDF linking
   */
  async getExternalImageUrl(
    imageUrl: string, 
    useSignedUrl: boolean = false, 
    expiresInSeconds: number = 157680000 // 5 years
  ): Promise<string> {
    try {
      if (!useSignedUrl) {
        // Return public URL as-is
        return imageUrl
      }

      // Extract path from public URL
      const path = this.extractPathFromUrl(imageUrl)
      if (!path) {
        console.warn('Could not extract path from URL:', imageUrl)
        return imageUrl
      }

      // Generate signed URL
      const { data, error } = await supabase.storage
        .from('property-photos')
        .createSignedUrl(path, expiresInSeconds)

      if (error) {
        console.warn('Failed to create signed URL:', error)
        return imageUrl // Fallback to public URL
      }

      return data.signedUrl
    } catch (error) {
      console.warn('Error generating external URL:', error)
      return imageUrl // Fallback to original URL
    }
  }
}