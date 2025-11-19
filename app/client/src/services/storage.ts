import { supabase } from './supabase'
import { r2StorageService } from './r2-storage'

// Use R2 if configured, otherwise fallback to Supabase
const useR2 = r2StorageService.isConfigured()

export const storageService = {
  /**
   * Upload photo to Cloudflare R2 (or Supabase fallback)
   *
   * PROTECTED FEATURES:
   * - Uses Cloudflare R2 when configured (alpha/production)
   * - Falls back to Supabase Storage if R2 not configured (local dev)
   * - Organized path: {userId}/{reportId}/{itemId}/{timestamp}.jpg
   * - Enhanced error logging for debugging
   *
   * STORAGE PATH:
   * - Same structure maintained across both storage systems
   * - Error logging system preserved
   */
  async uploadPhoto(file: File, reportId: string, itemId: string): Promise<string> {
    try {
      console.log(`Storage: Using ${useR2 ? 'Cloudflare R2' : 'Supabase Storage'}`)

      if (useR2) {
        // Use Cloudflare R2 (production/alpha)
        return await r2StorageService.uploadPhoto(file, reportId, itemId)
      } else {
        // Fallback to Supabase Storage (local dev)
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
      }
    } catch (error) {
      console.error('Storage: uploadPhoto failed:', error)
      throw error
    }
  },

  async uploadPDF(file: Blob, reportId: string): Promise<string> {
    try {
      console.log(`Storage: PDF using ${useR2 ? 'Cloudflare R2' : 'Supabase Storage'}`)

      if (useR2) {
        // Use Cloudflare R2 (production/alpha)
        return await r2StorageService.uploadPDF(file, reportId)
      } else {
        // Fallback to Supabase Storage (local dev)
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
      }
    } catch (error) {
      console.error('Storage: uploadPDF failed:', error)
      throw error
    }
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
   * Generate external URL for PDF links
   *
   * FEATURES:
   * - For R2: Returns public URL as-is (no signing needed)
   * - For Supabase: Supports both public and signed URLs
   * - 5-year default expiry for signed URLs
   *
   * @param imageUrl - The storage URL (R2 or Supabase)
   * @param useSignedUrl - Whether to use signed URLs (default: false)
   * @param expiresInSeconds - Expiry for signed URLs (default: 5 years)
   * @returns External URL for PDF linking
   */
  async getExternalImageUrl(
    imageUrl: string,
    useSignedUrl: boolean = false,
    expiresInSeconds: number = 157680000 // 5 years
  ): Promise<string> {
    try {
      if (useR2) {
        // R2 URLs are already public and external-accessible
        return await r2StorageService.getExternalImageUrl(imageUrl)
      }

      if (!useSignedUrl) {
        // Return public URL as-is
        return imageUrl
      }

      // Supabase: Extract path from public URL
      const path = this.extractPathFromUrl(imageUrl)
      if (!path) {
        console.warn('Could not extract path from URL:', imageUrl)
        return imageUrl
      }

      // Supabase: Generate signed URL
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