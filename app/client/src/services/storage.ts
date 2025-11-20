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

  /**
   * Upload video to Cloudflare R2 (or Supabase fallback)
   *
   * FEATURES:
   * - Uses Cloudflare R2 when configured (alpha/production)
   * - Falls back to Supabase Storage if R2 not configured (local dev)
   * - Organized path: {userId}/{reportId}/{roomId}/walkthrough-{timestamp}.mp4
   * - 50MB file size limit enforced client-side
   * - 2 minute duration limit
   *
   * @param file - Video blob (MP4 format)
   * @param reportId - Report ID
   * @param roomId - Room ID
   * @returns Public URL for the uploaded video
   */
  async uploadVideo(file: Blob, reportId: string, roomId: string): Promise<string> {
    try {
      console.log(`Storage: Video using ${useR2 ? 'Cloudflare R2' : 'Supabase Storage'}`)

      // Validate file size (50MB max)
      const MAX_SIZE = 50 * 1024 * 1024 // 50MB
      if (file.size > MAX_SIZE) {
        throw new Error(`Video file too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 50MB.`)
      }

      if (useR2) {
        // Use Cloudflare R2 (production/alpha)
        return await r2StorageService.uploadVideo(file, reportId, roomId)
      } else {
        // Fallback to Supabase Storage (local dev)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const fileName = `${user.id}/${reportId}/${roomId}/walkthrough-${Date.now()}.mp4`

        const { data, error } = await supabase.storage
          .from('room-videos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'video/mp4'
          })

        if (error) throw error

        const { data: publicUrl } = supabase.storage
          .from('room-videos')
          .getPublicUrl(data.path)

        return publicUrl.publicUrl
      }
    } catch (error) {
      console.error('Storage: uploadVideo failed:', error)
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

  /**
   * Compress image with aggressive memory management for mobile devices
   *
   * MEMORY-EFFICIENT FEATURES:
   * - Detects mobile devices and applies stricter limits
   * - Immediately revokes object URLs after use
   * - Cleans up canvas and image objects
   * - Prevents memory buildup from multiple photos
   * - Optimized for low-RAM devices
   *
   * @param file - The image file to compress
   * @param maxWidth - Maximum width (default: 1200px, 800px on mobile)
   * @param quality - JPEG quality (default: 0.8, 0.7 on mobile)
   */
  async compressImage(file: File, maxWidth?: number, quality?: number): Promise<File> {
    // Detect mobile device for more aggressive compression
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // Mobile-optimized defaults to prevent memory issues
    const targetMaxWidth = maxWidth ?? (isMobile ? 800 : 1200)
    const targetQuality = quality ?? (isMobile ? 0.7 : 0.8)

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        console.warn('Canvas context not available, returning original file')
        resolve(file)
        return
      }

      const img = new Image()
      let objectUrl: string | null = null

      // Error handler
      img.onerror = () => {
        console.error('Failed to load image for compression')
        this.cleanupMemory(canvas, img, objectUrl)
        resolve(file) // Return original on error
      }

      // Success handler
      img.onload = () => {
        try {
          // Calculate dimensions while respecting aspect ratio
          const ratio = Math.min(targetMaxWidth / img.width, targetMaxWidth / img.height, 1)
          canvas.width = Math.floor(img.width * ratio)
          canvas.height = Math.floor(img.height * ratio)

          // Draw compressed image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Convert to blob with quality setting
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })

              console.log('Image compressed successfully:', {
                originalSize: (file.size / 1024).toFixed(2) + 'KB',
                compressedSize: (blob.size / 1024).toFixed(2) + 'KB',
                dimensions: `${canvas.width}x${canvas.height}`,
                isMobile
              })

              // Cleanup memory before resolving
              this.cleanupMemory(canvas, img, objectUrl)
              resolve(compressedFile)
            } else {
              console.warn('Blob creation failed, returning original file')
              this.cleanupMemory(canvas, img, objectUrl)
              resolve(file)
            }
          }, 'image/jpeg', targetQuality)

        } catch (error) {
          console.error('Error during image compression:', error)
          this.cleanupMemory(canvas, img, objectUrl)
          resolve(file) // Return original on error
        }
      }

      // Create object URL and load image
      try {
        objectUrl = URL.createObjectURL(file)
        img.src = objectUrl
      } catch (error) {
        console.error('Failed to create object URL:', error)
        resolve(file)
      }
    })
  },

  /**
   * Clean up memory used during image processing
   * CRITICAL for preventing memory leaks on mobile devices
   */
  cleanupMemory(canvas: HTMLCanvasElement, img: HTMLImageElement, objectUrl: string | null) {
    try {
      // Clear canvas
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      canvas.width = 0
      canvas.height = 0

      // Clear image source
      img.src = ''
      img.onload = null
      img.onerror = null

      // Revoke object URL to free memory
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }

      console.log('Memory cleanup completed')
    } catch (error) {
      console.warn('Error during memory cleanup:', error)
    }
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