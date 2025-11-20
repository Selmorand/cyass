import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { supabase } from './supabase'

// R2 Configuration
const R2_ACCOUNT_ID = import.meta.env.VITE_R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = import.meta.env.VITE_R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = import.meta.env.VITE_R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = import.meta.env.VITE_R2_BUCKET_NAME || ''
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || '' // e.g., https://pub-xxxxx.r2.dev

// Create S3 client configured for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export const r2StorageService = {
  /**
   * Upload photo to Cloudflare R2
   * Organized path: {userId}/{reportId}/{itemId}/{timestamp}.jpg
   * Returns public URL for the uploaded photo
   */
  async uploadPhoto(file: File, reportId: string, itemId: string): Promise<string> {
    try {
      console.log('R2: Checking authentication...')
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('R2: User not authenticated')
        throw new Error('User not authenticated')
      }
      console.log('R2: User authenticated:', user.id)

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${reportId}/${itemId}/${Date.now()}.${fileExt}`
      console.log('R2: Uploading to path:', fileName)

      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer()

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000', // 1 year cache
      })

      await r2Client.send(command)

      // Generate public URL
      const publicUrl = `${R2_PUBLIC_URL}/${fileName}`
      console.log('R2: Upload successful, public URL:', publicUrl)

      return publicUrl
    } catch (error) {
      console.error('R2: uploadPhoto failed:', error)
      throw error
    }
  },

  /**
   * Upload video to Cloudflare R2
   * Organized path: {userId}/{reportId}/{roomId}/walkthrough-{timestamp}.mp4
   * Returns public URL for the uploaded video
   */
  async uploadVideo(file: Blob, reportId: string, roomId: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileName = `${user.id}/${reportId}/${roomId}/walkthrough-${Date.now()}.mp4`
      console.log('R2: Uploading video to path:', fileName)

      // Convert blob to ArrayBuffer
      const fileBuffer = await file.arrayBuffer()

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: 'video/mp4',
        CacheControl: 'public, max-age=31536000', // 1 year cache
      })

      await r2Client.send(command)

      // Generate public URL
      const publicUrl = `${R2_PUBLIC_URL}/${fileName}`
      console.log('R2: Video upload successful:', publicUrl)

      return publicUrl
    } catch (error) {
      console.error('R2: uploadVideo failed:', error)
      throw error
    }
  },

  /**
   * Upload PDF to Cloudflare R2
   * Organized path: {userId}/{reportId}/report-{timestamp}.pdf
   * Returns public URL for the uploaded PDF
   */
  async uploadPDF(file: Blob, reportId: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileName = `${user.id}/${reportId}/report-${Date.now()}.pdf`

      // Convert blob to ArrayBuffer
      const fileBuffer = await file.arrayBuffer()

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: new Uint8Array(fileBuffer),
        ContentType: 'application/pdf',
        CacheControl: 'public, max-age=31536000', // 1 year cache
      })

      await r2Client.send(command)

      // Generate public URL
      const publicUrl = `${R2_PUBLIC_URL}/${fileName}`
      console.log('R2: PDF upload successful:', publicUrl)

      return publicUrl
    } catch (error) {
      console.error('R2: uploadPDF failed:', error)
      throw error
    }
  },

  /**
   * Get external URL for image (for PDF linking)
   * Since R2 uses public URLs, we just return the URL as-is
   */
  async getExternalImageUrl(imageUrl: string): Promise<string> {
    // R2 URLs are already public and external-accessible
    return imageUrl
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

              console.log('R2: Image compressed successfully:', {
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

      console.log('R2: Memory cleanup completed')
    } catch (error) {
      console.warn('R2: Error during memory cleanup:', error)
    }
  },

  /**
   * Check if R2 is properly configured
   */
  isConfigured(): boolean {
    return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_URL)
  }
}
